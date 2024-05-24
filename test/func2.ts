function count(n) {
  if (n > 1) count(n - 1);
  print n;
}
{
  
}

count(3);

function sayHi(first, last) {
  print "Hi, " + first + " " + last + "!";
}

sayHi("Dear", "Reader");