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

    // get the search bar parameters
    var urlParams = new URLSearchParams(window.location.search);
    
    // get the room id
    room = urlParams.get("roomid");

    // get the player's position
    let pos = urlParams.get("pos");

    // create the new player with the room id and position
    socket.emit('new player', room, pos);

    // set the game room code to the id.
    document.getElementById("room-code").innerHTML = room;
}

/**
 * I will leave this for you to do
 * 
 * @param {number} x 
 * @param {number} y 
 * @param {number} width 
 * @param {number} height 
 * @param {number} radius 
 */
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

/**
 * Initialise the canvas where the board, cards, and names will be drawn
 */
function initializeCanvas() {

    canvas.width = canvasDimension;
    canvas.height = canvasDimension;
    clearTable();
}

/**
 * Clears the middle table where the cards will be places
 */
function clearTable() {

    let ctx = canvas.getContext('2d');
    ctx.roundRect(canvasPadding/2, canvasPadding/2, canvasDimension-canvasPadding,canvasDimension-canvasPadding,5);

    ctx.fillStyle = '#90ee90';
    ctx.fill();
}

/**
 * Choose the trump.
 * Gets the trump from the trump choosing player.
 * Updates the trump in the server.
 * Closes the trump modal
 * 
 * @param {number} trump 
 */
function chooseTrump(trump) {
    socket.emit('update-trump', trump, this.id);

    // close the modal and deal the rest of the hand.
    let trumpModal = document.getElementById('choose-trump-modal');
    trumpModal.style.display = 'none';
}

/**
 * Paints the hand of the players.
 * 
 * @param {Card} cards 
 */
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
        img.style.position = "absolute";
        img.style.left = (offset + (i+1) * (cardWidth - cardSpacing) - cardSpacing) + 'px';

        // on hover, the card moves up to indicate which card the mouse is over.
        img.onmouseover = function() {
            img.style.bottom = 5;
        };

        // when releasing the card, it drops.
        img.onmouseleave = function() {
            img.style.bottom = 0;
        }

        // when the card is clicked, it makes a turn
        img.onclick = function() {
            // play the card that is clicked if it is valid
            turn(img.id);
        };
        
        // append the image to the player's hand
        hand.appendChild(img);
    }
}

/**
 * Adds a card to a div
 * 
 * @param {HTMLElement} div 
 * @param {string} cardName 
 */
function addCardToDiv(div, cardName) {

    let img = new Image(cardWidth * scoreBoardFactor, cardHeight * scoreBoardFactor);
    img.src = 'src/cards/' + cardName + '.png';
    img.style.margin = "5px";

    // append the image to the div
    div.appendChild(img);
}

/**
 * Adds a trick (tenless) to the scoreboard
 * 
 * @param {string} team 
 */
function addTrickToScoreboard(team) {
    let teamTricks = document.getElementById(team + '-tricks');
    addCardToDiv(teamTricks, 'Back');
}

/**
 * Adds a tens to the scoreboard
 * 
 * @param {string} team 
 * @param {Card} ten 
 */
function addTenToScoreboard(team, ten) {
    let teamTens = document.getElementById(team + '-tens');
    addCardToDiv(teamTens, ten.id);
}

function addPointToScoreboard(winner) {
    let id = 'team' + winner + '-total-score';

    let winningTeam = document.getElementById(id);
    
    winningTeam.innerHTML++;
    return;
}

/**
 * delete all the contents from the div
 * 
 * @param {HTMLElement} div 
 */
function deleteAllFromDiv(div) {
    div.innerHTML = "";
}

/**
 * Underline the team you are in.
 * 
 * @param {number} id 
 */
function underlineTeamName(id) {
    let teamNumber = (id == 0 || id == 2) ? 'team1-name' : 'team2-name';

    let teamName = document.getElementById(teamNumber);
    teamName.style.textDecoration = 'underline';
}

/**
 * Initialise the socket's listeners to communicate with the server.
 */
