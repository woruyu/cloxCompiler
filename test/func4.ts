var a = "global";
{
  function showA() {
    print a;
  }

  showA();
  var a = "block";
  showA();
}