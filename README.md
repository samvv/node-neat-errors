Neat Errors for NodeJs
======================

This is a really neat error reporter for NodeJS, featuring code extraction,
stack cleaning, syntax highlighting and tweakable output out-of-the-box.

<a href="http://nl.tinypic.com?ref=jsyumt" target="_blank"><img src="http://i64.tinypic.com/jsyumt.png" border="0" alt="Image and video hosting by TinyPic"></a>

## Usage

Easiest way is to 

If you'd like your application to pretty-print errors no matter what, require
`neat-errors/register` at the top of your application entry point:

```ts
import "neat-errors/register";

// do your stuff here ...
```

If not possible in your case, then you can use the full programmatic API:

```ts
import Neat from "neat-errors"

const neat = new Neat()

process.on('uncaughtException', e => {
  console.error(neat.render(e));
  process.exit(1);
})
```

Unless specified manually, `neat-errors` will check for the following options in
`process.argv` and adapt its behaviour accodingly:

 - **--full-stack-trace**: do not clean the stack trace before rendering
 - **--print-all-code** print a code excerpt for all call sites in the stack trace

Other than that, the following arguments can be supplied to `Neat` as an options object:

 - **cwd:** current working directory to make paths relative to. 
 - **printAllCode:** defaults to checking `process.argv` for its value
 - **fullStackTrace**: defaults to checking `process.argv` for its value

## Contributing

Suggestions? Found a bug? You are more than welcome to contribute! Please
browse the [current issues](https://github.com/samvv/node-neat-error/issues) to
check if someone else got to it first before submitting a new one.

## Related projects

 - [pretty-error](https://github.com/AriaMinaei/pretty-error): does not print the source file

## License

The MIT License

