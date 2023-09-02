const { random } = require('stews');

class ID {
    constructor(chars) {
        let id = [];
		let characters = "abcdefghijklmnopqrstuvwxyz1234567890".split("");

		for (let i = 0; i < chars; i++) {
			id.push(random.choice(characters));
		}

        return () => { return id.join("") };
    }
}

module.exports = ID;
