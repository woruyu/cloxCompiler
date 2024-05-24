import assert from "node:assert";
import { Assign, Binary, Call, Expr, Get, Grouping, Literal, Logical, SET, This, Unary, Variable, Visitor } from "../element/expr";
import {
  Block,
  CLASS,
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
import { Token, Value } from "../types";
import { Interpreter } from "./interpreter";

enum FunctionType {
  NONE,
  FUNCTION,
  METHOD
}

enum ClassType {
  NONE,
  CLASS
}

enum VarStatus {
  declared,
  initialized,
  used,
}

export class Resolver implements Visitor<Value>, stmVisitor<void> {
  private interpreter: Interpreter;
  private scopes: Map<string, VarStatus>[] = [];
  private currentFunction = FunctionType.NONE;
  private currentClass = ClassType.NONE;

  constructor(interpreter: Interpreter) {
    this.interpreter = interpreter;
  }
  visitThisExpr(expr: This): Value {
    this.resolveLocal(expr, expr.keyword);
    return null;
  }
  visitSetExpr(expr: SET): Value {
    expr.value.accept(this);
    expr.object.accept(this);
    return null;
  }

  resolveStatements(statements: Stmt[]) {
    for (const stm of statements) {
      stm.accept(this);
    }
  }

  beginScope() {
    this.scopes.push(new Map<string, VarStatus>());
  }

  endScope() {
    const scope = this.scopes.pop();
    if (scope) {
      for (const [key, value] of scope) {
        if (value !== VarStatus.used) {
          throw new Error(`Varible ${key} nerver used.`);
        }
      }
    }
  }

  declare(name: Token) {
    const scope = this.scopes.at(-1);
    if (scope === undefined) return;

    if (scope.has(name.text!)) {
      throw new Error("Already a variable with this name in this scope.");
    }

    scope.set(name.text!, VarStatus.declared);
  }

  define(name: Token) {
    const scope = this.scopes.at(-1);
    if (scope === undefined) return;
    scope.set(name.text!, VarStatus.initialized);
  }

  resolveLocal(expr: Expr, name: Token): void {
    for (let i = this.scopes.length - 1; i >= 0; i--) {
      if (this.scopes[i].has(name.text!)) {
        this.scopes[i].set(name.text!, VarStatus.used);
        this.interpreter.resolve(expr, this.scopes.length - 1 - i);
        return;
      }
    }
  }

  resolveFunction(func: Function, type: FunctionType) {
    this.scopes.at(-1)?.set(func.name.text!,VarStatus.initialized);

    const enclosingFunction = this.currentFunction;
    this.currentFunction = type;
    this.beginScope();
    for (const param of func.params) {
      this.declare(param);
      this.define(param);
    }
    this.resolveStatements(func.body);
    this.endScope();
    this.currentFunction = enclosingFunction;
  }

  visitBlockStmt(stmt: Block): void {
    this.beginScope();
    this.resolveStatements(stmt.statements);
    this.endScope();
  }

  visitClassStmt(stmt: CLASS): void {
    const enclosingClass = this.currentClass;
    this.currentClass = ClassType.CLASS;
    this.declare(stmt.name);
    this.define(stmt.name);

    this.beginScope();
    this.scopes.at(-1)?.set("this", VarStatus.used);

    for(const method of stmt.methods){
      this.resolveFunction(method,FunctionType.METHOD)
    }

    this.endScope();

    this.currentClass = enclosingClass;
  }
  visitExpressionStmt(stmt: Expression): void {
    stmt.expression.accept(this);
  }
  visitFunctionStmt(stmt: Function): void {
    this.declare(stmt.name);
    this.define(stmt.name);

    this.resolveFunction(stmt, FunctionType.FUNCTION);
  }
  visitIfStmt(stmt: If): void {
    stmt.condition.accept(this);
    stmt.thenBranch.accept(this);
    if (stmt.elseBranch != null) {
      stmt.elseBranch.accept(this);
    }
  }
  visitPrintStmt(stmt: Print): void {
    stmt.expression.accept(this);
  }
  visitReturnStmt(stmt: Return): void {
    if (this.currentFunction == FunctionType.NONE) {
      throw new Error("Can't return from top-level code.");
    }

    if (stmt.value !== null) {
      stmt.value.accept(this);
    }
  }
  visitVarStmt(stmt: Var): void {
    this.declare(stmt.name);
    if (stmt.initializer != null) {
      stmt.initializer.accept(this);
    }
    this.define(stmt.name);
  }
  visitWhileStmt(stmt: While): void {
    stmt.condition.accept(this);
    stmt.body.accept(this);
  }
  visitForStmt(stmt: For): void {
    if (stmt.initializer) {
      if (stmt.initializer instanceof Stmt) {
        stmt.initializer.accept(this);
      } else {
        stmt.initializer.accept(this);
      }
    }

    if (stmt.condition) {
      if (stmt.condition instanceof Stmt) {
        stmt.condition.accept(this);
      } else {
        stmt.condition.accept(this);
      }
    }

    if (stmt.increment) {
      if (stmt.increment instanceof Stmt) {
        stmt.increment.accept(this);
      } else {
        stmt.increment.accept(this);
      }
    }

    stmt.body.accept(this);
  }
  visitAssignExpr(expr: Assign): Value {
    expr.value.accept(this);
    this.resolveLocal(expr, expr.name);

    return null;
  }
  visitBinaryExpr(expr: Binary): Value {
    expr.left.accept(this);
    expr.right.accept(this);

    return null;
  }
  visitCallExpr(expr: Call): Value {
    expr.callee.accept(this);
    assert(expr.callee instanceof Variable || expr.callee instanceof Get);

    for (const arg of expr.args) {
      arg.accept(this);
    }

    return null;
  }
  visitGetExpr(expr: Get): Value {
    expr.object.accept(this);
    return null;
  }
  visitGroupingExpr(expr: Grouping): Value {
    expr.expression.accept(this);
    return null;
  }
  visitLiteralExpr(expr: Literal): Value {
    return expr.value;
  }
  visitLogicalExpr(expr: Logical): Value {
    expr.left.accept(this);
    expr.right.accept(this);
    return null;
  }
  visitUnaryExpr(expr: Unary): Value {
    expr.right.accept(this);
    return null;
  }
  visitVariableExpr(expr: Variable): Value {
    const scope = this.scopes.at(-1);
    if (scope !== undefined && scope.get(expr.name.text!) === VarStatus.declared) {
      throw new Error("Can't read local variable without initializer.");
    }
    this.resolveLocal(expr, expr.name);
    return null;
  }
}
