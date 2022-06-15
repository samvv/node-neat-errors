
import Neat from "./"

const neat = new Neat()

function processErrorAndExit(e) {
  console.error(neat.render(e))
  process.exit(1);
}

process.on('uncaughtException', processErrorAndExit)
process.on('unhandledRejection', processErrorAndExit)

