// global variables
var socket = io(); 
var canvas = document.getElementById('canvas');
var scoreboard = document.getElementById('scoreboard');
var hand = document.getElementById('hand');
var id = -1; // current player id

// declare which room you want to join, and what your name is
function enterRoom() {
    var urlParams = new URLSearchParams(window.location.search);
    
    let room = urlParams.get("roomid");
    socket.emit('new player', room, 'ashl3y harri$');
}

function initializeCanvas() {
    canvas.width = 800;
    canvas.height = 600;
    canvas.style.border = "2px solid";
}

function initialiseScoreboard() {
    // leaderboard.width = 400;
    // leaderboard.height = 300;
    // leaderboard.style.border = "2px solid";
    
}

function initializeListeners() {
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
    
    socket.on('update-move', function(suits, suit, value, relPlayer) {
        
        var x,y;
        var cardWidth = 69 * 2;
        var cardHeight = 101 * 2;
        
        // determine the position of the card based on the player
        if (relPlayer == 0) {
            x = canvas.width/2 - cardWidth/2;
            y = ((canvas.height*3)/4) - cardHeight/2;
        } else if (relPlayer == 1) {
            x = canvas.width/4 - cardWidth/2;
            y = canvas.height/2 - cardHeight/2;
        } else if (relPlayer == 2) {
            x = canvas.width/2 - cardWidth/2;
            y = canvas.height/4 - cardHeight/2;
        } else {
            x = ((canvas.width * 3)/4) - cardWidth/2;
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
    
    socket.on('update-scoreboard', function(gameOver, tens, winner) {
        
        console.log(gameOver, tens, winner);
        
        if (winner == 1) {
            let team1Tricks = document.getElementById('team1-tricks');
            let team1Tens = document.getElementById('team1-tens');
            
            team1Tricks.innerHTML++;
            team1Tens.innerHTML = eval(team1Tens.innerHTML) + eval(tens);
            
        } else {
            let team2Tricks = document.getElementById('team2-tricks');
            let team2Tens = document.getElementById('team2-tens');
            
            team2Tricks.innerHTML++;
            team2Tens.innerHTML = eval(team2Tens.innerHTML) + eval(tens);
        }
        
        if (gameOver) {
            let id = 'team' + winner + '-total-score';
            let winningTeam = document.getElementById(id);
            
            winningTeam.innerHTML++;
            return;
        }
        
        console.log('tens', tens);
        
        
    });
    
    socket.on('end-of-game', function(message) {
        alert(message);
    });
    
    socket.on('reset-canvas', function() {
        
        console.log('cleared');
        var context = canvas.getContext("2d");
        
        context.clearRect(0, 0, canvas.width, canvas.height);
    });
    
    
}

// handles clicking as a turn
function turn(value) {
    socket.emit('turn', value);
}

// show function - resets the canvas and prints the current state
function showState(state) {
    let ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, 800, 600);
    ctx.fillText(state, 0, 300);
}

enterRoom();
initializeCanvas();
initialiseScoreboard();
initializeListeners();
