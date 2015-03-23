/**
 * Created by cwenger on 12/6/2014.
 */
var context = null;
var isPlaying = false;      // Are we currently playing?
var startTime;              // The start time of the entire sequence.
var current16thNote;        // What note is currently last scheduled?
var tempo = parseInt(document.getElementById('showTempo').innerHTML);          // tempo (in beats per minute)
var lookahead = 25.0;       // How frequently to call scheduling function
                            //(in milliseconds)
var scheduleAheadTime = 0.1;    // How far ahead to schedule audio (sec)
// This is calculated from lookahead, and overlaps
// with next interval (in case the timer is late)
var nextNoteTime = 0.0;     // when the next note is due.
var noteResolution = 0;     // 0 == 16th, 1 == 8th, 2 == quarter note
var noteLength;      // length of "beep" (in seconds)
//var canvas = document.createElement('canvas');
                    // the canvas element

//var canvasContext = cursor.getContext('2d');          // canvasContext is the canvas' context 2D
var last16thNoteDrawn = -1; // the last "box" we drew on the screen
var notesInQueue = [];      // the notes that have been put into the web audio,
                            // and may or may not have played yet. {note, time}
var timerWorker = null;     // The Web Worker used to fire timer messages
var Bb1,
    B1,
    C2,
    Db2,
    D2,
    Eb2,
    E2,
    F2,
    Gb2,
    G2,
    Ab2,
    A2,
    Bb2,
    B2,
    C3,
    Db3,
    D3,
    Eb3,
    E3,
    F3,
    Gb3,
    G3,
    Ab3,
    A3,
    Bb3,
    B3,
    C4,
    Db4,
    D4,
    Eb4,
    E4,
    F4,
    Gb4,
    G4,
    Ab4,
    A4,
    Bb4,
    B4,
    C5,
    Db5,
    D5,
    kick,
    kickLow,
    snare,
    clap,
    closedHat,
    openHat,
    breakKick,
    breakSnare,
    breakOHat,
    breakCHat;

var PIANO;
var pianoLevel = parseInt(document.getElementById('pLevel').innerHTML)/10;
var HIPHOP;
var drumsLevel = parseInt(document.getElementById('dLevel').innerHTML)/ 10;
var BREAKBEAT;
var breakbeatLevel;
var houseLevel;
var HOUSE;
function setDrumVolume() {
    if(tempo <= 86){
        hipHopLevel = drumsLevel;
        breakbeatLevel = 0;
        houseLevel = 0;
    }
    else if((tempo > 86) && (tempo < 120)){
        breakbeatLevel = drumsLevel;
        hipHopLevel = 0;
        houseLevel = 0;
    }
    else if (tempo >= 120) {
        houseLevel = drumsLevel;
        hipHopLevel = 0;
        breakbeatLevel = 0;
    }
}
var hipHopLevel;
var kickLevel;
var snareLevel;
var hatLevel;


var quarter = 0,
    half,
    whole,
    eighth;
var numBeats = 4;
var measureTime = numBeats * quarter;
var measureCount = 4;
var viewer = document.getElementById('viewer');


    // First, let's shim the requestAnimationFrame API, with a setTimeout fallback
    window.requestAnimFrame = (function(){
    return  window.requestAnimationFrame ||
        window.webkitRequestAnimationFrame ||
        window.mozRequestAnimationFrame ||
        window.oRequestAnimationFrame ||
        window.msRequestAnimationFrame ||
        function( callback ){
            window.setTimeout(callback, 1000 / 60);
        };
})();

