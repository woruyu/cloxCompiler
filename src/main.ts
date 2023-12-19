import { readFileSync } from "node:fs";
import { Parser } from "./parse";
import { CalculateExpression } from "./utils/calcuExp";

const parser = new Parser();

const expression = parser.parse(readFileSync("test/1234.ts").toString());

const expressionInter = new CalculateExpression();

expressionInter.calculate(expression);
