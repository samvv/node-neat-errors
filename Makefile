
all:
	sh ./unicode.sh
	cat unicode.txt
	npx pegjs src/parser.peg --output parser.js
	node --require=./register test --print-all-code

