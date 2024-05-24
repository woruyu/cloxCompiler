import assert from "node:assert";
import { Assign, Binary, Call, Expr, Get, Grouping, Literal, Logical, SET, This, Unary, Variable, Visitor } from "../element/expr";
import { ReturnException, Token, TokenName, Value } from "../types";
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
import { Environment } from "./environment";
import { LoxCallable, LoxFunction } from "../element/loxFunction";
import { LoxClass } from "../element/loxClass";
import { LoxInstance } from "../element/loxInstance";

export class Interpreter implements Visitor<Value>, stmVisitor<void> {
  public globals = new Environment();
  public environment = this.globals;
  public locals = new Map<Expr, number>();

  constructor() {
    const clock = new (class extends LoxCallable {
      arity() {
        return 0;
      }
      call(_: Interpreter, __: Value[]) {
        return Date.now() / 1000;
      }
      toString() {
        return "<native fn clock>";
      }
    })();
    this.globals.define("clock", clock);
  }
  visitThisExpr(expr: This): Value {
    return this.lookUpVariable(expr.keyword,expr);
  }
  visitSetExpr(expr: SET): Value {
    const obj = expr.object.accept(this);
    if(!(obj instanceof LoxInstance)){
      throw new Error(`${expr.name.text} isn't a instances, can't have fields.`);
    }
    const value = expr.value.accept(this);

    obj.set(expr.name,value);
    return value;
  }

  resolve(expr: Expr, depth: number) {
    this.locals.set(expr, depth);
  }

  lookUpVariable(name: Token, expr: Expr) {
    const distance = this.locals.get(expr);
    return distance == null ? this.globals.get(name) : this.environment.getAt(distance, name.text!);
  }

  visitForStmt(stmt: For): void {
    if (stmt.initializer instanceof Stmt) {
      stmt.initializer.accept(this);
    } else {
      stmt.initializer?.accept(this);
    }

    const condition = stmt.condition ?? new Literal(true);
    while (condition.accept(this)) {
      stmt.body.accept(this);
      stmt.increment?.accept(this);
    }
  }

  visitLogicalExpr(expr: Logical): Value {
    const left = expr.left.accept(this);
    if (expr.operator.type === TokenName.AND) {
      if (!left) return left;
    } else if (expr.operator.type === TokenName.OR && left) return left;

    return expr.right.accept(this);
  }

  visitBlockStmt(stmt: Block): void {
    const curEnv = new Environment(this.environment);
    this.environment = curEnv;
    for (const stm of stmt.statements) {
      stm.accept(this);
    }
    this.environment = this.environment.enclosing!;
  }
  visitClassStmt(stmt: CLASS): void {
    this.environment.define(stmt.name.text!,null);
    const methods = new Map<string,LoxFunction>();

    for(const fun of stmt.methods){
      const method = new LoxFunction(fun,this.environment);
      methods.set(fun.name.text!,method);
    }

    const klass = new LoxClass(stmt.name.text!,methods);
    this.environment.assign(stmt.name,klass);
  }
  visitExpressionStmt(stmt: Expression): void {
    stmt.expression.accept(this);
  }
  visitFunctionStmt(stmt: Function): void {
    const func = new LoxFunction(stmt, this.environment);
    this.environment.define(stmt.name.text!, func);
  }
  visitIfStmt(stmt: If): void {
    if (stmt.condition.accept(this)) {
      stmt.thenBranch.accept(this);
    } else if (stmt.elseBranch !== null) {
      stmt.elseBranch.accept(this);
    }
  }
  visitPrintStmt(stmt: Print): void {
    const value = stmt.expression.accept(this);
    console.log(value?.toString());
  }
  visitReturnStmt(stmt: Return): void {
    let value = null;
    if (stmt.value !== null) value = stmt.value.accept(this);

    throw new ReturnException(value);
  }
  visitVarStmt(stmt: Var): void {
    const value = stmt.initializer ? stmt.initializer.accept(this) : null;
    this.environment.define(stmt.name.text!, value);
  }
  visitWhileStmt(stmt: While): void {
    while (stmt.condition.accept(this)) {
      stmt.body.accept(this);
    }
  }
  visitVariableExpr(expr: Variable): Value {
    return this.lookUpVariable(expr.name, expr);
  }

  visitAssignExpr(expr: Assign): Value {
    const value = expr.value.accept(this);

    const distance = this.locals.get(expr);
    if (distance == null) {
      this.globals.assign(expr.name, value);
    } else {
      this.environment.assignAt(distance, expr.name, value);
    }
    return value;
  }
  visitCallExpr(expr: Call): Value {
    const loxFunc = expr.callee.accept(this);

    const args = new Array<Value>();
    for (const arg of expr.args) {
      args.push(arg.accept(this));
    }

    const funcname = (expr.callee as Variable).name.text;
    assert(loxFunc instanceof LoxCallable, `can't find ${funcname} function`);
    assert(loxFunc.arity() === args.length, `func ${funcname} args[${loxFunc.arity()}], but get ${args.length}`);

    return loxFunc.call(this, args);
  }
  visitGetExpr(expr: Get): Value {
    const obj = expr.object.accept(this);
    if(obj instanceof LoxInstance){
      return obj.get(expr.name);
    }else{
      throw new Error(`${expr.name.text}, Only instances have properties.`);
    }
  }
  visitBinaryExpr(expr: Binary): Value {
    const left = expr.left.accept(this);
    const right = expr.right.accept(this);
    switch (expr.operator.type) {
      case TokenName.BANG_EQUAL: {
        return left !== right;
      }
      case TokenName.EQUAL_EQUAL: {
        return left === right;
      }
      case TokenName.GREATER: {
        assert(typeof left === "number");
        assert(typeof right === "number");
        return left > right;
      }
      case TokenName.GREATER_EQUAL: {
        assert(typeof left === "number");
        assert(typeof right === "number");
        return left >= right;
      }
      case TokenName.LESS: {
        assert(typeof left === "number");
        assert(typeof right === "number");
        return left < right;
      }
      case TokenName.LESS_EQUAL: {
        assert(typeof left === "number");
        assert(typeof right === "number");
        return left <= right;
      }
      case TokenName.MINUS: {
        assert(typeof left === "number");
        assert(typeof right === "number");
        return left - right;
      }
      case TokenName.SLASH: {
        assert(typeof left === "number");
        assert(typeof right === "number");
        return left / right;
      }
      case TokenName.STAR: {
        assert(typeof left === "number");
        assert(typeof right === "number");
        return left * right;
      }
      case TokenName.PLUS: {
        if (typeof left === "number" && typeof right === "number") {
          return left + right;
        }

        if (typeof left === "string" && typeof right === "string") {
          return left + right;
        }
        throw new Error(`can't deal ${left} + ${right}`);
      }
    }
    throw new Error(`can't deal ${left} PLUS ${right}`);
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
      case TokenName.BANG: {
        return !right;
      }
    }

    throw new Error("can't deal -(!number)");
  }

  calculate(expression: Expr) {
    const value = expression.accept(this);
    console.log(`result = ${value}`);
  }

  interpreter(statements: Stmt[]) {
    for (const statement of statements) {
      statement.accept(this);
    }
  }

  executeBlock(statements: Stmt[], env: Environment) {
    const pre = this.environment;

    try {
      this.environment = env;
      for (const stm of statements) {
        stm.accept(this);
      }
    } finally {
      this.environment = pre;
    }
  }
}
