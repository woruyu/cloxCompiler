var a = "global";
{
    function showA() {
        console.log(a_1);
    }
    showA();
    var a_1 = "block";
    showA();
}
