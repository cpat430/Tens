// keep this!
var socket = io();

// here, you can declare which room you want to join, and what your name is
socket.emit('new player', '12345', 'ashl3y harri$');

var canvas = document.getElementById('canvas');
canvas.width = 800;
canvas.height = 600;
canvas.style.border = "2px solid";

var button = document.getElementById('button');
var textinput = document.getElementById('textinput');
var hand = document.getElementById('hand');

// handles clicking as a turn
button.onclick = turn;
function turn(e) {
    socket.emit('turn', textinput.value); // this is the way of having a turn
}

var id = -1;
// called on initialising the player
socket.on('init', function(state) {
    let paragraph = document.getElementById('state');
    paragraph.innerHTML = "You are person " + state;
    id = state;

});

// called on every update of the state
socket.on('state', function (state) {

    // reset the div state
    // hand = "";

    for (let i = 0; i < state.hand.length; i++) {
        // set the card to a png image
        let img = new Image(75,100);
       
        img.src = 'cards/joker.jpeg';

        console.log(img);

        hand.appendChild(img);
    }
    // hand.innerHTML = state;
    // hand.appendChild() = state;
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

