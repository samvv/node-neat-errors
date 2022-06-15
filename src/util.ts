
import * as fs from "fs"
import * as path from "path"

export function upsearchSync(filepath: string, filename: string) {
  while (path.dirname(filepath) !== filepath) {
    if (fs.existsSync(path.join(filepath, filename)))
      return path.join(filepath, filename)
    filepath = path.dirname(filepath)
  }
  return null
}

export function isNodeInternal(file) {
  return [
    'async_hooks.js',
    'buffer.js',
    'child_process.js',
    'cluster.js',
    'console.js',
    'constants.js',
    'crypto.js',
    'dgram.js',
    'dns.js',
    'domain.js',
    'events.js',
    'fs.js',
    'http.js',
    'https.js',
    'inspector.js',
    'module.js',
    'net.js',
    'os.js',
    'path.js',
    'process.js',
    'punycode.js',
    'querystring.js',
    'readline.js',
    'repl.js',
    'stream.js',
    'string_decoder.js',
    'sys.js',
    'timers.js',
    'tls.js',
    'tty.js',
    'url.js',
    'util.js',
    'v8.js',
    'vm.js',
    'zlib.js',
    'bootstrap_node.js',
    'errors.js',
    'freelist.js',
    'linkedlist.js',
    'socket_list.js',
    'v8_prof_polyfill.js',
    'v8_prof_processor.js',
    'internal/bootstrap_node.js',
    'internal/buffer.js',
    'internal/child_process.js',
    'internal/errors.js',
    'internal/freelist.js',
    'internal/fs.js',
    'internal/http.js',
    'internal/linkedlist.js',
    'internal/module.js',
    'internal/net.js',
    'internal/process.js',
    'internal/querystring.js',
    'internal/readline.js',
    'internal/readme.md',
    'internal/repl.js',
    'internal/socket_list.js',
    'internal/url.js',
    'internal/util.js',
    'internal/v8_prof_polyfill.js',
    'internal/v8_prof_processor.js',
  ].indexOf(file) !== -1
}

