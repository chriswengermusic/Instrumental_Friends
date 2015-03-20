/**
 * Created by cwenger on 3/20/2015.
 */

var increaseTempo = document.getElementById('plusTempo');
increaseTempo.onclick = function() {
    var tempo = document.getElementById('showTempo').innerHTML;
    var newTempo = parseInt(tempo) + 1;
    document.getElementById('showTempo').innerHTML = newTempo;
};

var decreaseTempo = document.getElementById('minusTempo');
decreaseTempo.onclick = function() {
    var tempo = document.getElementById('showTempo').innerHTML;
    var newTempo = parseInt(tempo) - 1;
    document.getElementById('showTempo').innerHTML = newTempo;
};

var decreaseDrums = document.getElementById("minusDrums");
decreaseDrums.onclick = function() {
    var volume = document.getElementById('dLevel').innerHTML;
    var newVolume = parseInt(volume) - 1;
    document.getElementById('dLevel').innerHTML = newVolume;
};

var increaseDrums = document.getElementById("plusDrums");
decreaseDrums.onclick = function() {
    var volume = document.getElementById('dLevel').innerHTML;
    var newVolume = parseInt(volume) + 1;
    document.getElementById('dLevel').innerHTML = newVolume;
};

/*var increasePiano = document.getElementById("plusPiano");
increasePiano.onclick = function() {
    var volume = document.getElementById('pLevel').innerHTML;
    var newVolume = parseInt(volume) + 1;
    document.getElementById('pLevel').innerHTML = newVolume;
};
*/
var decreasePiano = document.getElementById("minusPiano");
decreasePiano.onclick = function() {
    var volume = document.getElementById('pLevel').innerHTML;
    var newVolume = parseInt(volume) - 1;
    document.getElementById('pLevel').innerHTML = newVolume;
};

var increasePiano = function() {
    var volume = parseInt(document.getElementById('pLevel').innerHTML);
    var newVolume = volume + 1;
    document.getElementsById('pLevel').innerHTML = newVolume;
};