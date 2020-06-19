

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
    get_winner(first) {
        let cards = this.cards,
            card,
            suit,
            best = cards[0],
            player = first,
            num_players = 4;

        suit = cards[0].suit;

        if (cards[0].value == 10) {
            this.tens.push(cards[0]);
        }

        for (let i = 1; i < cards.length; i++) {
            card = cards[i];

            if (card.value == 10) {
                this.tens.push(card);
            }

            // if the first card is not a trump
            if (suit != this.trump) {
                // we compare values to the first card
                if (card.suit == suit) {
                    if (card.value > best.value && best.suit != this.trump) {
                        best = card;
                        player = first + i;
                    }
                } else if (card.suit != suit && card.suit != this.trump) {
                    continue;
                } else {
                    if (best.suit != this.trump) {
                        best = card;
                        player = first + i;
                    } else if (card.value > best.value) {
                        best = card;
                        player = first + i;
                    }
                }
            } else { // if the current card is a trump
                if (card.suit == this.trump) {
                    if (card.value > best.value) {
                        best = card;
                        player = first + i;
                    }
                }
            }
        }

        console.log('tens', this.tens);

        return player % num_players;
    }
    toString() {
        let s = "";
        for (let i = 0; i < this.cards.length; i++) {
            s += this.cards[i].toString() + " ";
        }
        return s;
    }
}