module.exports = class Trick {
    constructor(trump) {
        this.cards = [];
        this.tens = [];
        this.trump = trump;
    }

    get_suit() {
        return this.cards[0].suit;
    }

    // gets the winner assuming all cards played are valid
    // returns the index of the trick that has won
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

        console.log('tens', this.tens);

        return winner;
    }

    // the idea is that if the card follows trump suit, it has high value
    // if it follows startingSuit, it has normal value
    // if it does not follow, it has 0 value
    cardValue(startingSuit, trumpSuit, card) {
        if (card.suit == trumpSuit) {
            return 100 + card.value;
        } else if (card.suit == startingSuit) {
            return card.value;
        } else {
            return 0;
        }
    }

    toString() {
        let s = "";
        for (let i = 0; i < this.cards.length; i++) {
            s += this.cards[i].toString() + " ";
        }
        return s;
    }
}