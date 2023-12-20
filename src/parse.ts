import assert from "node:assert";
import { Assign, Binary, Expr, Grouping, Literal, Logical, Unary, Variable } from "./element/expr";
import { lexAll } from "./lex";
import { Token, TokenName } from "./types";
import { exit } from "node:process";
import { Block, Expression, If, Print, Stmt, Var } from "./element/stament";

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
        if(this.matchToken(TokenName.NOTE)) continue;
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

  statement(): Stmt{
    if (this.matchToken(TokenName.PRINT)) return this.printStatement();
    if (this.matchToken(TokenName.VAR)) return this.varStatement();
    if (this.matchToken(TokenName.LEFT_BRACE)) return new Block(this.blockStatements());
    if(this.matchToken(TokenName.IF)) return this.ifStatement();
    return this.expressionStatement();
  }

  ifStatement(){
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

  blockStatements(){
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
    if(this.matchToken(TokenName.EQUAL)){
      const equals = this.previous();
      const value = this.expression();

      if (leftExpr instanceof Variable) {
        return new Assign(leftExpr.name, value);
      }
    }

    return leftExpr;
  }

  private or() {
    let expr = this.and();

    while (this.matchToken(TokenName.OR)) {
      const operator = this.previous();
      const  right = this.and();
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
    return this.primary();
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
        : new Literal(token.text);
    }

    if(this.matchToken(TokenName.Identifier)){
      return new Variable(this.previous());
    }

    if (this.matchToken(TokenName.LEFT_PAREN)) {
      const expr = this.expression();
      this.consume(TokenName.RIGHT_PAREN, "Expect ')' after expression.");
      return new Grouping(expr);
    }

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
