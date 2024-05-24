import { Value } from "../types";
import { Interpreter } from "../utils/interpreter";
import { LoxCallable, LoxFunction } from "./loxFunction";
import { LoxInstance } from "./loxInstance";

export class LoxClass extends LoxCallable {
  constructor(public name: string,public methods:Map<string,LoxFunction>) {
    super();
  }

  override arity(): number {
    return 0;
  }
  override call(interpreter: Interpreter, args: Value[]): Value {
    const instance = new LoxInstance(this);
    return instance;
  }

  public toString(): string {
    return this.name + " hello world";
  }
}
