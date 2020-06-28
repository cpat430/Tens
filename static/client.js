// global variables
var socket = io(); 
var canvas = document.getElementById('canvas');
var scoreboard = document.getElementById('scoreboard');
var hand = document.getElementById('hand');
var id = -1; // current player id
var suits = ['S', 'C', 'D', 'H'];
var cardWidth = 69,
    cardHeight = 101,
    cardSpacing = 34.5;

// declare which room you want to join, and what your name is
function enterRoom() {
    var urlParams = new URLSearchParams(window.location.search);
    
    let room = urlParams.get("roomid");
    let pos = urlParams.get("pos");
    socket.emit('new player', room, pos);
}

function initializeCanvas() {

    canvas.width = 500;
    canvas.height = 500;
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
            // let img = new Image(69,101);
            let img = document.createElement('img');
            img.width = 69;
            img.height = 101;
            img.src = 'cards/full_deck/' + cardString + '.png';
            
            // set the id of the image so it can be removed later
            img.id = initialHand[i].suit.toString() + initialHand[i].value.toString();
            
            // style the card here
            // img.style.flexBasis = "200px";
            // img.style.flex = "10px";
            // img.style.alignContent = "space-between 10px";
            img.style.position = "absolute";
            // img.style.left = "20px";
            img.style.left = ((i+1) * (cardWidth - cardSpacing) - cardSpacing) + 'px';

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

    });

    socket.on('redraw-hand', function(curHand) {

        while (hand.firstChild) {
            hand.removeChild(hand.firstChild);
        }

        // console.log(hand);
        for (let i = 0; i < curHand.length; i++) {
            
            let cardString = suits[curHand[i].suit] + curHand[i].value;
            
            // set the card to a png image
            // let img = new Image(69,101);
            let img = document.createElement('img');
            img.width = 69;
            img.height = 101;
            img.src = 'cards/full_deck/' + cardString + '.png';
            
            // set the id of the image so it can be removed later
            img.id = curHand[i].suit.toString() + curHand[i].value.toString();
            
            // style the card here
            // img.style.flexBasis = "200px";
            // img.style.flex = "10px";
            // img.style.alignContent = "space-between 10px";
            img.style.position = "absolute";
            // img.style.left = "20px";
            img.style.left = ((i+1) * (cardWidth - cardSpacing) - cardSpacing) + 'px';

            img.onclick = function() {
                // play the card that is clicked if it is valid
                turn(img.id);
            };
            
            // append the image to the player's hand
            hand.appendChild(img);
        }
    });

    // updates at the end of a trick. 
    socket.on('add-winning-card', function(gameOver, tens, winner) {

        // update the scoreboard here.
        if (winner == 1) {
            let team1Tricks = document.getElementById('team1-current-tricks');
            // let team1Tens = document.getElementById('team1-tens');
            let cardString = 'cards/full_deck/Back.png';

            if (tens.length) {
                for (let i = 0; i < tens.length; i++) {
                    let img = document.createElement('img');
                    cardString = 'cards/full_deck/' + suits[tens[i].suit].toString() + tens[i].value.toString() + '.png';
                    img.src = cardString;
                    img.width = cardWidth;
                    img.height = cardHeight;
                    // img.style.position = "absolute";
                    // img.style.left = ((i+1) * (cardWidth - cardSpacing) - cardSpacing) + 'px';

                    team1Tricks.appendChild(img);
                }
            } else {
                let img = document.createElement('img');
                img.src = cardString;
                img.width = 69;
                img.height = 101;
                img.left = cardSpacing;
                team1Tricks.appendChild(img);
            }
            // team1Tens.innerHTML = eval(team1Tens.innerHTML) + eval(tens);

        } else {
            let team2Tricks = document.getElementById('team2-current-tricks');
            // let team1Tricks = document.getElementById('team1-current-tricks');
            // let team1Tens = document.getElementById('team1-tens');
            let cardString = 'cards/full_deck/Back.png';

            if (tens.length) {
                for (let i = 0; i < tens.length; i++) {
                    let img = document.createElement('img');
                    cardString = 'cards/full_deck/' + suits[tens[i].suit].toString() + tens[i].value.toString() + '.png';
                    img.src = cardString;
                    img.width = cardWidth;
                    img.height = cardHeight;
                    // img.style.position = "relative";
                    // img.style.left = ((i+1) * (cardWidth - cardSpacing) - cardSpacing) + 'px';

                    team2Tricks.appendChild(img);
                }
            } else {
                let img = document.createElement('img');
                img.src = cardString;
                img.width = 69;
                img.height = 101;
                img.left = cardSpacing;
                team2Tricks.appendChild(img);
            }
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

function updateName(name) {
    socket.emit('updateName', name);
}

function initialiseModal() {
    // Get the modal
    var modal = document.getElementById("game-over-modal");

    // Get the button that opens the modal
    var btn = document.getElementById("open-modal-button");

    // Get the <span> element that closes the modal
    var span = document.getElementsByClassName("close")[0];

    // When the user clicks on the button, open the modal
    btn.onclick = function() {
        modal.style.display = "block";
    }

    // When the user clicks on <span> (x), close the modal
    span.onclick = function() {
        modal.style.display = "none";
    }

    // When the user clicks anywhere outside of the modal, close it
    window.onclick = function(event) {
        if (event.target == modal) {
            modal.style.display = "none";
        }
    }
}

enterRoom();
initializeCanvas();
initialiseScoreboard();
initializeListeners();
initializePlayer();
initialiseModal();
updateName("Yoohoo");

// function toggle_button(btnId) {
//     var cur_colour = document.getElementById(btnId).style.backgroundColor;

//     console.log(document.getElementById(btnId).style.backgroundColor);

//     var property = document.getElementById(btnId);

//     if (cur_colour == "red") {
//         property.style.backgroundColor = "green";
//     } else {
//         property.className = "red";
//     }
// }