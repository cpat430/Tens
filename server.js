// Dependencies.
var express = require('express');
var http = require('http');
var path = require('path');
var socketIO = require('socket.io');
var app = express();
var server = http.Server(app);
var io = socketIO(server);

const PORT = process.env.PORT || 5000;

app.set('port', PORT);
app.use('/static', express.static(__dirname + '/static'));
app.use('/cards', express.static(__dirname + '/cards'));

// Routing
app.get('/', function (request, response) {
    response.sendFile(path.join(__dirname, 'menu.html'));
});

// Routing
app.get('/game', function (request, response) {
    response.sendFile(path.join(__dirname, 'game.html'));
});

server.listen(PORT, function () {
    console.log('Starting server on port 5000');
});

// create the suits and the card values to create a deck of cards
let suits = ['S', 'C', 'D', 'H'];
let values = [2,3,4,5,6,7,8,9,10,11,12,13,14];
const num_players = 4;
const max_score = 13;

class Card {
    constructor(suit, value) {
        this.suit = suit;
        this.value = value;
    }

    toString() { // need this for readline-synd
        let output;

        if (this.value == 11) {
            output= 'J';
        } else if (this.value == 12) {
            output = 'Q';
        } else if (this.value == 13) {
            output = 'K';
        } else if (this.value == 14) {
            output = 'A'
        } else {
            output = this.value;
        }

        return suits[this.suit] + output;
    }

    get_suit() {
        return this.suit;
    }
}

class Deck {
    constructor() {
        this.deck = [];
    }

    create_deck(suits, values) {
        for (let suit = 0; suit < 4; suit++) {
            for (let value of values) {
                this.deck.push(new Card(suit, value));
            }
        }
    }

    shuffle_deck() {
        let counter = this.deck.length, temp, i;

        while (counter) {
            i = Math.floor(Math.random() * counter--);
            temp = this.deck[counter];
            this.deck[counter] = this.deck[i];
            this.deck[i] = temp;
        }

        return this.deck;
    }

    deal(hand, cards) {
        while (hand.length < cards) {
            hand.push(this.deck.pop());
        }
    }
}

class Player {
    constructor(position) {
        this.position = position;
        this.hand = [];
        this.tricks = [];
        this.tens = 0;
        this.num_suits = [0,0,0,0];
    }

    get_trump() {

        // deal five cards to the first player
        this.hand = deck.deal(this.hand, 5);

        // show the hand that they can choose the trump from
        console.log(p1.hand);

        // to ensure that a trump is chosen
        let index = -1;

        // ensures one trump is chosen
        while (index == -1) {
            index = readline.keyInSelect(suits, 'Which suit?');
        }

        console.log('Ok, ' + suits[index] + ' is now the trump.\n');

        let trump = suits[index];

        return trump;
    }

    check_win(partner) {

        console.log('Tens: ' + (this.tens + partner.tens));
        console.log('Tricks: ' + (this.tricks.length + partner.tricks.length));

        if ((this.tens + partner.tens) > 2) {
            return true;
        } else if ((this.tens + partner.tens) == 2 && (this.tricks.length + partner.tricks.length) >= 7) {
            return true;
        } else {
            return false;
        }
    }

    display_hand() {
        for (let i = 0; i < this.hand.length; i++) {
            console.log(this.hand[i].toString());
        }
    }

    count_suits() {
        for (let i = 0; i < this.hand.length; i++) {
            this.num_suits[this.hand[i].get_suit()]++;
        }
    }

    toString() {
        let s = "";
        for (let i = 0; i < this.hand.length; i++) {
            s += this.hand[i].toString() + " ";
        }
        return s;
    }

    sortHand() {
        this.hand.sort(function(a, b) {
            if (a.suit === b.suit) {
                if (a.value < b.value) return -1;
                if (a.value > b.value) return 1;
                return 0;
            }
            if (a.suit < b.suit) return -1;
            if (a.suit > b.suit) return 1;
        });
    }
}

class Trick {
    constructor(trump) {
        this.cards = [];
        this.tens = 0;
        this.trump = trump;
    }

    get_suit() {
        return this.cards[0].suit;
    }

    // gets the winner assuming all cards played are valid
    get_winner(first) {
        let cards = this.cards,
            card,
            suit,
            best = cards[0],
            player = first;

        suit = cards[0].suit;

        if (cards[0].value == 10) {
            this.tens++;
        }
        console.log(this.tens);

        console.log(cards[0]);

        for (let i = 1; i < cards.length; i++) {
            card = cards[i];

            if (card.value == 10) {
                this.tens++;
            }

            // if the first card is not a trump
            if (suit != this.trump) {
                // we compare values to the first card
                if (card.suit == suit) {
                    if (card.value > best.value && best.suit != this.trump) {
                        best = card;
                        player = first + i;
                    }
                } else if (card.suit != suit && card.suit != this.trump) {
                    continue;
                } else {
                    if (best.suit != this.trump) {
                        best = card;
                        player = first + i;
                    } else if (card.value > best.value) {
                        best = card;
                        player = first + i;
                    }
                }
            } else { // if the current card is a trump
                if (card.suit == this.trump) {
                    if (card.value > best.value) {
                        best = card;
                        player = first + i;
                    }
                }
            }
        }

        return player % num_players;
    }
    toString() {
        let s = "";
        for (let i = 0; i < this.cards.length; i++) {
            s += this.cards[i].toString() + " ";
        }
        return s;
    }
}

