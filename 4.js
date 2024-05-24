var a = "global";
{
  var a = "block";

  function showA() {
    print a;
  }
  showA();
  showA();
}