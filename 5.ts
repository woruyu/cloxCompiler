var a = "global";
{
  Function
  function showA() {
    console.log(a);
  }

  showA();
  let a = "block";
  showA();
}