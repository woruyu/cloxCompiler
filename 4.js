var a = "global";
{
  var a = "block";
  var c;
  function showA() {
    print a;
  }
  showA();
  showA();
}