
import * as parser from "./parser"
import { isNodeInternal } from "./util"

interface CallSite {
  file: string | null
  path: string[]
  alias: string | null
  line?: number
  column?: number
}

export function clean(stack, options: { stripNodeInternals?: boolean } = {}) {
  if (options.stripNodeInternals === undefined || options.stripNodeInternals)
    stack = stack.filter(call => call.file === null || !isNodeInternal(call.file))
  return stack
}

export function parse(e) {
  const split = e.stack.substring(e.constructor.name.length+e.message.length+3).trim().split('\n')
  return split.map(line => {
    try {
      return parser.parse(line.trim())
    } catch (e) {
      return { raw: line }
    }
  })
}

