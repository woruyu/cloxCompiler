import { readFileSync } from "node:fs";
import { Parser } from "./parse";
import { Interpreter } from "./utils/interpreter";
import { Resolver } from "./utils/resolver";

const parser = new Parser();
const interpreter = new Interpreter();

// const expression = parser.parseExpression(readFileSync("test/expression.ts").toString());
console.log(process.argv[2]);
const statements = parser.parse(readFileSync(process.argv[2]).toString());

console.log(JSON.stringify(statements));
// interpreter.calculate(expression);
const resolver = new Resolver(interpreter);
resolver.resolveStatements(statements);

interpreter.interpreter(statements);
