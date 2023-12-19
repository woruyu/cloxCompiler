export enum TokenName {
  // Single-character tokens.
  LEFT_PAREN,
  RIGHT_PAREN,
  LEFT_BRACE,
  RIGHT_BRACE,
  COMMA,
  DOT,
  MINUS,
  PLUS,
  SEMICOLON,
  SLASH,
  STAR,

  // One or two character tokens.
  BANG,
  BANG_EQUAL,
  EQUAL,
  EQUAL_EQUAL,
  GREATER,
  GREATER_EQUAL,
  LESS,
  LESS_EQUAL,

  // Keywords.
  AND,
  CLASS,
  ELSE,
  FALSE,
  FUNCTION,
  FOR,
  IF,
  NIL,
  OR,
  PRINT,
  RETURN,
  SUPER,
  THIS,
  TRUE,
  VAR,
  WHILE,

  //value
  NumericLiteral,
  StringLiteral,
  Identifier,

  NOTE,
  Unknown,
  EOF,
}
export type Lexer = {
  scan(): void;
  token(): TokenName;
  pos(): { line: number; column: number };
  text(): string;
};

export interface Token {
  pos: { line: number; column: number };
  tokenName: string;
  type: TokenName;
  text?: string;
}

export type Value = number | string | boolean | null;