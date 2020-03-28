// create a readline interface for reading input from user
var readline = require('readline-sync');

// create the suits and the card values to create a deck of cards
let suits = ['Spades', 'Clubs', 'Diamonds', 'Hearts'];
let values = [2,3,4,5,6,7,8,9,10,11,12,13,14];
const num_players = 4;
const max_score = 13;

class Card {
    constructor(suit, value) {
        this.suit = suit;
        this.value = value;
    }

    to_string() {

        if (this.value == 11) {
            this.value = 'Jack';
        } else if (this.value == 12) {
            this.value = 'Queen';
        } else if (this.value == 13) {
            this.value = 'King';
        } else if (this.value == 14) {
            this.value = 'Ace'
        }

        return this.value + " of " + this.suit;
    }

    toString() { // need this for readline-synd

        if (this.value == 11) {
            this.value = 'Jack';
        } else if (this.value == 12) {
            this.value = 'Queen';
        } else if (this.value == 13) {
            this.value = 'King';
        } else if (this.value == 14) {
            this.value = 'Ace'
        }

        return this.value + " of " + this.suit;
    }
}

class Deck {
    constructor() {
        this.deck = [];
    }

    create_deck(suits, values) {
        for (let suit of suits) {
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

        return hand;
    }
}

class Player {
    constructor(position) {
        this.position = position;
        this.hand = [];
        this.tricks = [];
        this.tens = 0;
    }

    get_trump() {

        var trump;

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

        trump = suits[index];

        return trump;
    }

    // can play a card
    play(card) {
        console.log('Played ' + card.to_string());
    }

    check_win(partner) {

        console.log('tens: ' + (this.tens + partner.tens));
        console.log('tricks: ' + (this.tricks.length + partner.tricks.length));

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
            console.log(this.hand[i].to_string());
        }
    }
}

class Trick {
    constructor() {
        this.cards = [];
        this.tens = 0;
    }

    get_suit() {
        return this.cards[0].suit;
    }

    // gets the winner assuming all cards played are valid
    get_winner(first) {
        var cards = this.cards,
            card,
            suit,
            best = cards[0],
            player = first;

        suit = cards[0].suit;

        if (cards[0].value == 10) {
            this.tens++;
        }

        for (let i = 1; i < cards.length; i++) {
            card = cards[i];

            if (card.value == 10) {
                this.tens++;
            }

            // if the first card is not a trump
            if (suit != trump) {
                // we compare values to the first card
                if (card.suit == suit) {
                    if (card.value > best.value && best.suit != trump) {
                        best = card;
                        player = first + i;
                    }
                } else if (card.suit != suit && card.suit != trump) {
                    continue;
                } else {
                    if (best.suit != trump) {
                        best = card;
                        player = first + i;
                    } else if (card.value > best.value) {
                        best = card;
                        player = first + i;
                    }
                }
            } else { // if the current card is a trump
                if (card.suit == trump) {
                    if (card.value > best.value) {
                        best = card;
                        player = first + i;
                    }
                }
            }
        }

        return ((player-1) % num_players) + 1;
    }
}

// create the playing card deck
let deck = new Deck();
deck.create_deck(suits, values);

// shuffle the deck
deck.shuffle_deck();

// create the four players
let p1 = new Player(1),
    p2 = new Player(2),
    p3 = new Player(3),
    p4 = new Player(4);

let players = [p1,p2,p3,p4];

// make a while loop for each game and it rotates the player start

let trump;

// choose the trump
trump = players[0].get_trump();

// we will keep track of the number of rounds so that we can 
// rotate who is choosing the trump

// deal 13 cards each in players hands
for (let p of players) {
    p.hand = deck.deal(p.hand, 13);
}

// now that the hands are all dealt, first player will start.
let tricks = [],
    winning_player = 1; // first player is 3

// while there are still tricks able to be played
while (tricks.length < max_score) {
    
    // create a new trick
    let trick = new Trick(winning_player);

    // find the person who starts
    let turn = winning_player - 1;

    console.log('Player ' + winning_player + ' starts.' + '\n');

    for (let i = 0; i < players.length; i++) {

        let hand = players[turn].hand;

        // show the users hand and 
        // ask the user what card they want to play
        let index = -1;

        index = readline.keyInSelect(hand, 'Which card would you like to play?');

        let card = players[turn].hand.splice(index,1);

        trick.cards.push(card);

        // display the played card
        console.log(card);

        turn = (turn + 1) % num_players;
    }

    winning_player = trick.get_winner(winning_player);
    console.log('Player ' + winning_player + ' won!');

    // add the trick to the winning players tricks and add the ten value
    players[winning_player-1].tricks.push(trick);
    players[winning_player-1].tens += trick.tens;

    // get the winning partner
    let winning_partner = ((winning_player + 1) % num_players) + 1;
    
    tricks.push(trick);

    // check if the player who won the trick is winning
    if (players[winning_player-1].check_win(players[winning_partner-1])) {
        console.log('Player ' + winning_player + ' and ' + winning_partner + " has won!");
        break;
    }
}