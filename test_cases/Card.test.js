const Card = require("../Card.js");

test("Check Card#toString function works", () => {
    let card = new Card(0,3);
    expect(card.toString()).toBe("0 3");
});