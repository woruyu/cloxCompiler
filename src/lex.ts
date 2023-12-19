import { Lexer, Token, TokenName } from "./types";

const keywords = {
  function: TokenName.FUNCTION,
  var: TokenName.VAR,
  // type: TokenName.Type,

  and: TokenName.AND,
  class: TokenName.CLASS,
  else: TokenName.ELSE,
  false: TokenName.FALSE,
  for: TokenName.FOR,
  if: TokenName.IF,
  nil: TokenName.NIL,
  or: TokenName.OR,
  print: TokenName.PRINT,
  return: TokenName.RETURN,
  super: TokenName.SUPER,
  this: TokenName.THIS,
  true: TokenName.TRUE,
  while: TokenName.WHILE,
};

export function lex(s: string): Lexer {
  let pos = 0;
  let line = 1;
  let col = 0;
  let text = "";
  let token = TokenName.EOF;
  return {
    scan,
    token: () => token,
    pos: () => {
      return { line: line, column: pos - col };
    },
    text: () => text,
  };

  function scan() {
    scanForward((c) => /[\b\t\n\r ]/.test(c));
    const start = pos;
    if (pos === s.length) {
      token = TokenName.EOF;
    } else if (s.charAt(pos) === '"') {
      pos++;
      scanForward((c) => /[^"]/.test(c));
      if (s.charAt(pos) === '"') {
        pos++;
      } else {
        // TODO: Better error reporting (and return the current span as a string)
        throw new Error("unclosed string literal");
      }
      text = s.slice(start, pos);
      token = TokenName.StringLiteral;
    } else if (/\d/.test(s.charAt(pos))) {
      scanForward((c) => /[\d.]/.test(c));
      text = s.slice(start, pos);
      // if(text.split('.').length > 2) throw error(`error float --line:${line},column:${pos-col}`)
      token = TokenName.NumericLiteral;
    } else if (/[A-Z_a-z]/.test(s.charAt(pos))) {
      scanForward((c) => /\w/.test(c));
      text = s.slice(start, pos);
      token = text in keywords ? keywords[text as keyof typeof keywords] : TokenName.Identifier;
    } else {
      pos++;
      switch (s.charAt(pos - 1)) {
        case "(": {
          token = TokenName.LEFT_PAREN;
          break;
        }
        case ")": {
          token = TokenName.RIGHT_PAREN;
          break;
        }
        case "{": {
          token = TokenName.LEFT_BRACE;
          break;
        }
        case "}": {
          token = TokenName.RIGHT_BRACE;
          break;
        }
        case ",": {
          token = TokenName.COMMA;
          break;
        }
        case ".": {
          token = TokenName.DOT;
          break;
        }
        case "-": {
          token = TokenName.MINUS;
          break;
        }
        case "+": {
          token = TokenName.PLUS;
          break;
        }
        case ";": {
          token = TokenName.SEMICOLON;
          break;
        }
        case "*": {
          token = TokenName.STAR;
          break;
        }
        case "!": {
          token = match("=") ? TokenName.BANG_EQUAL : TokenName.BANG;
          break;
        }
        case "=": {
          token = match("=") ? TokenName.EQUAL_EQUAL : TokenName.EQUAL;
          break;
        }
        case "<": {
          token = match("=") ? TokenName.LESS_EQUAL : TokenName.LESS;
          break;
        }
        case ">": {
          token = match("=") ? TokenName.GREATER_EQUAL : TokenName.GREATER;
          break;
        }
        case "/": {
          if (match("/")) {
            // A comment goes until the end of the line.
            token = TokenName.NOTE;
            const _start = pos;
            while (s.charAt(pos) != "\n" && pos < s.length) {
              pos++;
            }
            text = s.slice(_start, pos - 1);
          } else {
            token = TokenName.SLASH;
          }
          break;
        }
        default: {
          token = TokenName.Unknown;
          break;
        }
      }
    }
  }
  function match(x: string) {
    if (pos < s.length && s.charAt(pos) === x) {
      pos++;
      return true;
    }
    return false;
  }

  function scanForward(pred: (x: string) => boolean) {
    while (pos < s.length && pred(s.charAt(pos))) {
      if (s.charAt(pos) === "\n") {
        line++;
        col = pos + 1;
      }
      pos++;
    }
  }
}

export function lexAll(s: string) {
  const lexer = lex(s);
  const tokens = new Array<Token>();
  let type: TokenName;

  // eslint-disable-next-line no-constant-condition
  while (true) {
    lexer.scan();
    type = lexer.token();

    switch (type) {
      case TokenName.EOF: {
        tokens.push({ pos: lexer.pos(), tokenName: TokenName[type], type: lexer.token() });
        return tokens;
      }
      case TokenName.NOTE:
      case TokenName.StringLiteral:
      case TokenName.Identifier:
      case TokenName.NumericLiteral: {
        tokens.push({ pos: lexer.pos(), text: lexer.text(), tokenName: TokenName[type], type: lexer.token() });
        break;
      }
      default: {
        tokens.push({ pos: lexer.pos(), tokenName: TokenName[type], type: lexer.token() });
        break;
      }
    }
  }
}

// const a = lexAll(`// this is a comment
// (( )){} // grouping stuff
// !*+-/=<> <= == // operators
// 1234.56 14..23 12 or`);
// console.log(a);
