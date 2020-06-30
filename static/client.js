// global variables
var socket = io(); 
var canvas = document.getElementById('canvas');
var scoreboard = document.getElementById('scoreboard');
var hand = document.getElementById('hand');
var id = -1; // current player id
var suits = ['S', 'D', 'C', 'H'];
var cardWidth = 90,
    cardHeight = cardWidth * 1.5,
    cardSpacing = cardWidth/2.,
    tableFactor = 1.1, // how many times larger does it appear on the table
    scoreBoardFactor = 0.5;

let room = '-1';

// declare which room you want to join, and what your name is
function enterRoom() {
    var urlParams = new URLSearchParams(window.location.search);
    
    room = urlParams.get("roomid");
    let pos = urlParams.get("pos");
    socket.emit('new player', room, pos);

    document.getElementById("room-code").innerHTML = room;
}

function initializeCanvas() {

    canvas.width = 550;
    canvas.height = 550;
    canvas.style.borderRadius = "15px";

    // let arrow = document.createElement('img');
    // arrow.src = 'src/icons/arrow.png';
    // arrow.width = '30px';
    // arrow.height = '30px';

    // var context = canvas.getContext("2d");

    // let x = canvas.width / 2;
    // let y = (canvas.height / 4) * 3;

    // // draw the arrow on the board for player 0
    // context.drawImage(arrow, x, y);

    // console.log('image drawn');
}

function paintCards(cards) {
    hand.innerHTML = "";
    hand.style.height = cardHeight;
    let outerwidth = document.getElementById("game-board").offsetWidth;
    let totalwidth = cardWidth + (cards.length - 1) * cardSpacing;
    let offset = (outerwidth - totalwidth) / 2;

    for (let i = 0; i < cards.length; i++) {
            
        let cardString = cards[i].id;
        
        // set the card to a png image
        
        let img = document.createElement('img');
        img.width = cardWidth;
        img.height = cardHeight;
        img.src = 'src/cards/' + cardString + '.png';
        
        // set the id of the image so it can be removed later
        img.id = cards[i].id;
        
        // style the card here
        // img.style.flexBasis = "200px";
        // img.style.flex = "10px";
        // img.style.alignContent = "space-between 10px";
        img.style.position = "absolute";
        // img.style.left = "20px";

        img.style.left = (offset + (i+1) * (cardWidth - cardSpacing) - cardSpacing) + 'px';
        img.onmouseover = function() {
            img.style.bottom = 5;
        };
        img.onmouseleave = function() {
            img.style.bottom = 0;
        }

        img.onclick = function() {
            // play the card that is clicked if it is valid
            turn(img.id);
        };
        
        // append the image to the player's hand
        hand.appendChild(img);
    }
}

function addCardToDiv(div, cardName) {
    let img = new Image(cardWidth * scoreBoardFactor, cardHeight * scoreBoardFactor);
    img.src = 'src/cards/' + cardName + '.png';
    img.style.margin = "5px";

    div.appendChild(img);
}

function addTrickToScoreboard(team) {
    let teamTricks = document.getElementById(team + '-tricks');
    addCardToDiv(teamTricks, 'Back');
}

function addTenToScoreboard(team, ten) {
    let teamTens = document.getElementById(team + '-tens');
    addCardToDiv(teamTens, ten.id);
}

function deleteAllFromDiv(div) {
    div.innerHTML = "";
    console.log(div);
}

