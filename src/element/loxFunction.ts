import { ReturnException, Value } from "../types";
import { Environment } from "../utils/environment";
import { Interpreter } from "../utils/interpreter";
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
    public closure: Environment
  ) {
    super();
    // this.isInitializer = isInitializer;
  }

  // bind(instance: LoxInstance): LoxFunction {
  //   let environment = new Environment(this.closure);
  //   environment.define("this", instance);
  //   return new LoxFunction(this.declaration, environment, this.isInitializer);
  // }

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

  // call(interpreter: Interpreter, args: Value[]): Value {
  //   let environment = new Environment(this.closure);
  //   for (let i = 0; i < this.declaration.params.length; i++) {
  //     environment.define(this.declaration.params[i].text!, args[i]);
  //   }

  //   try {
  //     interpreter.executeBlock(this.declaration.body, environment);
  //   } catch (returnValue) {
  //     if (returnValue instanceof Return) {
  //       if (this.isInitializer) return this.closure.getAt(0, "this");
  //       return returnValue.value;
  //     } else {
  //       // Rethrow if it's not a Return exception.
  //       throw returnValue;
  //     }
  //   }

  //   if (this.isInitializer) return this.closure.getAt(0, "this");
  //   return null;
  // }
}
