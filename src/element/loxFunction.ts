import { ReturnException, Value } from "../types";
import { Environment } from "../utils/environment";
import { Interpreter } from "../utils/interpreter";
import { LoxInstance } from "./loxInstance";
import { Function } from "./stament";

export abstract class LoxCallable {
  abstract arity(): number;
  abstract call(interpreter: Interpreter, args: Value[]): Value | null;
  abstract toString(): string;
}

export class LoxFunction extends LoxCallable {
  // private isInitializer: boolean;

  constructor(
    public declaration: Function,
    public closure: Environment | null
  ) {
    super();
    // this.isInitializer = isInitializer;
  }

  bind(instance: LoxInstance): LoxFunction {
    let environment = new Environment(this.closure);
    environment.define("this", instance);
    return new LoxFunction(this.declaration, environment);
  }

  override toString(): string {
    return `<fn ${this.declaration.name.text}>`;
  }

  arity(): number {
    return this.declaration.params.length;
  }

  call(interpreter: Interpreter, args: Value[]) {
    const env = new Environment(this.closure);

    for (let i = 0; i < this.declaration.params.length; i++) {
      env.define(this.declaration.params[i].text!, args[i]);
    }

    try {
      interpreter.executeBlock(this.declaration.body, env);
    } catch (error) {
      if (error instanceof ReturnException) {
        return error.value;
      } else {
        throw error;
      }
    }

    return null;
  }

}