class Game {
    constructor() {
        this.deck = new Deck();
        // create the playing card deck
        this.deck.create_deck(suits, values);
        // shuffle the deck
        this.deck.shuffle_deck();

        // create the four players
        this.p1 = new Player(1);
        this.p2 = new Player(2),
        this.p3 = new Player(3),
        this.p4 = new Player(4);
        this.players = [this.p1,this.p2,this.p3,this.p4];

        this.trump = suits[0]; // players[0].get_trump(); // TODO make it an option

        // deal 13 cards each in players hands
        for (let p of this.players) {
            this.deck.deal(p.hand, 13);
            p.count_suits();
            p.sortHand();
        }
        this.tricks = [];
        this.winning_player = 0;
        this.winning_partner = 2;

        this.turn = 0;
        this.trick = null;
    }
    
    make_move(index) {
        if (this.trick === null) {
            // create a new trick
            this.trick = new Trick(this.trump);

            // find the person who starts
            this.turn = this.winning_player;

            console.log('Player ' + this.winning_player + ' starts.' + '\n');

            this.valid_suit = "";
        } else {
            // If it is not a new trick, check if it matches suit if possible
            // Check if the player has any of this suit left
            if (this.players[this.turn].num_suits[this.trick.get_suit()] !== 0 && this.players[this.turn].hand[index].suit !== this.trick.get_suit()) {
                console.log("Absolutely illegal");
                return false;
            }
        }       

        // save the card and remove it from the hand
        let card = this.players[this.turn].hand.splice(index,1)[0];

        // append to the canvas
        // socket.emit('valid', card);

        this.players[this.turn].num_suits[card.get_suit()]--;

        this.trick.cards.push(card);
        
        // display the played card
        console.log(card.toString());

        this.turn = (this.turn + 1) % 4;

        if (this.trick.cards.length == 4) {
            this.winning_player = this.trick.get_winner(this.winning_player);
            console.log('Player ' + this.winning_player + ' won!');

            // add the trick to the winning players tricks and add the ten value
            this.players[this.winning_player].tricks.push(this.trick);
            this.players[this.winning_player].tens += this.trick.tens;

            // get the winning partner
            this.winning_partner = (this.winning_player + 2) % 4;
            
            this.tricks.push(this.trick);

            // check if the player who won the trick is winning
            if (this.players[this.winning_player].check_win(this.players[this.winning_partner])) {
                console.log('Player ' + this.winning_player + ' and ' + this.winning_partner + " has won!");
                //break;
            }
            this.trick = null;
            this.turn = this.winning_player;
        }

        console.log('found this part');

        return true;
    }
}
//////////////////////

let game = new Game();
let total_players = 0;
let sockets = [];
let names = [null, null, null, null];

// everything is initialised here
io.on('connection', function (socket) {
    let id = total_players++;

    console.log("This is ID " + total_players);

    // intialiseHand(game.players[id].hand);
    socket.emit('initialiseHand', game.players[id].hand, suits);
    // update();
        
    socket.emit('init', id);
    if (id === 0) {
        socket.emit('onturn');
    } else {
        socket.emit('offturn');
    }
    sockets.push(socket);

    socket.on('turn', function (index) {
        // update game state, only it the id is the right player
        if (game.turn == id) {
            let prevturn = game.turn;
            let currentCard = game.players[id].hand[index];
            let works = game.make_move(index); // game turn increases after this
            
            if (works) {

                console.log('emitted valid move');
                for (let i = 0; i < sockets.length; i++) {
                    sockets[i].emit('valid', currentCard.toString());
                }
                // sockets[prevturn].emit('valid', currentCard.toString());

                if (prevturn !== game.turn) {    

                    sockets[prevturn].emit('offturn');
                    sockets[game.turn].emit('onturn');
                }
            } else {
                game.turn--; // undo the game turn added from the method
                sockets[prevturn].emit('invalid');
            }
        }
    });

    socket.on('name', function(name) {
        names[id] = name;
    })

    socket.on('disconnect', function() {
        console.log("Disconnected :(");
        let i = sockets.indexOf(socket);
        names[i] = null;
        
        sockets.splice(i, 1);
        total_players--;
    })
});

function update() {

    // current_socket.emit('state', game.players[i]);
    // for (let i = 0; i < sockets.length; i++) {
    //     sockets[i].emit('state', game.players[i]); 
    // }

    if (game.trick == null) {
        io.sockets.emit('table', "");
    } else {
        io.sockets.emit('table', game.trick.toString());
    }
}