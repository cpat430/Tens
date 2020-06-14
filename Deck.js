
let Card = require('./Card.js');

module.exports = class Deck {
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