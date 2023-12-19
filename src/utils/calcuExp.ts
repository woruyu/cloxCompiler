import assert from "assert";
import { Assign, Binary, Call, Expr, Get, Grouping, Literal, Unary, Visitor } from "../expr";
import { TokenName, Value } from "../types";

export class CalculateExpression implements Visitor<Value> {
  calculate(expression:Expr){
    const value = expression.accept(this);
    console.log(`result = ${value}`);
  }

  visitAssignExpr(expr: Assign): Value {
    throw new Error("Method not implemented.");
  }
  visitCallExpr(expr: Call): Value {
    throw new Error("Method not implemented.");
  }
  visitGetExpr(expr: Get): Value {
    throw new Error("Method not implemented.");
  }
  visitBinaryExpr(expr: Binary): Value {
    const left = expr.left.accept(this);
    const right = expr.right.accept(this);
    switch (expr.operator.type) {
      case TokenName.BANG_EQUAL: return left !== right;
      case TokenName.EQUAL_EQUAL: return left === right;
      case TokenName.GREATER:
        assert(typeof left === "number");
        assert(typeof right === "number");
        return left > right;
      case TokenName.GREATER_EQUAL:
        assert(typeof left === "number");
        assert(typeof right === "number");
        return left >= right;
      case TokenName.LESS:
        assert(typeof left === "number");
        assert(typeof right === "number");
        return left < right;
      case TokenName.LESS_EQUAL:
        assert(typeof left === "number");
        assert(typeof right === "number");
        return left <= right;
      case TokenName.MINUS:
        assert(typeof left === "number");
        assert(typeof right === "number");
        return left - right;
      case TokenName.SLASH:
        assert(typeof left === "number");
        assert(typeof right === "number");
        return left / right;
      case TokenName.STAR:
        assert(typeof left === "number");
        assert(typeof right === "number");
        return left * right;
      case TokenName.PLUS:
        if (typeof left === "number" && typeof right === "number") {
          return left + right;
        }

        if (typeof left === "string" && typeof right === "string") {
          return left + right;
        }
        break;
    }
    throw new Error("can't deal x PLUS x")
  }
  visitGroupingExpr(expr: Grouping): Value {
    return expr.expression.accept(this);
  }
  visitLiteralExpr(expr: Literal): Value {
    return expr.value;
  }
  visitUnaryExpr(expr: Unary): Value {
    const right = expr.right.accept(this);

    switch (expr.operator.type) {
      case TokenName.MINUS: {
        assert(typeof right === "number");
        return -right;
      }
      case TokenName.BANG:
        return !right;
    }

    throw new Error("can't deal -(!number)");
  }
}