function initializeListeners() {

    /**
     * Initialise the id from the server
     * Then underline the current team name.
     * 
     * @param {number} state
     */
    socket.on('init', function(state) {
        id = state;

        underlineTeamName(id);
    });

    /**
     * Draw the arrow to show who's the current turn is.
     * 
     * @param {number} pos
     */
    socket.on('current-turn', function(pos) {
        drawArrow((4 + pos - id) % 4);
    });
    
    /**
     * No idea what this does
     * @todo
     */
    socket.on('table', function (cards) {
        showState(cards);
    });

    /**
     * Opens the trump modal for the user to choose the trump.
     */
    socket.on('open-trump-modal', function() {
        let modal = document.getElementById('choose-trump-modal');

        modal.style.display = 'block';
    });
    
    /**
     * Nothing atm.
     */
    socket.on('valid', function(card, player) {
        // nothing happens
    });
    
    /**
     * Tells the player that the card they're played is invalid.
     */
    socket.on('invalid', function() {
        alert("Invalid move, please choose a different card");
    });
    
    /**
     * Updates the move by drawing the card that is relative 
     * to the current player.
     * 
     * @param {number} cardID
     * @param {number} relPlayer
     */
    socket.on('update-move', function(cardId, relPlayer) {

        drawCardOnCanvas(relPlayer, cardId);
    });
    
    /**
     * Initialise the players hand
     * 
     * @param {Cards[]} initialHand
     */
    socket.on('initialiseHand', function(initialHand) {
        paintCards(initialHand);
    });
    
    /**
     * Updates the scoreboard
     * 
     * @param {boolean} gameOver
     * @param {Card[]} tens
     * @param {number} winner
     */
    socket.on('update-scoreboard', function(gameOver, tens, winner) {
        
        console.log(gameOver, tens, winner);
        
        // add the tricks and tens to the correct team.
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

        // if the game is over, add a score to the total score.
        if (gameOver) {

            if (winner == 1) {
                room.team1Score++;
            } else {
                room.team2Score++;
            }

            addPointToScoreboard(winner);
        }
    });

    /**
     * Redraw the players hand
     * 
     * @param {Card[]} curHand
     */
    socket.on('redraw-hand', function(curHand) {
        paintCards(curHand);
    });
    
    /**
     * Shows the game over modal 
     * 
     * @param {string} message
     */
    socket.on('end-of-game', function(message) {
        showGameOverModal();
    });
    
    /**
     * Resets the canvas.
     */
    socket.on('reset-canvas', function() {
        clearTable();
    });   

    /**
     * Resets the tens and tricks
     */
    socket.on('reset-tens-and-tricks', function() {
        deleteAllFromDiv(document.getElementById('team1-tens'));
        deleteAllFromDiv(document.getElementById('team2-tens'));
        deleteAllFromDiv(document.getElementById('team1-tricks'));
        deleteAllFromDiv(document.getElementById('team2-tricks'));
    });

    /**
     * Updates the players name and draws the relative position.
     * 
     * @param {number} pos
     * @param {string} name
     */
    socket.on('updateName', function(pos, name) {
        let relPos = (pos - id + 4) % 4;

        drawName(relPos, name);

        let span = document.getElementById('team-player' + pos);
        span.innerHTML = name;
    });

    socket.on('redraw-status', function(trick, team1Status, team2Status, names) {
        redrawGameStatus(trick, team1Status, team2Status, names);
    })
}

/**
 * Calculates the players position
 * 
 * @param {number} pos 
 * 
 * @return {number} x
 * @return {number} y
 */
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

/**
 * handles clicking as a turn
 * @param {number} value 
 */
function turn(value) {
    socket.emit('turn', value);
}

/**
 * show function, resets the canvas and prints the current state
 * 
 * @param {number} state 
 */
function showState(state) {

    let ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, 800, 600);
    ctx.fillText(state, 0, 300);
}

/**
 * Updates the name of the player
 * @param {string} name 
 */
function updateName(name) {
    socket.emit('updateName', name);
}

let navopen = false;
window.onclick = function(event) {
    let modal = document.getElementById("game-over-modal");
    let nav = document.getElementById("mySidenav");
    let navbutton = document.getElementById("sidenav-button");
    
    if (event.target == navbutton) {

    } else if (event.target == modal) {
        modal.style.display = "none";
    } else if (event.target != nav) {
        closeNav();
    }
}

