var b;
{
  var a = 10;
  function hello(c){
    if(c == 2){
      a = 9999;
    }
    function showA() {
      print a;
    }
  
    showA();
  }

  b = hello;
}

b(0);
b(2);
b(0);