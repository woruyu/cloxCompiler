import { Token } from "../types";
import { Expr, Variable } from "./expr";

export abstract class Stmt {
  abstract accept<R>(visitor: stmVisitor<R>): R;
}

export interface stmVisitor<R> {
  visitBlockStmt(stmt: Block): R;
  visitClassStmt(stmt: Class): R;
  visitExpressionStmt(stmt: Expression): R;
  visitFunctionStmt(stmt: Function): R;
  visitIfStmt(stmt: If): R;
  visitPrintStmt(stmt: Print): R;
  visitReturnStmt(stmt: Return): R;
  visitVarStmt(stmt: Var): R;
  visitWhileStmt(stmt: While): R;
  visitForStmt(stmt: For): R;
}

export class Block extends Stmt {
  statements: Stmt[];

  constructor(statements: Stmt[]) {
    super();
    this.statements = statements;
  }

  accept<R>(visitor: stmVisitor<R>): R {
    return visitor.visitBlockStmt(this);
  }
}

export class Class extends Stmt {
  constructor(
    public name: Token,
    public superclass: Variable | null,
    public methods: Function[]
  ) {
    super();
  }
  accept<R>(visitor: stmVisitor<R>): R {
    return visitor.visitClassStmt(this);
  }
}

export class Expression extends Stmt {
  constructor(public expression: Expr) {
    super();
  }

  accept<R>(visitor: stmVisitor<R>): R {
    return visitor.visitExpressionStmt(this);
  }
}

export class Function extends Stmt {
  constructor(
    public name: Token,
    public params: Token[],
    public body: Stmt[]
  ) {
    super();
  }

  accept<R>(visitor: stmVisitor<R>): R {
    return visitor.visitFunctionStmt(this);
  }
}

export class If extends Stmt {
  constructor(
    public condition: Expr,
    public thenBranch: Stmt,
    public elseBranch: Stmt | null
  ) {
    super();
  }

  accept<R>(visitor: stmVisitor<R>): R {
    return visitor.visitIfStmt(this);
  }
}

export class Print extends Stmt {
  constructor(public expression: Expr) {
    super();
  }

  accept<R>(visitor: stmVisitor<R>): R {
    return visitor.visitPrintStmt(this);
  }
}

export class Return extends Stmt {
  constructor(public value: Expr | null) {
    super();
  }

  accept<R>(visitor: stmVisitor<R>): R {
    return visitor.visitReturnStmt(this);
  }
}

export class Var extends Stmt {
  constructor(
    public name: Token,
    public initializer: Expr | null
  ) {
    super();
  }

  accept<R>(visitor: stmVisitor<R>): R {
    return visitor.visitVarStmt(this);
  }
}

export class While extends Stmt {
  constructor(
    public condition: Expr,
    public body: Stmt
  ) {
    super();
  }

  accept<R>(visitor: stmVisitor<R>): R {
    return visitor.visitWhileStmt(this);
  }
}

export class For extends Stmt {
  constructor(
    public initializer: Expr | Stmt | null,
    public condition: Expr | null,
    public body: Stmt,
    public increment: Expr | null
  ) {
    super();
  }

  accept<R>(visitor: stmVisitor<R>): R {
    return visitor.visitForStmt(this);
  }
}
