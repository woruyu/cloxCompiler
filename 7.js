// class DevonshireCream {
//   serveOn() {
//     return "Scones";
//   }
// }
// print DevonshireCream; // Prints "DevonshireCream".
// class Bagel {}
// var bagel = Bagel();
// print bagel; // Prints "Bagel instance".
{
    var c_1 = 1000;
    var Bacon = /** @class */ (function () {
        function Bacon() {
        }
        Bacon.prototype.eat = function () {
            console.log("Crunch crunch crunch!");
            console.log(c_1);
        };
        return Bacon;
    }());
    new Bacon().eat(); // Prints "Crunch crunch crunch!".
}