function initializeListeners() {
    // called on initialising the player
    socket.on('init', function(state) {
        id = state;
    });
    
    socket.on('table', function (cards) {
        showState(cards);
    });
    
    socket.on('onturn', function() {
        // document.getElementById('turn').innerHTML="On Turn";
    });
    
    socket.on('offturn', function() {
        // document.getElementById('turn').innerHTML="Off Turn";
    });
    
    socket.on('valid', function(card, player) {
            // nothing happens
    });
    
    socket.on('invalid', function() {
        alert("Invalid move, please choose a different card");
    });
    
    socket.on('update-move', function(suit, value, relPlayer) {
        
        let tableCardWidth = cardWidth * tableFactor;
        let tableCardHeight = cardHeight * tableFactor;
        
        // determine the position of the card based on the player
        // if (relPlayer == 0) {
        //     x = canvas.width/2 - tableCardWidth/2;
        //     y = ((canvas.height*3)/4) - tableCardHeight/2;
        // } else if (relPlayer == 1) {
        //     x = canvas.width/4 - tableCardWidth/2;
        //     y = canvas.height/2 - tableCardHeight/2;
        // } else if (relPlayer == 2) {
        //     x = canvas.width/2 - tableCardWidth/2;
        //     y = canvas.height/4 - tableCardHeight/2;
        // } else {
        //     x = ((canvas.width * 3)/4) - tableCardWidth/2;
        //     y = canvas.height/2 - tableCardHeight/2;
        // }

        let {x,y} = calculatePlayer(relPlayer);
        x -= tableCardWidth/2;
        y -= tableCardHeight/2;

        
        // get the card's image value
        let cValue = suits[suit].toString() + value.toString();
        
        // create a new image for the played card
        let img = new Image();
        img.src = 'src/cards/' + cValue + '.png';
        
        // get the context of the canvas
        var context = canvas.getContext("2d");
        
        // once the image loads, it will place the card on the screen
        img.addEventListener('load', function() {
            // draw the card on the board
            context.drawImage(img, x, y, tableCardWidth, tableCardHeight);
            
            // delete the arrow for the current player

            // draw the arrow to the next person.


        }, false); // no idea what the false means
    });
    
    socket.on('initialiseHand', function(initialHand) {
        paintCards(initialHand);
    });
    
    socket.on('update-scoreboard', function(gameOver, tens, winner) {
        
        console.log(gameOver, tens, winner);
        
        if (winner == 1) {
            addTrickToScoreboard("team1");
            for (let i = 0; i < tens.length; i++) {
                addTenToScoreboard("team1", tens[i]);
            }
        } else {
            addTrickToScoreboard("team2");
            for (let i = 0; i < tens.length; i++) {
                addTenToScoreboard("team2", tens[i]);
            }
        }
    });

    socket.on('redraw-hand', function(curHand) {
        paintCards(curHand);
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
                img.width = cardWidth;
                img.height = cardHeight;
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
                img.width = cardWidth;
                img.height = cardHeight;
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
        showGameOverModal();
    });
    
    socket.on('reset-canvas', function() {
        var context = canvas.getContext("2d");
        context.clearRect(0, 0, canvas.width, canvas.height);
    });   

    socket.on('reset-tens-and-tricks', function() {
        deleteAllFromDiv(document.getElementById('team1-tens'));
        deleteAllFromDiv(document.getElementById('team2-tens'));
        deleteAllFromDiv(document.getElementById('team1-tricks'));
        deleteAllFromDiv(document.getElementById('team2-tricks'));
    }) 
}

function calculatePlayer(player) {

    let x,y;

    if (player == 0) {
        x = canvas.width/2;
        y = ((canvas.height*3)/4);
    } else if (player == 1) {
        x = canvas.width/4;
        y = canvas.height/2;
    } else if (player == 2) {
        x = canvas.width/2;
        y = canvas.height/4;
    } else {
        x = ((canvas.width * 3)/4);
        y = canvas.height/2;
    }

    return {
        x,
        y
    };
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

function goToMenu() {
    location.href = '/';
}

function openNav() {
    document.getElementById("mySidenav").style.width = "20%";
}

function closeNav() {
    document.getElementById("mySidenav").style.width = "0";
}

enterRoom();
initializeCanvas();
initializeListeners();
initialiseIcons();
initialiseModal();
updateName("Yoohoo");
closeNav();

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


function showGameOverModal() {
    document.getElementById('game-over-modal').style.display='block';
}

function closeGameOverModal() {
    document.getElementById('game-over-modal').style.display='none';
}

function newGame() {
    // make new game object
    socket.emit('newGame', room); // deals the hand here too
    // clear table

    // clear cards

    

    closeGameOverModal();
}
