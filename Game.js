let Deck = require('./Deck.js');
let Card = require('./Card.js');
let Player = require('./Player.js');
let Trick = require('./Trick.js');

// create the suits and the card values to create a deck of cards
let suits = ['S', 'D', 'C', 'H'];
let values = [2,3,4,5,6,7,8,9,10,11,12,13,14];
const num_players = 4;
const max_score = 13;
const max_cards = 13;
const choose_trump_cards = 5;

module.exports = class Game {
    constructor(dealer) {
        this.deck = new Deck();
        // create the playing card deck
        this.deck.create_deck(suits, values);
        // shuffle the deck
        this.deck.shuffle_deck();

        // create the four players
        this.p1 = new Player(0);
        this.p2 = new Player(1),
        this.p3 = new Player(2),
        this.p4 = new Player(3);
        this.players = [this.p1,this.p2,this.p3,this.p4];

        this.trump = -1; // players[0].get_trump(); // TODO make it an option

        this.players[dealer].dealer = true;
        this.dealer = dealer;
        this.turn = dealer;
        
        // deal 5 random cards to the first player to choose the trump

        // deal 13 cards each in players hands
        for (let p of this.players) {
            if (!p.dealer) {
                // this.deck.deal(p.hand, 13);
                this.deal_cards(p, max_cards);
            } else {
                this.deal_cards(p,choose_trump_cards);
            }
            // p.count_suits();
            // p.sortHand();
        }
        this.tricks = [];
        this.winning_player = dealer;
        this.winning_partner = 2;

        this.trick = null;
    }

    deal_cards(player, num) {
        this.deck.deal(player.hand, num);
        if (num != 5) {
            player.count_suits();
        }
        player.sortHand();
    }
    
    make_move(cardId) {
        let ind = -1;
        let card = null;
        for (let i = 0; i < this.players[this.turn].hand.length; i++) {
            if (this.players[this.turn].hand[i].id == cardId) {
                ind = i;
                card = this.players[this.turn].hand[i];
                break;
            }
        }
        if (ind == -1) throw "Bad";

        let works = true;
        let winner = -1;
        let tens = [];
        let gameOver = false;

        if (this.trick === null) {
            // create a new trick
            this.trick = new Trick(this.trump); // changed this

            // find the person who starts
            this.turn = this.winning_player;
            this.trick.first = this.winning_player;

            // console.log('Player ' + this.winning_player + ' starts.' + '\n');

            this.valid_suit = "";
        } else {

            // console.log('num_suits', this.players[this.turn].num_suits, 'trick_suit', this.trick.get_suit(), 'card_suit', card.get_suit());
            // If it is not a new trick, check if it matches suit if possible
            // Check if the player has any of this suit left
            if (this.players[this.turn].num_suits[this.trick.get_suit()] != 0 && card.get_suit() != this.trick.get_suit()) {
                console.log("Absolutely illegal");

                works = false;
                return {
                    works,
                    winner,
                    tens,
                    gameOver
                };
            }
        }       

        // remove it from the hand
        this.players[this.turn].hand.splice(ind,1)[0];
        
        // remove a value from the suits
        this.players[this.turn].num_suits[card.get_suit()]--;

        this.trick.cards.push(card);

        this.turn = (this.turn + 1) % num_players;

        if (this.trick.cards.length == num_players) {
            let get_winner = this.trick.get_winner();

            let winning_index = get_winner.winner;
            tens = get_winner.tens;

            this.winning_player = (this.winning_player + winning_index) % 4;

            console.log('Player ' + this.winning_player + ' won!');

            // add the trick to the winning players tricks and add the ten value
            this.players[this.winning_player].tricks.push(this.trick);

            for (let i = 0; i < tens.length; i++) {
                this.players[this.winning_player].tens.push(tens[i]);
            }

            // get the winning partner
            this.winning_partner = (this.winning_player + 2) % num_players;
            
            console.log('winners', this.winning_player, this.winning_partner);

            if ((this.winning_partner + this.winning_player) == 2) {
                // team 1
                winner = 1;
            } else {
                // team 2
                winner = 2;
            }

            this.tricks.push(this.trick);

            // check if the player who won the trick is winning
            if (this.players[this.winning_player].check_win(this.players[this.winning_partner])) {
                console.log('Player ' + this.winning_player + ' and ' + this.winning_partner + " has won!");
                //break;
                // if there is a game winner
                gameOver = true;
            }
            this.trick = null;
            this.turn = this.winning_player;
        }
        return {
            works,
            winner,
            tens,
            gameOver
        };
    }
}

