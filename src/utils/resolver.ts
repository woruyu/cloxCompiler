import { Assign, Binary, Call, Expr, Get, Grouping, Literal, Logical, Unary, Variable, Visitor } from "../element/expr";
import {
  Block,
  Class,
  Expression,
  For,
  Function,
  If,
  Print,
  Return,
  Stmt,
  Var,
  While,
  stmVisitor,
} from "../element/stament";
import { Value } from "../types";
import { Interpreter } from "./interpreter";

export class Resolver implements Visitor<Value>, stmVisitor<void> {
  private interpreter: Interpreter;
  private scopes: Map<string, boolean>[] = [];

  constructor(interpreter: Interpreter) {
    this.interpreter = interpreter;
  }

  resolve(statements: Stmt[] | Expr) {
    for (const stm of statements) {
      this.resolveStmt(stm);
    }
  }

  private resolveStmt(stmt: Stmt): void {
    stmt.accept(this);
  }

  beginScope() {
    this.scopes.push(new Map<string, boolean>());
  }

  endScope() {
    this.scopes.pop();
  }

  visitBlockStmt(stmt: Block): void {
    this.beginScope();
    this.resolve(stmt.statements);
    this.endScope();
  }

  visitClassStmt(stmt: Class): void {
    throw new Error("Method not implemented.");
  }
  visitExpressionStmt(stmt: Expression): void {
    throw new Error("Method not implemented.");
  }
  visitFunctionStmt(stmt: Function): void {
    throw new Error("Method not implemented.");
  }
  visitIfStmt(stmt: If): void {
    throw new Error("Method not implemented.");
  }
  visitPrintStmt(stmt: Print): void {
    throw new Error("Method not implemented.");
  }
  visitReturnStmt(stmt: Return): void {
    throw new Error("Method not implemented.");
  }
  visitVarStmt(stmt: Var): void {
    this.declare(stmt.name);
    if (stmt.initializer != null) {
      this.resolve(stmt.initializer);
    }
    this.define(stmt.name);
  }
  visitWhileStmt(stmt: While): void {
    throw new Error("Method not implemented.");
  }
  visitForStmt(stmt: For): void {
    throw new Error("Method not implemented.");
  }
  visitAssignExpr(expr: Assign): Value {
    throw new Error("Method not implemented.");
  }
  visitBinaryExpr(expr: Binary): Value {
    throw new Error("Method not implemented.");
  }
  visitCallExpr(expr: Call): Value {
    throw new Error("Method not implemented.");
  }
  visitGetExpr(expr: Get): Value {
    throw new Error("Method not implemented.");
  }
  visitGroupingExpr(expr: Grouping): Value {
    throw new Error("Method not implemented.");
  }
  visitLiteralExpr(expr: Literal): Value {
    throw new Error("Method not implemented.");
  }
  visitLogicalExpr(expr: Logical): Value {
    throw new Error("Method not implemented.");
  }
  visitUnaryExpr(expr: Unary): Value {
    throw new Error("Method not implemented.");
  }
  visitVariableExpr(expr: Variable): Value {
    throw new Error("Method not implemented.");
  }
}
