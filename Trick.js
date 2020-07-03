module.exports = class Trick {
    constructor(trump) {
        this.cards = [];
        this.trump = trump;
    }

    /**
     * Get the suit of the first card in the trick.
     * 
     * @return {number} this.cards[0].suit
     */
    get_suit() {
        return this.cards[0].suit;
    }

    /**
     * Gets the winner of the trick, assuming that all the cards played are valid.
     * 
     * @return {number, Card[]} (winner, tens)
     */
    get_winner() {
        let cards = this.cards,
            best = cards[0],
            winner = 0,
            tens = [];

        if (cards[0].value == 10) {
            tens.push(cards[0]);
        }

        for (let i = 1; i < cards.length; i++) {
            let card = cards[i];

            if (card.value == 10) {
                tens.push(card);
            }
            
            if (this.cardValue(cards[0].suit, this.trump, card) > this.cardValue(cards[0].suit, this.trump, best)) {
                best = card;
                winner = i;
            }
        }

        return {winner, tens};
    }

    // the idea is that if the card follows trump suit, it has high value
    // if it follows startingSuit, it has normal value
    // if it does not follow, it has 0 value
    /**
     * Gets the card value for comparison when checking which card is the winner.
     * The idea is that a trump will be worth 100 more points so that when comparing 
     * just the number, it will always be higher. 
     * 
     * @param {number} startingSuit 
     * @param {number} trumpSuit 
     * @param {Card} card 
     */
    cardValue(startingSuit, trumpSuit, card) {
        if (card.suit == trumpSuit) {
            return 100 + card.value;
        } else if (card.suit == startingSuit) {
            return card.value;
        } else {
            return 0;
        }
    }

    /**
     * Get the cards in the trick in a string
     * 
     * @return {string} s
     */
    toString() {
        let s = "";
        for (let i = 0; i < this.cards.length; i++) {
            s += this.cards[i].toString() + " ";
        }
        return s;
    }
}