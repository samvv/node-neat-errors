
all:
	npx pegjs src/parser.peg
	tsc
	node --require=./register test --print-all-code

