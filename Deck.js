
let Card = require('./Card.js');

module.exports = class Deck {
    constructor() {
        this.deck = [];
    }

    /**
     * Creates a full deck of cards.
     * 
     * @param {number[]} suits 
     * @param {number[]} values 
     */
    create_deck(suits, values) {
        for (let suit = 0; suit < 4; suit++) {
            for (let value of values) {
                this.deck.push(new Card(suit, value));
            }
        }
    }

    /**
     * Shuffles the deck randomly.
     * 
     * @return {Card[]} this.deck
     */
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

    /**
     * Adds a card from the deck to a players hand and 
     * then removes it from the deck to eliminate duplicates
     * 
     * @param {Card[]} hand 
     * @param {Card[]} cards 
     */
    deal(hand, cards) {
        
        while (hand.length < cards) {
            let card = this.deck.pop();
            
            hand.push(card);
        }
    }
}