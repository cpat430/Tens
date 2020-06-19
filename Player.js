module.exports = class Player {
    constructor(position) {
        this.position = position;
        this.hand = [];
        this.tricks = [];
        this.tens = 0;
        this.num_suits = [0,0,0,0];
    }

    get_trump() {

        // deal five cards to the first player
        this.hand = deck.deal(this.hand, 5);

        // show the hand that they can choose the trump from
        console.log(p1.hand);

        // to ensure that a trump is chosen
        let index = -1;

        // ensures one trump is chosen
        while (index == -1) {
            index = readline.keyInSelect(suits, 'Which suit?');
        }

        console.log('Ok, ' + suits[index] + ' is now the trump.\n');

        let trump = suits[index];

        return trump;
    }

    check_win(partner) {

        console.log('Tens: ' + (this.tens + partner.tens));
        console.log('Tricks: ' + (this.tricks.length + partner.tricks.length));

        if ((this.tens.length + partner.tens.length) > 2) {
            return true;
        } else if ((this.tens.length + partner.tens.length) == 2 && (this.tricks.length + partner.tricks.length) >= 7) {
            return true;
        } else {
            return false;
        }
    }

    display_hand() {
        for (let i = 0; i < this.hand.length; i++) {
            console.log(this.hand[i].toString());
        }
    }

    count_suits() {
        for (let i = 0; i < this.hand.length; i++) {
            this.num_suits[this.hand[i].get_suit()]++;
        }
    }

    toString() {
        let s = "";
        for (let i = 0; i < this.hand.length; i++) {
            s += this.hand[i].toString() + " ";
        }
        return s;
    }

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