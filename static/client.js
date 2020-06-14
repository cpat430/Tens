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
function turn(value) {
    // socket.emit('turn', textinput.value); // this is the way of having a turn
    socket.emit('turn', value);
}

var id = -1;
// called on initialising the player
socket.on('init', function(state) {
    let paragraph = document.getElementById('state');
    paragraph.innerHTML = "You are person " + state;
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

socket.on('valid', function(card) {
    // canvas.innerHTML.appendChild(card);
    // canvas.appendChild(card);
    // canvas.fillText(card);
    // var text = document.getElementById('played-cards');

    // text.innerHTML.appendChild(card);
    // text.innerHTML = card;

    // canvas.innerText = card;
    var context = canvas.getContext("2d");
    context.font = '30px Arial';
    context.fillText("sup dawg", canvas.height/2, canvas.width/2);
    
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
            // var currentCard = this.card;
            console.log("I am playing " + cardString);

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

