let Deck = require('./Deck.js');
let Card = require('./Card.js');
let Player = require('./Player.js');
let Trick = require('./Trick.js');

// create the suits and the card values to create a deck of cards
let suits = ['S', 'C', 'D', 'H'];
let values = [2,3,4,5,6,7,8,9,10,11,12,13,14];
const num_players = 4;
const max_score = 13;

module.exports = class Game {
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
        return true;
    }
}

