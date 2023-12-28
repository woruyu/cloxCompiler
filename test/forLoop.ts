{var a = 0;
var temp;
var b;

for (b = 1; a < 100; b = temp + b) {
  print a;
  temp = a;
  a = b;
}
}