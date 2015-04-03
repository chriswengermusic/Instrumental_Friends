/**
 * Created by cwenger on 4/1/2015.
 */
//var context = null;
var tempo = parseInt(document.getElementById('showTempo').innerHTML); //the speed of each beat
var pianoLevel = parseInt(document.getElementById('pLevel').innerHTML)/10; // the overall level of the piano sounds
var drumsLevel = parseInt(document.getElementById('dLevel').innerHTML)/10; // the overall level of drum sounds

//get the cursor values from the noteData array (from the XMl/Vexflow) to draw the cursor
var xPos = [];
function getXValues(){
    for (var i=0; i<noteData.length; i++){
        var xDiff, x, xIncr;
        var endX = window.innerWidth - 65;
        var duration = noteData[i].duration;
        var cursorDiff = 256/duration;
        if (i == 0){
            var xOffset = 50 * scale * zoom;
            xDiff = ((noteData[i + 1].mX + noteData[i + 1].noteX) - (noteData[i].mX + noteData[i].noteX));
            var position = noteData[i].mX + noteData[i].noteX + xOffset;
        }
        else if (i < noteData.length - 1) {
            xOffset = 35 * scale * zoom;
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

function cursorDraw() {
    getXValues();
    var i=0;
    (function iterate() {
        if (i<xPos.length) {
            var x = (xPos[i]).toString() + "px";
            var cursorTime = (((60 / 86) * 1000) / 64);
            var cursorCanvas = document.getElementById('positionMarker');
            if (cursorCanvas) {
                cursorCanvas.parentNode.removeChild(cursorCanvas);
            }
            var cursor = document.createElement('canvas');
            cursor.id = 'positionMarker';
            cursor.height = 85;
            cursor.width = 4;
            document.getElementById('viewer').appendChild(cursor);
            document.getElementById('positionMarker').style.left = x;
            setTimeout(iterate, cursorTime);
        }
        i++;
    })();
}

var cursorDisplay;
function cursorStart() {
    cursorDisplay = setTimeout(cursorDraw, (60 / tempo) * 4 * 1000);
}