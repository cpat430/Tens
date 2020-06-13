// keep this!
var socket = io();

socket.emit('new player');

var canvas = document.getElementById('canvas');
canvas.width = 800;
canvas.height = 600;
canvas.style.border = "2px solid";

var button = document.getElementById('button');
var textinput = document.getElementById('textinput');
var hand = document.getElementById('hand');

function getName() {
    return (prompt("Your name please"));
}

let playerName = getName();

// handles clicking as a turn
button.onclick = turn;
function turn(e) {
    socket.emit('turn', textinput.value); // this is the way of having a turn
}

var id = -1;
// called on initialising the player
socket.on('init', function(state) {
    let paragraph = document.getElementById('state');
    paragraph.innerHTML = "You are person " + state + playerName;
    id = state;

});

// called on every update of the state
socket.on('state', function (state) {
    hand.innerHTML = state;
});

socket.on('table', function (cards) {
    showState(cards);
})

socket.on('onturn', function() {
    document.getElementById('turn').innerHTML="On Turn";
})

socket.on('offturn', function() {
    document.getElementById('turn').innerHTML="Off Turn";
})

// show function - resets the canvas and prints the current state
function showState(state) {
    let ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, 800, 600);
    ctx.fillText(state, 0, 300);
    // console.log(state);
}