function nextNote() {
    // Advance current note and time by a 16th note...
    quarter = 60.0 / tempo;    // Notice this picks up the CURRENT
                                          // tempo value to calculate beat length.
    half = 2 * quarter;
    whole = 4 * quarter;
    eighth = 0.5 * quarter;
    nextNoteTime += 0.25 * quarter;    // Add beat length to last beat time

    current16thNote++;    // Advance the beat number, wrap to zero
    if ((current16thNote == (16 * measureCount) + (preRoll)) && (repeatCount)) {
        current16thNote = preRoll;
        repeatCount = (!repeatCount);

    }

}
var beatNumber = 0;
var repeatCount = true;
var preRoll = numBeats * 4;
var buffer;
var countOffDisplay = null;
function scheduleNote( beatNumber, time ) {
    // push the note on the queue, even if we're not playing.
    notesInQueue.push({note: beatNumber, time: time});
    //if ((noteResolution == 1) && (beatNumber % 2))
        //return; // we're not playing non-8th 16th notes
    //if ((noteResolution == 2) && (beatNumber % 4))
        //return; // we're not playing non-quarter 8th notes
    setDrumVolume();
    kickLevel = .5 * hipHopLevel;
    snareLevel = .5 * hipHopLevel;
    hatLevel = .2 * hipHopLevel;

    function countOffWindow() {
        if (beatNumber < preRoll) {
            document.getElementById('countOff').style.display = 'inline-block';
        }
        else {
            document.getElementById('countOff').style.display = 'none';
        }
    }
    // create an oscillator
    var osc = context.createOscillator();
    var gainNode = context.createGain ? context.createGain() : context.createGainNode();
    osc.connect(gainNode);
    gainNode.connect( context.destination );
    gainNode.gain.value = .75;
    osc.frequency.value = 960.00;
    //if (beatNumber % 16 === 0)    // beat 0 == low pitch
    //osc.frequency.value = 880.0;
    //else if (beatNumber % 4 === 0 )    // quarter notes = medium pitch
    //osc.frequency.value = 440.0;
    //else                        // other 16th notes = high pitch
    //osc.frequency.value = 220.0;

    //osc.start( time );
    //osc.stop( time + noteLength );
    if (beatNumber  == 0) {
        osc.start(context.currentTime);
        osc.stop(context.currentTime +.05);
        document.getElementById('countOff').innerHTML = "One";
    }
    else if (beatNumber == 4) {
        osc.start(context.currentTime);
        osc.stop(context.currentTime +.05);
        document.getElementById('countOff').innerHTML =  "Two";
    }
    else if (beatNumber == 8) {
        osc.start(context.currentTime);
        osc.stop(context.currentTime +.05);
        document.getElementById('countOff').innerHTML =  "Ready";
    }
    else if (beatNumber == 12) {
        osc.start(context.currentTime);
        osc.stop(context.currentTime +.05);
        document.getElementById('countOff').innerHTML =  "Play";
    }


    //create an audioSourceBuffer
    function playSound(buffer, length, level) {
        var source = context.createBufferSource();
        source.buffer = buffer;
        var gainNode = context.createGain ? context.createGain() : context.createGainNode();
        context.currentTime = time;
        source.connect(gainNode);
        gainNode.connect(context.destination);
        gainNode.gain.value = level;
        if (!source.start)
            source.start = source.noteOn;
        source.start(time);
        source.stop(time + length);

    }
    //function playAcc(sequence) {
        //for (var b = 0; b < sequence.length; b++){
            //playAcc(sequence[b]);
        //}
    //}
    //function playAcc(beat, sounds, duration, level){
        //this.sounds = sounds;
        //this.duration = duration;
        //this.level = level;
        //if (beatNumber === this.beat){
        //for (var a = 0; a < sounds.length; a++){
            //playSound(sounds[a], duration, level);
            //}
        //}
        //else{
            //play();
        //}

    function playChord(chord, duration, level){
        this.chord = chord;
        this.duration = duration;
        this.level = level;
        for (var n = 0; n < chord.length; n++) {
            playSound(chord[n], duration, level);
        }
    }
//TODO: enable transposition via solfege
    var I = [A4, Gb4, D4, D2];
    var V = [A4, E4, Db4, A2];
    var V7 = [A4, G4, E4, Db4, A2];
    var IV = [B4, G4, D4, G2];
    var vi = [B4, Gb4, D4, B2];

    countOffWindow();
    accompaniment();
        function accompaniment() {
            if (beatNumber === 0 + preRoll) {
                playChord(I, quarter, pianoLevel);
                playSound(kick, quarter, kickLevel);
                playSound(kickLow, quarter, kickLevel);
                playSound(closedHat, quarter, hatLevel);
                playSound(breakKick, quarter, breakbeatLevel);
                playSound(breakCHat, quarter, breakbeatLevel);
            }
            else if (beatNumber === 1 + preRoll) {
                playSound(closedHat, quarter, hatLevel);
            }
            else if (beatNumber === 2 + preRoll) {
                playSound(closedHat, quarter, hatLevel);
                playSound(breakKick, quarter, breakbeatLevel);
                playSound(breakCHat, quarter, breakbeatLevel);
            }
            else if (beatNumber === 3 + preRoll) {
                playSound(closedHat, quarter, hatLevel);
            }
            else if (beatNumber === 4 + preRoll) {
                playChord(V, quarter, pianoLevel);
                playSound(clap, quarter, snareLevel);
                playSound(snare, quarter, snareLevel);
                playSound(breakSnare, quarter, breakbeatLevel);
                playSound(breakCHat, quarter, breakbeatLevel);
            }
            else if (beatNumber === 5 + preRoll) {
                playSound(closedHat, quarter, hatLevel);
            }
            else if (beatNumber === 6){
                playSound(breakCHat, quarter, breakbeatLevel);
            }
            else if (beatNumber === 8 + preRoll) {
                playChord(I, half, pianoLevel);
                playSound(closedHat, quarter, hatLevel);
                playSound(breakCHat, quarter, breakbeatLevel);
            }
            else if (beatNumber === 10 + preRoll) {
                playSound(kick, quarter, kickLevel);
                playSound(kickLow, quarter, kickLevel);
                playSound(closedHat, quarter, hatLevel);
                playSound(breakCHat, quarter, breakbeatLevel);
            }
            else if (beatNumber === 12 + preRoll) {
                playSound(clap, quarter, snareLevel);
                playSound(snare, quarter, snareLevel);
                playSound(closedHat, quarter, hatLevel);
                playSound(breakCHat, quarter, breakbeatLevel);
            }
            else if (beatNumber === 13 + preRoll) {
                playSound(kick, quarter, kickLevel);
                playSound(kickLow, quarter, kickLevel);
                playSound(closedHat, quarter, hatLevel);
            }
            else if(beatNumber === 14) {
                playSound(breakSnare, quarter, breakbeatLevel);
                playSound(breakOHat, quarter, breakbeatLevel);
            }
            else if (beatNumber === 16 + preRoll) {
                playChord(I, quarter, pianoLevel);
                playSound(kick, quarter, kickLevel);
                playSound(kickLow, quarter, kickLevel);
                playSound(closedHat, quarter, hatLevel);
                playSound(breakKick, quarter, breakbeatLevel);
                playSound(breakCHat, quarter, breakbeatLevel);
            }
            else if (beatNumber === 18){
                playSound(breakKick, quarter, breakbeatLevel);
                playSound(breakCHat, quarter, breakbeatLevel);
            }
            else if (beatNumber === 20 + preRoll) {
                playChord(V, quarter, pianoLevel);
                playSound(clap, quarter, snareLevel);
                playSound(snare, quarter, snareLevel);
                playSound(breakSnare, quarter, breakbeatLevel);
                playSound(breakCHat, quarter, breakbeatLevel);
            }
            else if (beatNumber === 22 + preRoll) {
                playSound(closedHat, quarter, hatLevel);
                playSound(breakCHat, quarter, breakbeatLevel);
            }
            else if (beatNumber === 23 + preRoll) {
                playSound(closedHat, quarter, hatLevel);
                playSound(breakCHat, quarter, breakbeatLevel);
            }
            else if (beatNumber === 24 + preRoll) {
                playChord(I, half, pianoLevel);
                playSound(closedHat, quarter, hatLevel);
                playSound(breakCHat, quarter, breakbeatLevel);
            }
            else if (beatNumber === 26 + preRoll) {
                playSound(kick, quarter, kickLevel);
                playSound(kickLow, quarter, kickLevel);
                playSound(closedHat, quarter, hatLevel);
                playSound(breakCHat, quarter, breakbeatLevel);
                playSound(breakSnare, quarter, breakbeatLevel);
            }
            else if (beatNumber === 28 + preRoll) {
                playSound(clap, quarter, snareLevel);
                playSound(snare, quarter, snareLevel);
                playSound(closedHat, quarter, hatLevel);
                playSound(breakCHat, quarter, breakbeatLevel);
            }
            else if (beatNumber === 29 + preRoll) {
                playSound(kick, quarter, kickLevel);
                playSound(kickLow, quarter, kickLevel);
                playSound(closedHat, quarter, hatLevel);
            }
            else if(beatNumber === 30){
                playSound(breakSnare, quarter, breakbeatLevel);
                playSound(breakOHat, quarter, breakbeatLevel);
            }
            else if (beatNumber === 32 + preRoll) {
                playChord(I, quarter, pianoLevel);
                playSound(kick, quarter, kickLevel);
                playSound(kickLow, quarter, kickLevel);
                playSound(closedHat, quarter, hatLevel);
                playSound(breakKick, quarter, breakbeatLevel);
                playSound(breakCHat, quarter, breakbeatLevel);
            }
            else if (beatNumber === 34) {
                playSound(breakKick, quarter, breakbeatLevel);
                playSound(breakCHat, quarter, breakbeatLevel);
            }
            else if (beatNumber === 36 + preRoll) {
                playChord(I, quarter, pianoLevel);
                playSound(closedHat, quarter, hatLevel);
                playSound(clap, quarter, snareLevel);
                playSound(snare, quarter, snareLevel);
                playSound(breakSnare, quarter, breakbeatLevel);
                playSound(breakCHat, quarter, breakbeatLevel);
            }
            else if (beatNumber === 38) {
                playSound(breakCHat, quarter, breakbeatLevel);
            }
            else if (beatNumber === 40 + preRoll) {
                playChord(V, quarter, pianoLevel);
                playSound(closedHat, quarter, hatLevel);
                playSound(breakCHat, quarter, breakbeatLevel);
            }
            else if (beatNumber === 42 + preRoll) {
                playSound(kick, quarter, kickLevel);
                playSound(kickLow, quarter, kickLevel);
                playSound(closedHat, quarter, hatLevel);
                playSound(breakSnare, quarter, breakbeatLevel);
                playSound(breakCHat, quarter, breakbeatLevel);
            }
            else if (beatNumber === 44 + preRoll) {
                playChord(V, quarter, pianoLevel);
                playSound(closedHat, quarter, hatLevel);
                playSound(clap, quarter, snareLevel);
                playSound(snare, quarter, snareLevel);
                playSound(breakCHat, quarter, breakbeatLevel);
            }
            else if (beatNumber === 46) {
                playSound(breakOHat, quarter, breakbeatLevel);
                playSound(breakSnare, quarter, breakbeatLevel);
            }
            else if (beatNumber === 48 + preRoll) {
                playChord(I, quarter, pianoLevel);
                playSound(kick, quarter, kickLevel);
                playSound(kickLow, quarter, kickLevel);
                playSound(closedHat, quarter, hatLevel);
                playSound(breakKick, quarter, breakbeatLevel);
                playSound(breakCHat, quarter, breakbeatLevel);
            }
            else if (beatNumber === 49 + preRoll) {
                playSound(closedHat, quarter, hatLevel);
                playSound(clap, quarter, snareLevel);
                playSound(snare, quarter, snareLevel);
            }
            else if (beatNumber === 50 + preRoll) {
                playSound(openHat, quarter, hatLevel);
                playSound(breakKick, quarter, breakbeatLevel);
                playSound(breakOHat, quarter, breakbeatLevel);
            }
            else if (beatNumber === 51 + preRoll) {
                playSound(kick, quarter, kickLevel);
                playSound(kickLow, quarter, kickLevel);
                playSound(closedHat, quarter, hatLevel);
            }
            else if (beatNumber === 52 + preRoll) {
                playChord(V7, quarter, pianoLevel);
                playSound(closedHat, quarter, hatLevel);
                playSound(clap, quarter, snareLevel);
                playSound(snare, quarter, snareLevel);
                playSound(breakSnare, quarter, breakbeatLevel);
                playSound(breakCHat, quarter, breakbeatLevel);
            }
            else if (beatNumber === 53 + preRoll) {
                playSound(openHat, quarter, hatLevel);
            }
            else if (beatNumber === 54 + preRoll) {
                playSound(kick, quarter, kickLevel);
                playSound(kickLow, quarter, kickLevel);
                playSound(closedHat, quarter, hatLevel);
                playSound(breakKick, quarter, breakbeatLevel);
                playSound(breakOHat, quarter, breakbeatLevel);
            }
            else if (beatNumber === 55 + preRoll) {
                playSound(closedHat, quarter, hatLevel);
                playSound(clap, quarter, snareLevel);
                playSound(snare, quarter, snareLevel);
            }
            else if (beatNumber === 56 + preRoll) {
                playChord(I, whole, pianoLevel);
                playSound(openHat, quarter, hatLevel);
                playSound(breakSnare, quarter, breakbeatLevel);
                playSound(breakCHat, quarter, breakbeatLevel);
            }
            else if (beatNumber === 57 + preRoll) {
                playSound(kick, quarter, kickLevel);
                playSound(kickLow, quarter, kickLevel);
                playSound(closedHat, quarter, hatLevel);
            }
            else if (beatNumber === 58 + preRoll) {
                playSound(closedHat, quarter, hatLevel);
                playSound(clap, quarter, snareLevel);
                playSound(snare, quarter, snareLevel);
                playSound(breakOHat, quarter, breakbeatLevel);
                playSound(breakKick, quarter, breakbeatLevel);
            }
            else if (beatNumber === 59 + preRoll) {
                playSound(openHat, quarter, hatLevel);
                playSound(breakCHat, quarter, breakbeatLevel);
            }
            else if (beatNumber === 60 + preRoll) {
                playSound(kick, quarter, kickLevel);
                playSound(kickLow, quarter, kickLevel);
                playSound(closedHat, quarter, hatLevel);
                playSound(clap, quarter, snareLevel);
                playSound(snare, quarter, snareLevel);
                playSound(breakCHat, quarter, breakbeatLevel);
                playSound(breakSnare, quarter, breakbeatLevel);
            }
            else if (beatNumber === 62) {
                playSound(breakSnare, quarter, breakbeatLevel);
                playSound(breakOHat, quarter, breakbeatLevel);
            }
            else if((beatNumber > preRoll) && (beatNumber < preRoll + 16 * measureCount)) {
                playSound(closedHat, quarter, hatLevel);
            }

        }

}

