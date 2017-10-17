
Array.map((a) => {
    var numArr = a.match('/\d+/g');
    var distance = calLoc(numArr[0], numArr[1]);
    return distance > 1000;
});