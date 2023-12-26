function greet(greeting, punctuation) {
  console.log(greeting + ", " + this.name + punctuation);
}

const person = {
  name: "Alice",
};

// Using call()
// call() takes the `this` argument and then a list of arguments to pass to the function.
greet.call(person, "Hello", "!"); // Output: "Hello, Alice!"

// Using apply()
// apply() takes the `this` argument and an array of arguments to pass to the function.
greet.apply(person, ["Hi", "?"]); // Output: "Hi, Alice?"

// Using bind()
// bind() returns a new function with `this` bound to a specific object and any initial arguments.
const boundGreet = greet.bind(person, "Hey");
boundGreet("!!"); // Output: "Hey, Alice!!"

// bind() can also be used to partially apply functions by pre-filling some of the arguments.
const sayHelloToAlice = greet.bind(person, "Hello");
sayHelloToAlice("."); // Output: "Hello, Alice."
