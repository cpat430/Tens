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
socket.emit('name', playerName);

// handles clicking as a turn
button.onclick = turn;
function turn(value) {
    // socket.emit('turn', textinput.value); // this is the way of having a turn
    socket.emit('turn', value);
}

var id = -1;
// called on initialising the player
socket.on('init', function(state) {
    let paragraph = document.getElementById('state');
    paragraph.innerHTML = "You are person " + state + playerName;
    id = state;
    // update();

});

socket.on('table', function (cards) {
    showState(cards);
});

socket.on('onturn', function() {
    document.getElementById('turn').innerHTML="On Turn";
});

socket.on('offturn', function() {
    document.getElementById('turn').innerHTML="Off Turn";
});

socket.on('invalid', function() {
    alert("Invalid move, please choose a different card");
});

socket.on('initialiseHand', function(initialHand, suits) {
    for (let i = 0; i < initialHand.length; i++) {

        let cardString = suits[initialHand[i].suit] + initialHand[i].value;

        // set the card to a png image
        let img = new Image(69,101);
        img.src = 'cards/full_deck/' + cardString + '.png';

        console.log(img.src);
        img.onclick = function() {
            var currentCard = this.card;
            console.log("I am playing " + currentCard);

            // play the card that is clicked if it is valid
            turn(i);
        };

        hand.appendChild(img);
    }
})

// show function - resets the canvas and prints the current state
function showState(state) {
    let ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, 800, 600);
    ctx.fillText(state, 0, 300);
    // console.log(state);
}