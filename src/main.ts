import { readFileSync } from "node:fs";
import { Parser } from "./parse";

const parser = new Parser();

const expression = parser.parse(readFileSync("test/1234.ts").toString());

console.log(JSON.stringify(expression));
