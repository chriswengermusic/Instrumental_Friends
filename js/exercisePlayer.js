/**
 * Created by cwenger on 4/1/2015.
 */
var context = new webAudioContext;
var xPos = [];
function getXValues(){
    for (var i=0; i<noteData.length; i++){
        var duration = noteData[i].duration;
        var cursorDiff = 128/duration;
        if(i<noteData.length - 1){
            var xDiff = (noteData[i+1].mX + noteData[i+1].noteX) - (noteData[i].mX + noteData[i].noteX);
            if(noteData[i].mX == 10*scale*zoom || noteData[i].mX == 15*scale*zoom){
                var xOffset = 55 * scale * zoom;
            }
            else{
                xOffset = 30 * scale * zoom;
            }
        }
    }
}