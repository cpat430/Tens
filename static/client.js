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

socket.on('valid', function(card, player) {
    var cardId = card.suit.toString() + card.value.toString();

    // remove the card from the hand
    var toRemove = document.getElementById(cardId);
    
    toRemove.parentNode.removeChild(toRemove);
});

socket.on('invalid', function() {
    alert("Invalid move, please choose a different card");
});

socket.on('update-move', function(suits, suit, value, player) {
    
    var x,y;
    var cardWidth = 69 * 2;
    var cardHeight = 101 * 2;

    // determine the position of the card based on the player
    if (player == 0) {
        x = canvas.width/2 - cardWidth/2;
        y = ((canvas.height*3)/4) - cardHeight/2;
    } else if (player == 1) {
        x = ((canvas.width * 3)/4) - cardWidth/2;
        y = canvas.height/2 - cardHeight/2;
    } else if (player == 2) {
        x = canvas.width/2 - cardWidth/2;
        y = canvas.height/4 - cardHeight/2;
    } else {
        x = canvas.width/4 - cardWidth/2;
        y = canvas.height/2 - cardHeight/2;
    }

    // get the card's image value
    let cValue = suits[suit].toString() + value.toString();

    // create a new image for the played card
    let img = new Image();
    img.src = 'cards/full_deck/' + cValue + '.png';

    // get the context of the canvas
    var context = canvas.getContext("2d");

    // once the image loads, it will place the card on the screen
    img.addEventListener('load', function() {
        context.drawImage(img, x, y, cardWidth, cardHeight);
    }, false); // no idea what the false means
});

socket.on('initialiseHand', function(initialHand, suits) {
    for (let i = 0; i < initialHand.length; i++) {

        let cardString = suits[initialHand[i].suit] + initialHand[i].value;

        // set the card to a png image
        let img = new Image(69,101);
        img.src = 'cards/full_deck/' + cardString + '.png';

        // set the id of the image so it can be removed later
        img.id = initialHand[i].suit.toString() + initialHand[i].value.toString();

        img.onclick = function() {
            // play the card that is clicked if it is valid
            turn(img.id);
        };

        // append the image to the player's hand
        hand.appendChild(img);
    }
});

socket.on('reset-canvas', function() {

    console.log('cleared');
    var context = canvas.getContext("2d");

    context.clearRect(0, 0, canvas.width, canvas.height);
});

// show function - resets the canvas and prints the current state
function showState(state) {
    let ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, 800, 600);
    ctx.fillText(state, 0, 300);
}

