import { Token } from "../types";

export abstract class Expr {
  abstract accept<R>(visitor: Visitor<R>): R;
}

export interface Visitor<R> {
  visitAssignExpr(expr: Assign): R;
  visitBinaryExpr(expr: Binary): R;
  visitCallExpr(expr: Call): R;
  visitGetExpr(expr: Get): R;
  visitGroupingExpr(expr: Grouping): R;
  visitLiteralExpr(expr: Literal): R;
  visitLogicalExpr(expr: Logical): R;
  visitSetExpr(expr: SET ): R;
  // visitSuperExpr(expr: Super): R;
  visitThisExpr(expr: This): R;
  visitUnaryExpr(expr: Unary): R;
  visitVariableExpr(expr: Variable): R;
}

export class Assign extends Expr {
  constructor(
    public name: Token,
    public value: Expr
  ) {
    super();
  }

  accept<R>(visitor: Visitor<R>): R {
    return visitor.visitAssignExpr(this);
  }
}

export class Binary extends Expr {
  constructor(
    public left: Expr,
    public operator: Token,
    public right: Expr
  ) {
    super();
    this.left = left;
    this.operator = operator;
    this.right = right;
  }

  accept<R>(visitor: Visitor<R>): R {
    return visitor.visitBinaryExpr(this);
  }
}

export class Call extends Expr {
  constructor(
    public callee: Expr,
    public args: Expr[]
  ) {
    super();
  }

  accept<R>(visitor: Visitor<R>): R {
    return visitor.visitCallExpr(this);
  }
}

export class Get extends Expr {
  constructor(
    public object: Expr,
    public name: Token
  ) {
    super();
  }

  accept<R>(visitor: Visitor<R>): R {
    return visitor.visitGetExpr(this);
  }
}

export class Grouping extends Expr {
  constructor(public expression: Expr) {
    super();
    this.expression = expression;
  }

  accept<R>(visitor: Visitor<R>): R {
    return visitor.visitGroupingExpr(this);
  }
}

Function

export class Literal extends Expr {
  constructor(public value: number | string | boolean | null) {
    super();
  }

  accept<R>(visitor: Visitor<R>): R {
    return visitor.visitLiteralExpr(this);
  }
}

export class Unary extends Expr {
  constructor(
    public operator: Token,
    public right: Expr
  ) {
    super();
    this.operator = operator;
    this.right = right;
  }

  accept<R>(visitor: Visitor<R>): R {
    return visitor.visitUnaryExpr(this);
  }
}

export class Variable extends Expr {
  constructor(public name: Token) {
    super();
  }

  accept<R>(visitor: Visitor<R>): R {
    return visitor.visitVariableExpr(this);
  }
}

export class Logical extends Expr {
  constructor(
    public left: Expr,
    public operator: Token,
    public right: Expr
  ) {
    super();
  }

  accept<R>(visitor: Visitor<R>): R {
    return visitor.visitLogicalExpr(this);
  }
}

export class SET extends Expr {
  constructor(public object:Expr,public name:Token, public value:Expr) {
    super();
  }

  accept<R>(visitor: Visitor<R>): R {
    return visitor.visitSetExpr(this);
  }
}

export class This extends Expr {
  constructor(public keyword:Token) {
    super();
  }


  accept<R>(visitor: Visitor<R>): R {
    return visitor.visitThisExpr(this);
  }
}
