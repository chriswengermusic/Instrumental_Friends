/**
 * Created by cwenger on 4/1/2015.
 */
var context = null;
var xPos = [];
function getXValues(){
    for (var i=0; i<noteData.length; i++){
        var xDiff, x, xIncr;
        var endX = window.innerWidth - 50;
        var duration = noteData[i].duration;
        var cursorDiff = 128/duration;
        if (i < noteData.length - 1) {
            if (noteData[i].mX == 10 * scale * zoom || noteData[i].mX == 15 * scale * zoom) {
                var xOffset = 55 * scale * zoom;
            }
            else {
                xOffset = 30 * scale * zoom;
            }
            xDiff = ((noteData[i + 1].mX + noteData[i + 1].noteX) - (noteData[i].mX + noteData[i].noteX));
            var position = noteData[i].mX + noteData[i].noteX + xOffset;
        }
        else if (i == noteData.length - 1) {
            xOffset = 30 * scale * zoom;
            xDiff = endX - (noteData[i].mX + noteData[i].noteX);
            position = noteData[i].mX + noteData[i].noteX + xOffset;
        }
        else {
            xOffset = 30 * scale * zoom;
            position = endX;
            xDiff = 0;
        }
        for (var j=0; j<cursorDiff; j++){
            xIncr = xDiff/cursorDiff;
            x = (position + (xIncr * j)).toString();
            xPos.push(x);
        }
    }
}
getXValues();
console.log(xPos);