function scheduler() {
    // while there are notes that will need to play before the next interval,
    // schedule them and advance the pointer.
    while (nextNoteTime < context.currentTime + scheduleAheadTime ) {
        scheduleNote( current16thNote, nextNoteTime );
        nextNote();
    }

}

function play() {
    isPlaying = !isPlaying;

    if (isPlaying) { // start playing
        current16thNote = 0;
        nextNoteTime = context.currentTime;
                timerWorker.postMessage("start");
        return "stop";
    } else {
                timerWorker.postMessage("stop");
        return "play";
    }
}

function resetCanvas (e) {
    // resize the canvas - but remember - this clears the canvas too.
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    //make sure we scroll to the top left.
    window.scrollTo(0,0);
}

function draw() {
    var currentNote = last16thNoteDrawn;
    var currentTime = context.currentTime;


        while (notesInQueue.length && notesInQueue[0].time < currentTime) {
            currentNote = notesInQueue[0].note;
            notesInQueue.splice(0, 1);   // remove note from queue
        }

        // We only need to draw if the note has moved.
        if (last16thNoteDrawn != currentNote) {
            //var x = Math.floor(canvas.width * .9) / (16 * measureCount);
            canvasContext.clearRect(0, 0, canvas.width, canvas.height);
            var xPos = [];

                    for (var i = 0; i < noteData.length; i++) {
                        var x = 0;
                        var xDiff = 0;
                        var xIncr = 0;
                        var subdivision = [];
                        if (i == noteData.length - 1) {
                            xDiff = Math.floor(canvas.width - noteData[i].noteX);
                        }
                        else {
                            xDiff = Math.floor(noteData[i + 1].noteX - noteData[i].noteX);
                        }
                        subdivision = 16 / parseInt(noteData[i].duration);
                        xIncr = xDiff / subdivision;
                            for (var j = 0; j < subdivision; j++) {
                                x = 10 + (noteData[i].noteX + (xIncr * j));
                                xPos.push(x);
                            }
                    for (var f = 0; f < xPos.length + preRoll; f++) {
                        canvasContext.fillStyle = ( currentNote == f + preRoll) ? "#00FF00" : "white";
                        canvasContext.fillRect(xPos[f], 0, 3, 100);
                    }
            }
            //for (var f = 0; f < xPos.length + preRoll; f++) {
                //canvasContext.fillStyle = ( currentNote == f + preRoll) ? "#00FF00" : "white";
                //canvasContext.fillRect(xPos[f], 0, 5, 100);
            //}

        last16thNoteDrawn = currentNote;
        }
        // set up to draw again
        requestAnimFrame(draw);

}

