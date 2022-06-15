
import * as path from "path"
import * as fs from "fs"
import * as cardinal from "cardinal"
import * as chalk from "chalk"
import * as stack from "./stack"
import { upsearchSync, isNodeInternal } from "./util"

function cipherCount(num: number) {
  return Math.ceil(Math.log10(num))
}

function padLeft(str, width: number) {
  str = str.toString()
  return ' '.repeat(width-str.length)+str
}

const gutterStyle = chalk.gray.inverse;

function indent(str: string, amnt: number) {
  return str.split('\n').map(line => ' '.repeat(amnt)+line).join('\n')
}

export function tsInternals() {
  return [/__awaiter/]
}

export interface NeatOptions {
  cwd?: string
  internals?: RegExp[]
  printAllCode?: boolean
  fullStackTrace?: boolean
  nodeDir?: string
}

export class Neat {

  cwd: string
  stack
  printAllCode: boolean
  fullStackTrace: boolean
  nodeDir: string

  constructor(options: NeatOptions = {}) {
    this.cwd = options.cwd || process.cwd()
    this.printAllCode = options.printAllCode !== undefined ? options.printAllCode : process.argv.indexOf('--print-all-code') !== -1
    this.fullStackTrace = options.fullStackTrace !== undefined ? options.fullStackTrace : process.argv.indexOf('--full-stack-trace') !== -1
    this.nodeDir = options.nodeDir || null
  }

  renderCode(pos) {
    let code
    if (!pos.file || !path.isAbsolute(pos.file))
      return ''
    if (isNodeInternal(pos.file))
      //if (this.nodeDir !== null)
        //code = fs.readFileSync(path.join(this.nodeDir, 'lib', pos.file)).toString()
      //else
        return ''
    else {
      if (!fs.existsSync(pos.file))
        return ''
      code = fs.readFileSync(pos.file).toString()
    }
    code = code.split('\n').slice(pos.line-3, pos.line+2).join('\n')
    if (path.extname(pos.file) === '.js') {
      try {
        code = cardinal.highlight(code)
      } catch(e) {

      }
    }
    let output = ''
    const split = code.split('\n')
    const width = Math.max(cipherCount(pos.line+5), 2)
    for (let i = 0; i < split.length; ++i) {
      const line = split[i]
      output += gutterStyle(padLeft(i+pos.line-2, width))
      output += ` ${line}\n`
      if (i === 2)
        output += gutterStyle(' '.repeat(width))+' '+' '.repeat(pos.column-1)+chalk.red('~')+'\n'
    }
    return output
  }

  renderPath(filepath: string) {
    const packageJsonPath = upsearchSync(filepath, 'package.json')
    if (packageJsonPath !== null)
      return chalk.green(require(packageJsonPath).name || path.basename(path.dirname(packageJsonPath)))+'/'+path.relative(path.dirname(packageJsonPath), filepath)
    return path.relative(this.cwd, filepath)
  }

  renderCall(parsed, options = {}) {

    let output = ''
    if (parsed.file)
      output += chalk.gray(` - ${this.renderPath(parsed.file)}:${parsed.line}:${parsed.column}`)
    else
      output += chalk.green(`(native)`)
    if (parsed.path) {
      output += chalk.gray(': ')
      if (parsed.path.isConstructor)
        output += `new ${parsed.path.join('.')}()`
      else 
      output += `${parsed.path.join('.')}`
    }
    output += '\n'

    if (parsed.file) {
      if (isNodeInternal(parsed.file))
        output += '   '+chalk.green(`(${chalk.green('native module')}: ${parsed.file})`)+'\n'
      else
        output += '   '+chalk.yellow(parsed.file)+'\n'
    }
    output += `\n`

    return output
  }

  render(e) {
    let output = ''
    if (e instanceof Error) {
      output += chalk.bgRed.white(e.constructor.prototype.name)+' '+chalk.gray(e.message)+'\n\n'
      let cleaned = stack.parse(e)
      if (!this.fullStackTrace)
        cleaned = stack.clean(cleaned)
      output += this.renderCall(cleaned[0])
      output += indent(this.renderCode(cleaned[0]), 3)+'\n'
      for (const call of cleaned.slice(1)) {
        if (call !== null) {
          output += this.renderCall(call)
          if (this.printAllCode)
            output += indent(this.renderCode(call), 3)+'\n'
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

