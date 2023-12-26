let b;
{
  let a = 10;
  function hello(c:number){
    if(c === 2){
      a = 9999;
    }
    function showA() {
      console.log(a);
    }
  
    showA();
  }

b = hello;
}

b(0);
b(2);
b(0);