var cursorTime = ((60 / tempo) / 128) * 1000;
console.log(cursorTime);
//setInterval(cursorDraw(){

//}, (timePerTick));


function drawFunction() {
    var beatTime = (60 / tempo) * 1000;
    var i = 0;
    var xOffset;

    (function iterate() {
        var cursor = document.createElement('canvas');
        cursor.id = 'positionMarker';
        cursor.height = 85;
        cursor.width = 4;
        if (noteData[i].mX == 10 * scale * zoom || noteData[i].mX == 15 * scale * zoom) {
            xOffset = 55 * scale * zoom;
        }
        else {
            xOffset = 30 * scale * zoom;
        }
        if(i == noteData.length){
            var position = ((document.getElementById('viewer').width - 20) + xOffset)+ "px";
        }
        else{
            position = ((noteData[i].mX + noteData[i].noteX).toString() + xOffset) + "px";
        }

        document.getElementById('viewer').appendChild(cursor);
        document.getElementById('positionMarker').style.left = (position);
        i++;
        setTimeout(iterate, beatTime);
    })();
}


function drawCursor() {
    var s, xOffset, totalTicks, cursorRate;
    for (var i = 0; i < 1; i++) {
    //if (context.currentTime >= (preRoll * quarter)) {
        var xDiff;
        var duration = noteData[i].duration;
        if (noteData[i].mX == 10 * scale * zoom || noteData[i].mX == 15 * scale * zoom) {
            xOffset = 55 * scale * zoom;
        }
        else {
            xOffset = 30 * scale * zoom;
        }

        if (i = noteData.length - 1){
            xDiff = ((document.getElementById('viewer').width - 10) - (noteData[i - 1].mX + noteData[i - 1].noteX)) / (128 / duration);
        }
        else{
            xDiff = ((noteData[i + 1].mX + noteData[i + 1].noteX) - (noteData[i].mX + noteData[i].noteX)) / (128 / duration);
        }
        setInterval(function(){ cursorDraw()}, cursorTime);
            var cursorDraw = function(){
                var cursor = document.createElement('canvas');
                cursor.id = 'positionMarker';
                cursor.height = 85;
                cursor.width = 3;

                document.getElementById('viewer').appendChild(cursor);
                document.getElementById('positionMarker').style.left = (noteData[i].mX + noteData[i].noteX + xOffset + xDiff).toString() + "px";
            };
        }
        clearInterval();
    //}
}



