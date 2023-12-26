var abc = "global";
{
    function showABC() {
        console.log(abc);
    }
    showABC();
    var abc = "block";
    showABC();
}