/**
 * Draws an arrow on the canvas based off of the position.
 * @param {number} pos 
 */
function drawArrow(pos) {
    
    let context = canvas.getContext("2d");
    
    // create the arrow element
    let arrow = document.createElement('img');
    arrow.src = 'src/icons/arrow' + pos + '.png';

    // first, clear all arrows. Arrows are not always before the current position
    for (let i = 0; i < 4; i++) {

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

/**
 * Draws the name on the canvas
 * 
 * @param {number} pos 
 * @param {string} name 
 */
function drawName(pos, name) {
    
    // get the x and y of the position
    let {x,y} = calculateNamePosition(pos);

    let context = canvas.getContext('2d');

    // calculate the angle based on the position
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

/**
 * Draw the card on the canvas with the given cardID
 * 
 * @param {number} relPlayer 
 * @param {string} cardId 
 */
function drawCardOnCanvas(relPlayer, cardId) {
    // find the coordinates of the relative player. 
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
};

/**
 * Calculates the position of the name
 * 
 * @param {number} pos 
 * 
 * @return {number} x
 * @return {number} y
 */
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

/**
 * Calculates the arrows position
 * 
 * @param {number} pos 
 * 
 * @return {number} x
 * @return {number} y
 */
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

/**
 * Return to the menu
 */
function goToMenu() {
    location.href = '/';
}

/**
 * Open the side navigation bar
 */
function openNav() {
    navopen = true;
    document.getElementById("mySidenav").style.width = "20%";
}

/**
 * Close the side navigation bar
 */
function closeNav() {
    navopen = false;
    document.getElementById("mySidenav").style.width = "0";
}

enterRoom();
initializeListeners();
initializeCanvas();
closeNav();

/**
 * 
 * @param {Trick} trick 
 * @param {[number, string[], number]} team1Status 
 * @param {[number, string[], number]} team2Status 
 * @param {string[]} names 
 */
function redrawGameStatus(trick, team1Status, team2Status, names) {

    if (trick) {
        let firstPlayer = trick.first;

        // display the cards that have already been played.
        for (let i = 0; i < trick.cards.length; i++) {
            // get the card ID of the trick
            let cardID = trick.cards[i].id;
            let relPlayer = ((firstPlayer + i) - id + 4) % 4;

            drawCardOnCanvas(relPlayer, cardID);
        }
    }

    let {team1Tricks, team1Tens, team1Score} = team1Status;
    let {team2Tricks, team2Tens, team2Score} = team2Status;
    // update the scoreboards

    // update team 1 tricks
    for (let i = 0; i < team1Tricks; i++) {
        // draw a back for each trick
        addTrickToScoreboard('team1');
    }

    // update team 2 tricks
    for (let i = 0; i < team2Tricks; i++) {
        // draw a back for each trick
        addTrickToScoreboard('team2');
    }

    // update team 1 tens
    for (let i = 0; i < team1Tens.length; i++) {
        let card = team1Tens[i];
        addTenToScoreboard('team1', card);
    }

    // update team 2 tens
    for (let i = 0; i < team2Tens.length; i++) {
        let card = team2Tens[i];
        addTenToScoreboard('team2', card);
    }

    // update the score for team 1
    
    // update the score for team 2

    // update the names
    for (let i = 0; i < names.length; i++) {
        let relPlayer = (i - id + 4) % 4;

        drawName(relPlayer, names[i]);
    }
}

/**
 * Shows the game over modal
 */
function showGameOverModal() {
    document.getElementById('game-over-modal').style.display='block';
}

/**
 * Closes the game over modal
 */
function closeGameOverModal() {
    document.getElementById('game-over-modal').style.display='none';
}

/**
 * Creates a new game
 */
function newGame() {
    // make new game object
    socket.emit('newGame', room); // deals the hand here too

    closeGameOverModal();
}

/**
 * Change the players name 
 * 
 * @param {string} name 
 */
function changeName(name) {
    socket.emit('changeName', name);
}

let pname = document.getElementById('name0');
pname.onkeyup = function(e) {
    changeName(pname.innerHTML);
}
