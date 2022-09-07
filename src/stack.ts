
import * as parser from "./parser"
import { isNodeInternal } from "./util"

export function clean(stack: parser.Stack) {
  return stack.filter(frame => frame.location.file === null
    || !frame.location.file.startsWith('node:'));
}

export function parse(e: Error): parser.StackFrame[] {
  return e.stack
    .substring(e.constructor.name.length+e.message.length+3)
    .trim()
    .split('\n')
    .map(line => parser.parse(line.trim()));
}

