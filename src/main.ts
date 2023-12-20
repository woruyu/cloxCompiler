import { readFileSync } from "node:fs";
import { Parser } from "./parse";
import { Interpreter } from "./utils/interpreter";


const parser = new Parser();
const interpreter = new Interpreter();

// const expression = parser.parseExpression(readFileSync("test/expression.ts").toString());
console.log(process.argv[2]);
const statement = parser.parse(readFileSync(process.argv[2]).toString());


console.log(JSON.stringify(statement));
// interpreter.calculate(expression);
interpreter.interpreter(statement);
