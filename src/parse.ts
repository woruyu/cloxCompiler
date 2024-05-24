import assert from "node:assert";
import { Assign, Binary, Call, Expr, Get, Grouping, Literal, Logical, SET, This, Unary, Variable } from "./element/expr";
import { lexAll } from "./lex";
import { Token, TokenName } from "./types";
import { exit } from "node:process";
import { Block, Expression, For, If, Print, Stmt, Var, While, Function, Return, CLASS } from "./element/stament";

export class Parser {
  private tokens = new Array<Token>();
  private statements = new Array<Stmt>();
  private current = 0;

  parse(content: string) {
    this.tokens = lexAll(content);
    this.current = 0;
    // console.log(this.tokens);

    try {
      while (!this.isAtEnd()) {
        if (this.matchToken(TokenName.NOTE)) continue;
        this.statements.push(this.statement());
      }
    } catch (error) {
      if (error instanceof ParseError) {
        console.log(
          `in line ${error.token.pos.line}, column ${error.token.pos.column}, ${error.token.tokenName}---${error.msg}`
        );
        console.log(error.stack);
      } else {
        console.log(error);
      }
      exit();
    }

    return this.statements;
  }

  parseExpression(content: string) {
    this.tokens = lexAll(content);
    this.current = 0;
    console.log(this.tokens);

    try {
      return this.expression();
    } catch (error) {
      if (error instanceof ParseError) {
        console.log(
          `in line ${error.token.pos.line}, column ${error.token.pos.column}, ${error.token.tokenName}---${error.msg}`
        );
        console.log(error.stack);
      } else {
        console.log(error);
      }
      exit();
    }
  }

  statement(): Stmt {
    if (this.matchToken(TokenName.PRINT)) return this.printStatement();
    if (this.matchToken(TokenName.VAR)) return this.varStatement();
    if (this.matchToken(TokenName.LEFT_BRACE)) return new Block(this.blockStatements());
    if (this.matchToken(TokenName.IF)) return this.ifStatement();
    if (this.matchToken(TokenName.WHILE)) return this.whileStatement();
    if (this.matchToken(TokenName.FOR)) return this.forStatement();
    if (this.matchToken(TokenName.FUNCTION)) return this.funcStatement();
    if (this.matchToken(TokenName.RETURN)) return this.returnStatement();
    if (this.matchToken(TokenName.CLASS)) return this.classStatement();

    return this.expressionStatement();
  }

  classStatement() {
    const name = this.consume(TokenName.Identifier, "Expect class name.");
    this.consume(TokenName.LEFT_BRACE, "Expect '{' before class body.");

    const methods = new Array<Function>();
    while (!this.check(TokenName.RIGHT_BRACE) && !this.isAtEnd()) {
      methods.push(this.funcStatement());
    }

    this.consume(TokenName.RIGHT_BRACE, "Expect '}' after class body.");

    return new CLASS(name, methods);
  }

  returnStatement() {
    let value = null;

    if (!this.check(TokenName.SEMICOLON)) {
      value = this.expression();
    }

    this.consume(TokenName.SEMICOLON, "Expect ';' after return value.");
    return new Return(value);
  }

  funcStatement() {
    const name = this.consume(TokenName.Identifier, "Expect function name.");
    this.consume(TokenName.LEFT_PAREN, "Expect '(' after function name.");

    const args = new Array<Token>();
    if (!this.check(TokenName.RIGHT_PAREN)) {
      do {
        args.push(this.consume(TokenName.Identifier, "Expect parameter name."));
      } while (this.matchToken(TokenName.COMMA));
    }
    this.consume(TokenName.RIGHT_PAREN, "Expect ')' after parameters.");
    this.consume(TokenName.LEFT_BRACE, "Expect '{' before function body.");
    const body = this.blockStatements();

    return new Function(name, args, body);
  }

  forStatement() {
    this.consume(TokenName.LEFT_PAREN, "Expect '(' after for");
    let initializer;
    if (this.matchToken(TokenName.SEMICOLON)) {
      initializer = null;
    } else if (this.matchToken(TokenName.VAR)) {
      initializer = this.varStatement();
    } else {
      initializer = this.expressionStatement();
    }

    let condition = null;
    if (!this.check(TokenName.SEMICOLON)) {
      condition = this.expression();
    }
    this.consume(TokenName.SEMICOLON, "Expect ';' after for(;condition;) condition.");

    let increment = null;
    if (!this.check(TokenName.RIGHT_PAREN)) {
      increment = this.expression();
    }
    this.consume(TokenName.RIGHT_PAREN, "Expect ')' after for end");

    const body = this.statement();
    return new For(initializer, condition, body, increment);
  }

  whileStatement() {
    this.consume(TokenName.LEFT_PAREN, "Expect '(' after while");
    const condition = this.expression();
    this.consume(TokenName.RIGHT_PAREN, "Expect ')' after while condition.");

    const body = this.statement();
    return new While(condition, body);
  }

  ifStatement() {
    this.consume(TokenName.LEFT_PAREN, "Expect '(' after 'if'.");
    const condition = this.expression();
    this.consume(TokenName.RIGHT_PAREN, "Expect ')' after if condition.");

    const thenBranch = this.statement();
    let elseBranch = null;
    if (this.matchToken(TokenName.ELSE)) {
      elseBranch = this.statement();
    }

    return new If(condition, thenBranch, elseBranch);
  }

  blockStatements() {
    const statements = new Array<Stmt>();

    while (!this.check(TokenName.RIGHT_BRACE) && !this.isAtEnd()) {
      statements.push(this.statement());
    }
    this.matchToken(TokenName.RIGHT_BRACE);
    return statements;
  }

