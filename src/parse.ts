import assert from "node:assert";
import { Binary, Expr, Grouping, Literal, Unary } from "./expr";
import { lexAll } from "./lex";
import { Token, TokenName } from "./types";
import { exit } from "node:process";

export class Parser {
  private tokens = new Array<Token>();
  private current = 0;

  parse(content: string) {
    this.tokens = lexAll(content);
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
    return this.equality();
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
