var suits = ['S', 'D', 'C', 'H'];

module.exports = class Card {
    constructor(suit, value) {
        this.suit = suit;
        this.value = value;
        this.id = suits[suit] + value.toString();
    }

    /**
     * To string, used in readline-sync (deprecated)
     */
    toString() {
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

    /**
     * Get the suit of the card
     * 
     * @return {number} this.suit
     */
    get_suit() {
        return this.suit;
    }
}