  varStatement() {
    const varName = this.consume(TokenName.Identifier, "expect var name");
    let initialize: Expr | null = null;
    if (this.matchToken(TokenName.EQUAL)) {
      initialize = this.expression();
    }
    this.consume(TokenName.SEMICOLON, "Expect ';' after variable declaration");

    return new Var(varName, initialize);
  }

  printStatement() {
    const value = this.expression();
    this.consume(TokenName.SEMICOLON, "Expect ';' after print expression.");
    return new Print(value);
  }

  expressionStatement() {
    const expr = this.expression();
    this.consume(TokenName.SEMICOLON, "Expect ';' after expression.");
    return new Expression(expr);
  }

  matchToken(...types: TokenName[]): boolean {
    for (const type of types) {
      if (this.check(type)) {
        this.advance();
        return true;
      }
    }
    return false;
  }

  consume(type: TokenName, msg: string) {
    if (this.check(type)) return this.advance();
    throw new ParseError(this.peek(), msg);
  }

  check(type: TokenName) {
    if (this.isAtEnd()) return false;
    return this.peek().type === type;
  }

  advance() {
    if (!this.isAtEnd()) this.current++;
    return this.previous();
  }

  previous() {
    return this.tokens[this.current - 1];
  }

  isAtEnd() {
    return this.peek().type === TokenName.EOF;
  }

  peek() {
    return this.tokens[this.current];
  }

  expression(): Expr {
    const leftExpr = this.or();
    if (this.matchToken(TokenName.EQUAL)) {
      const equals = this.previous();
      const value = this.expression();

      if (leftExpr instanceof Variable) {
        return new Assign(leftExpr.name, value);
      } else if(leftExpr instanceof Get){
        return new SET(leftExpr.object, leftExpr.name, value);
      }else if(leftExpr instanceof This){
        return new Assign(leftExpr.keyword, value);
      }
    }

    return leftExpr;
  }

  private or() {
    let expr = this.and();

    while (this.matchToken(TokenName.OR)) {
      const operator = this.previous();
      const right = this.and();
      expr = new Logical(expr, operator, right);
    }

    return expr;
  }

  private and() {
    let expr = this.equality();

    while (this.matchToken(TokenName.AND)) {
      const operator = this.previous();
      const right = this.equality();
      expr = new Logical(expr, operator, right);
    }

    return expr;
  }

  equality(): Expr {
    let expr = this.comparison();
    while (this.matchToken(TokenName.BANG_EQUAL, TokenName.EQUAL_EQUAL)) {
      const operator: Token = this.previous();
      const right = this.comparison();

      expr = new Binary(expr, operator, right);
    }
    return expr;
  }

  comparison(): Expr {
    let expr = this.term();

    while (this.matchToken(TokenName.GREATER, TokenName.LESS, TokenName.LESS_EQUAL, TokenName.GREATER_EQUAL)) {
      const operator: Token = this.previous();
      const right = this.term();

      expr = new Binary(expr, operator, right);
    }
    return expr;
  }

  term(): Expr {
    let expr = this.factor();

    while (this.matchToken(TokenName.MINUS, TokenName.PLUS)) {
      const operator: Token = this.previous();
      const right = this.factor();

      expr = new Binary(expr, operator, right);
    }
    return expr;
  }

  factor(): Expr {
    let expr = this.unary();
    while (this.matchToken(TokenName.SLASH, TokenName.STAR)) {
      const operator: Token = this.previous();
      const right = this.unary();

      expr = new Binary(expr, operator, right);
    }
    return expr;
  }

  unary(): Expr {
    while (this.matchToken(TokenName.BANG, TokenName.MINUS)) {
      const operator: Token = this.previous();
      const right = this.unary();
      return new Unary(operator, right);
    }
    return this.call();
  }

  call() {
    let expr = this.primary();

    while (true) {
      if (this.matchToken(TokenName.LEFT_PAREN)) {
        const args = new Array<Expr>();
        if (!this.check(TokenName.RIGHT_PAREN)) {
          do {
            args.push(this.expression());
          } while (this.matchToken(TokenName.COMMA));
        }
        this.consume(TokenName.RIGHT_PAREN, "Expect after call args ')'");
        expr = new Call(expr, args);
      } else if (this.matchToken(TokenName.DOT)) {
        const name = this.consume(TokenName.Identifier, "Expect property name after '.'.");
        expr = new Get(expr, name);
      } else {
        break;
      }
    }
    return expr;
  }

  primary(): Expr {
    if (this.matchToken(TokenName.FALSE)) return new Literal(false);
    if (this.matchToken(TokenName.TRUE)) return new Literal(true);
    if (this.matchToken(TokenName.NIL)) return new Literal(null);

    if (this.matchToken(TokenName.NumericLiteral, TokenName.StringLiteral)) {
      const token = this.previous();
      assert(token.text !== undefined);
      return token.type === TokenName.NumericLiteral
        ? new Literal(Number.parseInt(token.text))
        : new Literal(token.text.slice(1, -1));
    }

    if (this.matchToken(TokenName.Identifier)) {
      return new Variable(this.previous());
    }

    if (this.matchToken(TokenName.LEFT_PAREN)) {
      const expr = this.expression();
      this.consume(TokenName.RIGHT_PAREN, "Expect ')' after expression.");
      return new Grouping(expr);
    }

    if (this.matchToken(TokenName.THIS)) return new This(this.previous());

    throw new ParseError(this.peek(), "is not a Literal");
  }
}

class ParseError extends Error {
  constructor(
    public token: Token,
    public msg: string
  ) {
    super(msg);
    this.name = "ParseError";
  }
}
