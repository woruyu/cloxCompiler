import assert from "node:assert";
import { Token, Value } from "../types";

export class Environment {
  table: Map<string, Value> = new Map<string, Value>();
  enclosing: Environment | null;

  constructor(enclosing: Environment | null = null) {
    this.enclosing = enclosing;
  }

  get(name: Token): Value {
    assert(name.text !== undefined);
    if (this.table.has(name.text)) {
      return this.table.get(name.text)!;
    }

    if (this.enclosing !== null) {
      return this.enclosing.get(name);
    }

    throw new Error(`Undefined variable '${name.text}'`);
  }

  assign(name: Token, value: Value): void {
    assert(name.text !== undefined);
    if (this.table.has(name.text)) {
      this.table.set(name.text, value);
      return;
    }

    if (this.enclosing !== null) {
      this.enclosing.assign(name, value);
      return;
    }

    throw new Error(`Undefined variable '${name.text}'.`);
  }

  define(name: string, value: Value): void {
    this.table.set(name, value);
  }

  ancestor(distance: number): Environment {
    let environment: Environment | null = this;
    for (let i = 0; i < distance; i++) {
      environment = environment?.enclosing;
      if (environment === null) {
        throw new Error("No enclosing environment at this distance.");
      }
    }

    return environment;
  }

  getAt(distance: number, name: string): Value {
    return this.ancestor(distance).table.get(name)!;
  }

  assignAt(distance: number, name: Token, value: Value): void {
    assert(name.text !== undefined);
    this.ancestor(distance).table.set(name.text, value);
  }

  toString(): string {
    let result = this.table.toString();
    if (this.enclosing !== null) {
      result += ` -> ${this.enclosing.toString()}`;
    }

    return result;
  }
}
