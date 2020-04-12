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

        let output;

        if (this.value == 11) {
            output= 'Jack';
        } else if (this.value == 12) {
            output = 'Queen';
        } else if (this.value == 13) {
            output = 'King';
        } else if (this.value == 14) {
            output = 'Ace'
        } else {
            output = this.value;
        }

        return output + " of " + this.suit;
    }

    toString() { // need this for readline-synd

        let output;

        if (this.value == 11) {
            output= 'Jack';
        } else if (this.value == 12) {
            output = 'Queen';
        } else if (this.value == 13) {
            output = 'King';
        } else if (this.value == 14) {
            output = 'Ace'
        } else {
            output = this.value;
        }

        return output + " of " + this.suit;
    }

    get_suit() {
        for (let i = 0; i < 4; i++) {
            if (this.suit == suits[i]) {
                return i;
            }
        }
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
        this.num_suits = [0,0,0,0];
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

    count_suits() {
        for (let i = 0; i < this.hand.length; i++) {
            if (this.hand[i].suit == suits[0]) {
                this.num_suits[0]++;
            } else if (this.hand[i].suit == suits[1]) {
                this.num_suits[1]++;
            } else if (this.hand[i].suit == suits[2]) {
                this.num_suits[2]++;
            } else if (this.hand[i].suit == suits[3]) {
                this.num_suits[3]++;
            }
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

            console.log(card.value);

            if (card.value == 10) {
                this.tens++;
            }
            console.log(this.tens);

            console.log(card);

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
    p.count_suits();
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

    let valid_suit = "";

    for (let i = 0; i < players.length; i++) {

        let hand = players[turn].hand;
        hand.sort(function(a,b) { // sort by suit and then by value if they are the same
            var A = a.suit.toUpperCase(); // ignore upper and lowercase
            var B = b.suit.toUpperCase(); // ignore upper and lowercase
            if (A < B) {
                return -1;
            }
            if (A > B) {
                return 1;
            }

            // names must be equal
            return b.suit - a.suit;
        });

        console.log(players[turn].num_suits);

        // show the users hand and 
        // ask the user what card they want to play

        // if the card value isn't valid, then ask again only if this is not the first player
        let index = -1;
        if (i != 0) {
            let valid = false;
            while (!valid) {
                
                index = readline.keyInSelect(hand, 'Which card would you like to play?');
    
                let this_card = players[turn].hand[index];
                let this_suit = this_card.suit;

                if (this_suit == valid_suit) {
                    valid = true;
                } else if (players[turn].num_suits[suits.indexOf(valid_suit)] == 0) {
                    valid = true;
                } else {
                    console.log("That is not a valid suit, please choose something with the suit: " + valid_suit);
                }
            }
        } else {

            index = readline.keyInSelect(hand, 'Which card would you like to play?');

            valid_suit = players[turn].hand[index].suit;
        }

        // save the card and remove it from the hand
        let card = players[turn].hand.splice(index,1)[0];

        players[turn].num_suits[card.get_suit()]--;

        trick.cards.push(card);

        // display the played card
        console.log(card.to_string());

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