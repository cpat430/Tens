const Game = require("../Game.js");
const Deck = require("../Deck.js");

test("Check if a played card is expected", () => {
    
    let deck = new Deck();

    deck.create_deck();

    let game = new Game();

    
    expect(card.toString()).toBe("0 3");
});