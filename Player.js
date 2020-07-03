module.exports = class Player {
    constructor(position) {
        this.position = position;
        this.hand = [];
        this.tricks = [];
        this.tens = [];
        this.num_suits = [0,0,0,0];
        this.dealer = false;
    }

    /**
     * Check if the team has won by counting their combined tricks.
     * 
     * @param {Player} partner 
     * 
     * @return {boolean} win
     */
    check_win(partner) {

        console.log('Tens: ' + (this.tens.length + partner.tens.length));
        console.log('Tricks: ' + (this.tricks.length + partner.tricks.length));

        if ((this.tens.length + partner.tens.length) > 2) {
            return true;
        } else if ((this.tens.length + partner.tens.length) == 2 && (this.tricks.length + partner.tricks.length) >= 7) {
            return true;
        } else {
            return false;
        }
    }

    /**
     * Display the hand to console, mainly for debugging
     */
    display_hand() {
        for (let i = 0; i < this.hand.length; i++) {
            console.log(this.hand[i].toString());
        }
    }

    /**
     * Count the number of suits in each hand
     */
    count_suits() {
        for (let i = 0; i < this.hand.length; i++) {
            this.num_suits[this.hand[i].get_suit()]++;
        }
    }

    /**
     * Convert the hand to a string
     * 
     * @return {string} s
     */
    toString() {
        let s = "";
        for (let i = 0; i < this.hand.length; i++) {
            s += this.hand[i].toString() + " ";
        }
        return s;
    }

    /**
     * Sort hand based off of the suit and value.
     */
    sortHand() {
        this.hand.sort(function(a, b) {
            if (a.suit === b.suit) {
                if (a.value < b.value) return -1;
                if (a.value > b.value) return 1;
                return 0;
            }
            if (a.suit < b.suit) return -1;
            if (a.suit > b.suit) return 1;
        });
    }
}