function loadedPiano(PIANO) {
    Bb1 = PIANO[0];
    B1 = PIANO[1];
    C2 = PIANO[2];
    Db2 = PIANO[3];
    D2 = PIANO[4];
    Eb2 = PIANO[5];
    E2 = PIANO[6];
    F2 = PIANO[7];
    Gb2 = PIANO[8];
    G2 = PIANO[9];
    Ab2 = PIANO[10];
    A2 = PIANO[11];
    Bb2 = PIANO[12];
    B2 = PIANO[13];
    C3 = PIANO[14];
    Db3 = PIANO[15];
    D3 = PIANO[16];
    Eb3 = PIANO[17];
    E3 = PIANO[18];
    F3 = PIANO[19];
    Gb3 = PIANO[20];
    G3 = PIANO[21];
    Ab3 = PIANO[22];
    A3 = PIANO[23];
    Bb3 = PIANO[24];
    B3 = PIANO[25];
    C4 = PIANO[26];
    Db4 = PIANO[27];
    D4 = PIANO[28];
    Eb4 = PIANO[29];
    E4 = PIANO[30];
    F4 = PIANO[31];
    Gb4 = PIANO[32];
    G4 = PIANO[33];
    Ab4 = PIANO[34];
    A4 = PIANO[35];
    Bb4 = PIANO[36];
    B4 = PIANO[37];
    C5 = PIANO[38];
    Db5 = PIANO[39];
    D5 = PIANO[40];
}
function loadedHipHop(HIPHOP) {
    kick = HIPHOP[0];
    kickLow = HIPHOP[1];
    snare = HIPHOP[2];
    clap = HIPHOP[3];
    closedHat = HIPHOP[4];
    openHat = HIPHOP[5];
}
function loadedBreakBeat(BREAKBEAT) {
    breakKick = BREAKBEAT[0];
    breakSnare = BREAKBEAT[1];
    breakCHat = BREAKBEAT[2];
    breakOHat = BREAKBEAT[3];
}

