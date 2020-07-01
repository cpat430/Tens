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
    tableFactor = 1, // how many times larger does it appear on the table
    tableCardHeight = cardHeight * tableFactor,
    tableCardWidth = cardWidth * tableFactor,
    scoreBoardFactor = 0.5
    arrowWidth = 30,
    arrowHeight = 30,
    canvasDimension = 650,
    canvasPadding = 100;

let room = '-1';

// declare which room you want to join, and what your name is
function enterRoom() {
    var urlParams = new URLSearchParams(window.location.search);
    
    room = urlParams.get("roomid");
    let pos = urlParams.get("pos");
    socket.emit('new player', room, pos);

    document.getElementById("room-code").innerHTML = room;
}
CanvasRenderingContext2D.prototype.roundRect = function (x, y, width, height, radius) {
    if (width < 2 * radius) radius = width / 2;
    if (height < 2 * radius) radius = height / 2;
    this.beginPath();
    this.moveTo(x + radius, y);
    this.arcTo(x + width, y, x + width, y + height, radius);
    this.arcTo(x + width, y + height, x, y + height, radius);
    this.arcTo(x, y + height, x, y, radius);
    this.arcTo(x, y, x + width, y, radius);
    this.closePath();
    return this;
  }

function initializeCanvas() {

    canvas.width = canvasDimension;
    canvas.height = canvasDimension;
    clearTable();
}

function clearTable() {
    let ctx = canvas.getContext('2d');
    ctx.roundRect(canvasPadding/2, canvasPadding/2, canvasDimension-canvasPadding,canvasDimension-canvasPadding,5);

    ctx.fillStyle = '#90ee90';
    ctx.fill();
}

function chooseTrump(trump) {

    console.log('this is the trump number', trump);

    socket.emit('update-trump', trump, this.id);

    // close the modal and deal the rest of the hand.
    let trumpModal = document.getElementById('choose-trump-modal');
    trumpModal.style.display = 'none';
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

    socket.on('current-turn', function(pos) {
        drawArrow((4 + pos - id) % 4);
    });
    
    socket.on('table', function (cards) {
        showState(cards);
    });

    socket.on('open-trump-modal', function() {
        let modal = document.getElementById('choose-trump-modal');

        modal.style.display = 'block';
    });
    
    socket.on('valid', function(card, player) {
            // nothing happens
    });
    
    socket.on('invalid', function() {
        alert("Invalid move, please choose a different card");
    });
    
    socket.on('update-move', function(cardId, relPlayer) {
        let {x,y} = calculatePlayer(relPlayer);
        
        // get the card's image value
        
        // create a new image for the played card
        let img = new Image();
        img.src = 'src/cards/' + cardId + '.png';
        
        // get the context of the canvas
        let context = canvas.getContext("2d");
        
        // once the image loads, it will place the card on the screen
        img.addEventListener('load', function() {
            // draw the card on the board
            context.drawImage(img, x, y, tableCardWidth, tableCardHeight);

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
        clearTable();
    });   

    socket.on('reset-tens-and-tricks', function() {
        deleteAllFromDiv(document.getElementById('team1-tens'));
        deleteAllFromDiv(document.getElementById('team2-tens'));
        deleteAllFromDiv(document.getElementById('team1-tricks'));
        deleteAllFromDiv(document.getElementById('team2-tricks'));
    });

    socket.on('updateName', function(pos, name) {
        let relPos = (pos - id + 4) % 4;

        drawName(relPos, name);
    })
}

function calculatePlayer(pos) {

    let x = canvas.width/2;
    let y = canvas.height/2;

    let delta = 3/5;

    if (pos == 0) {
        y *= (2-delta);
    } else if (pos == 1) {
        x *= (delta);
    } else if (pos == 2) {
        y *= (delta);
    } else {
        x *= (2-delta);
    }

    x -= tableCardWidth/2;
    y -= tableCardHeight/2;

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

function drawArrow(pos) {
    
    let context = canvas.getContext("2d");
    
    let arrow = document.createElement('img');
    arrow.src = 'src/icons/arrow' + pos + '.png';

    // first, clear all arrows. Arrows are not always before the current position
    for (let i = 0; i < 4; i++) {
        let coords = calculateArrowPosition(i);

        let {x, y} = calculateArrowPosition(i);
        context.clearRect(x, y, arrowWidth, arrowHeight);
        context.fillStyle = '#90ee90';
        context.fillRect(x, y, arrowWidth, arrowHeight);
    }
    
    

    // once the image loads, it will place the card on the screen
    arrow.addEventListener('load', function() {
        // draw the arrow to the next person.
        let {x, y} = calculateArrowPosition(pos);
        context.drawImage(arrow, x, y, arrowWidth, arrowHeight);

    }, false); // no idea what the false means    
}

function drawName(pos, name) {
    let {x,y} = calculateNamePosition(pos);

    let context = canvas.getContext('2d');

    let angle = pos == 1 ? -Math.PI/2 : pos == 3 ? Math.PI/2 : 0;

    context.save();
    context.translate(x, y);
    context.rotate(angle);

    let width = 500, height = canvasPadding/2;
    let lineHeight = 15;

    // draw rectangle under first
    context.clearRect(-width/2, -height/2, width, height);

    context.font = "25px Baloo-Regular";
    context.textAlign = "center";
    context.fillStyle = 'black';
    context.fillText(name, 0, lineHeight / 2);
    context.restore();

}

function calculateNamePosition(pos) {
    let x = canvas.width/2;
    let y = canvas.height/2;

    if (pos == 0) {
        y = canvas.height - canvasPadding/4;
    } else if (pos == 1) {
        x = canvasPadding/4;
    } else if (pos == 2) {
        y = canvasPadding/4;
    } else {
        x = canvas.width - canvasPadding/4;
    }

    return {x,y};
}

function calculateArrowPosition(pos) {
    
    let x = canvas.width/2;
    let y = canvas.height/2;

    let delta = 1/4;

    if (pos == 0) {
        y *= (2-delta);
    } else if (pos == 1) {
        x *= (delta);
    } else if (pos == 2) {
        y *= (delta);
    } else {
        x *= (2-delta);
    }

    x -= arrowWidth/2;
    y -= arrowHeight/2;

    return {
        x,
        y
    };
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
initializeListeners();
initializeCanvas();
// initialiseIcons();
// initialiseModal();
// updateName("Yoohoo");
closeNav();

function showGameOverModal() {
    document.getElementById('game-over-modal').style.display='block';
}

function closeGameOverModal() {
    document.getElementById('game-over-modal').style.display='none';
}

function newGame() {
    // make new game object
    socket.emit('newGame', room); // deals the hand here too

    closeGameOverModal();
}


function changeName(name) {
    socket.emit('changeName', name);
}

let pname = document.getElementById('name0');
console.log(pname);
pname.onkeyup = function(e) {
    changeName(pname.innerHTML);
    console.log(e);
}





  
