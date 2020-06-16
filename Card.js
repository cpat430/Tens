module.exports = class Card {
    constructor(suit, value) {
        this.suit = suit;
        this.value = value;
        this.id = suit.toString() + value.toString();
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

        return this.suit + " " + output;
    }

    get_suit() {
        return this.suit;
    }
}