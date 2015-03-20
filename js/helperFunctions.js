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
}