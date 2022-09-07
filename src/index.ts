
import * as path from "path"
import * as fs from "fs"
import cardinal from "cardinal"
import chalk from "chalk"
import * as stack from "./stack"
import { upsearchSync, isNodeInternal } from "./util"
import { SourceLocation, StackFrame } from "./parser"

function cipherCount(num: number) {
  return Math.ceil(Math.log10(num))
}

function padLeft(str: string, width: number) {
  return ' '.repeat(width-str.length)+str
}

const gutterStyle = chalk.white.inverse;

function indent(str: string, amnt: number) {
  return str.split('\n').map(line => ' '.repeat(amnt)+line).join('\n')
}

export interface NeatOptions {
  cwd?: string
  internals?: RegExp[]
  printCode?: boolean
  fullStackTrace?: boolean
  nodeDir?: string
}

export class JsonRenderer {

  public render(e: any) {
    if (e instanceof Error) {
      const cleaned = stack.parse(e);
      return JSON.stringify(cleaned.map(frame => frame), undefined, 2);
    }
  }

}

export class Neat {

  private cwd: string
  private printCode: boolean
  private fullStackTrace: boolean
  private nodeDir: string

  public constructor(options: NeatOptions = {}) {
    this.cwd = options.cwd || process.cwd()
    this.printCode = options.printCode ?? process.argv.indexOf('--no-print-code') === -1
    this.fullStackTrace = options.fullStackTrace ?? process.argv.indexOf('--full-stack-trace') !== -1
    this.nodeDir = options.nodeDir || null
  }

  public renderCode(pos: SourceLocation) {
    let code: string;
    if (!pos.file || !path.isAbsolute(pos.file)) {
      return ''
    }
    if (isNodeInternal(pos.file)) {
      //if (this.nodeDir !== null)
        //code = fs.readFileSync(path.join(this.nodeDir, 'lib', pos.file)).toString()
      //else
        return ''
    } else {
      if (!fs.existsSync(pos.file))
        return ''
      code = fs.readFileSync(pos.file).toString()
    }
    code = code.split('\n').slice(pos.line-3, pos.line+2).join('\n')
    if (path.extname(pos.file) === '.js') {
      try {
        code = cardinal.highlight(code)
      } catch(e) {
        // pass
      }
    }
    let output = ''
    const split = code.split('\n')
    const width = Math.max(cipherCount(pos.line+5), 2)
    for (let i = 0; i < split.length; ++i) {
      const line = split[i]
      output += gutterStyle((i+pos.line-2).toString().padStart(width))
      output += ` ${line}\n`
      if (i === 2)
        output += gutterStyle(' '.repeat(width))+' '+' '.repeat(pos.column-1)+chalk.red('~')+'\n'
    }
    return output
  }

  public renderPath(filepath: string) {
    const packageJsonPath = upsearchSync(filepath, 'package.json')
    if (packageJsonPath !== null)
      return chalk.green(require(packageJsonPath).name || path.basename(path.dirname(packageJsonPath)))+'/'+path.relative(path.dirname(packageJsonPath), filepath)
    return path.relative(this.cwd, filepath)
  }

  public renderFrame(parsed: StackFrame, options = {}) {

    let output = ''
    if (parsed.location) {
      output += chalk.gray(` - ${this.renderPath(parsed.location.file)}:${parsed.location.line}:${parsed.location.column}`)
    } else {
      output += chalk.green(`(native)`)
    }

    if (parsed.path) {
      output += chalk.gray(': ')
      if (parsed.path.isConstructor) {
        output += `new ${parsed.path.join('.')}()`
      } else {
        output += `${parsed.path.join('.')}`
      }
    }
    output += '\n'

    if (parsed.location.file) {
      if (isNodeInternal(parsed.location.file)) {
        output += '   '+chalk.green(`(${chalk.green('native module')}: ${parsed.location.file})`)+'\n'
      } else {
        output += '   '+chalk.yellow(parsed.location.file)+'\n'
      }
    }
    output += `\n`

    return output
  }

  public render(e: any) {
    let output = ''
    if (e instanceof Error) {
      output += chalk.bgRed.white(e.constructor.prototype.name)+' '+chalk.gray(e.message)+'\n\n'
      let cleaned = stack.parse(e)
      if (!this.fullStackTrace)
        cleaned = stack.clean(cleaned)
      output += this.renderFrame(cleaned[0])
      output += indent(this.renderCode(cleaned[0].location), 3)+'\n'
      for (const frame of cleaned.slice(1)) {
        output += this.renderFrame(frame)
        if (this.printCode) {
          output += indent(this.renderCode(frame.location), 3)+'\n'
        }
      }
    }

    function renderUnrecognized(stackLine) {
      output += chalk.gray(` - ${chalk.bold.red(stackLine)}`)
    }

    return output
  }

}

export default Neat 