function BufferLoader(context, urlList, callback) {
    this.context = context;
    this.urlList = urlList;
    this.onload = callback;
    this.bufferList = new Array();
    this.loadCount = 0;
}

BufferLoader.prototype.loadBuffer = function(url, index) {
    // Load buffer asynchronously
    var request = new XMLHttpRequest();
    request.open("GET", url, true);
    request.responseType = "arraybuffer";

    var loader = this;

    request.onload = function() {
        // Asynchronously decode the audio file data in request.response
        loader.context.decodeAudioData(
            request.response,
            function(buffer) {
                if (!buffer) {
                    alert('error decoding file data: ' + url);
                    return;
                }
                loader.bufferList[index] = buffer;
                if (++loader.loadCount == loader.urlList.length)
                    loader.onload(loader.bufferList);
            },
            function(error) {
                console.error('decodeAudioData error', error);
            }
        );
    }

    request.onerror = function() {
        alert('BufferLoader: XHR error');
    }

    request.send();
}

BufferLoader.prototype.load = function() {
    for (var i = 0; i < this.urlList.length; ++i)
        this.loadBuffer(this.urlList[i], i);
};

function init(){
    var container = document.getElementById( 'container-fluid' );
    //canvasContext = canvas.getContext( '2d' );
    /*container.className = "container";
    canvas = document.createElement( 'canvas' );
    canvasContext = canvas.getContext( '2d' );
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    document.body.appendChild( container );
    container.appendChild(canvas);
    canvasContext.strokeStyle = "#ffffff";
    canvasContext.lineWidth = 2;
    */

    // NOTE: THIS RELIES ON THE MONKEYPATCH LIBRARY BEING LOADED FROM
    // Http://cwilso.github.io/AudioContext-MonkeyPatch/AudioContextMonkeyPatch.js
    // TO WORK ON CURRENT CHROME!!  But this means our code can be properly
    // spec-compliant, and work on Chrome, Safari and Firefox.

    context = new AudioContext();

    // if we wanted to load audio files, etc., this is where we should do it.
    var pianoLoader = new BufferLoader(
        context,
        [
            'audio/piano/mp3/Bb1.mp3',
            'audio/piano/mp3/B1.mp3',
            'audio/piano/mp3/C2.mp3',
            'audio/piano/mp3/Db2.mp3',
            'audio/piano/mp3/D2.mp3',
            'audio/piano/mp3/Eb2.mp3',
            'audio/piano/mp3/E2.mp3',
            'audio/piano/mp3/F2.mp3',
            'audio/piano/mp3/Gb2.mp3',
            'audio/piano/mp3/G2.mp3',
            'audio/piano/mp3/Ab2.mp3',
            'audio/piano/mp3/A2.mp3',
            'audio/piano/mp3/Bb2.mp3',
            'audio/piano/mp3/B2.mp3',
            'audio/piano/mp3/C3.mp3',
            'audio/piano/mp3/Db3.mp3',
            'audio/piano/mp3/D3.mp3',
            'audio/piano/mp3/Eb3.mp3',
            'audio/piano/mp3/E3.mp3',
            'audio/piano/mp3/F3.mp3',
            'audio/piano/mp3/Gb3.mp3',
            'audio/piano/mp3/G3.mp3',
            'audio/piano/mp3/Ab3.mp3',
            'audio/piano/mp3/A3.mp3',
            'audio/piano/mp3/Bb3.mp3',
            'audio/piano/mp3/B3.mp3',
            'audio/piano/mp3/C4.mp3',
            'audio/piano/mp3/Db4.mp3',
            'audio/piano/mp3/D4.mp3',
            'audio/piano/mp3/Eb4.mp3',
            'audio/piano/mp3/E4.mp3',
            'audio/piano/mp3/F4.mp3',
            'audio/piano/mp3/Gb4.mp3',
            'audio/piano/mp3/G4.mp3',
            'audio/piano/mp3/Ab4.mp3',
            'audio/piano/mp3/A4.mp3',
            'audio/piano/mp3/Bb4.mp3',
            'audio/piano/mp3/B4.mp3',
            'audio/piano/mp3/C5.mp3',
            'audio/piano/mp3/Db5.mp3',
            'audio/piano/mp3/D5.mp3'

        ],
        loadedPiano
    );

    pianoLoader.load();

    var hipHopLoader = new BufferLoader(
        context,
        [
            'audio/hiphop/Hard_Kick_1.wav',
            'audio/hiphop/Kick_2.wav',
            'audio/hiphop/Snare_1.wav',
            'audio/hiphop/Clap_1.wav',
            'audio/hiphop/Closed_Hat_1.wav',
            'audio/hiphop/OpenHat_1.wav'
        ],
        loadedHipHop
    );

    hipHopLoader.load();

    var breakbeatLoader = new BufferLoader(
        context,
        [
            'audio/breakbeat/breakbeat_kick.mp3',
            'audio/breakbeat/breakbeat_snare.mp3',
            'audio/breakbeat/breakbeat_closedHat2.mp3',
            'audio/breakbeat/breakbeat_openHat2.mp3'
        ],
        loadedBreakBeat
    );
    breakbeatLoader.load();

    window.onorientationchange = resetCanvas;
    window.onresize = resetCanvas;

    requestAnimFrame(draw);    // start the drawing loop.

            timerWorker = new Worker("js/audioPlayerWorker.js");

            timerWorker.onmessage = function(e) {
                if (e.data == "tick") {
                        // console.log("tick!");
                            scheduler();
                    }
                else
                    console.log("message: " + e.data);
            };
        timerWorker.postMessage({"interval":lookahead});

}
window.addEventListener("load", init );
console.log(tempo);
console.log(pianoLevel);
console.log(drumsLevel);