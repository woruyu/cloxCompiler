import { Token, Value } from "../types";
import { LoxClass } from "./loxClass";


export class LoxInstance {
  fields = new Map<string,Value>();

  constructor(private klass:LoxClass) {

  }

  get(name:Token) {
    if (this.fields.has(name.text!)) {
      return this.fields.get(name.text!)!;
    }

    if(this.klass.methods.has(name.text!)){
      return this.klass.methods.get(name.text!)!.bind(this);
    }

    throw new Error(`in ${this.klass.name}, Undefined property ${name.text}.`);
  }

  set(name:Token , value:Value) {
    this.fields.set(name.text!,value);
  }

  toString():string {
    return this.klass.name + " instance";
  }
}