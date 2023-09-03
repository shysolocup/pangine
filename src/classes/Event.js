const { Soup } = require('stews');

class Event {
    constructor() {
        this.data = new Soup(Array);

        return new Proxy(this, {
            get(target, prop) {
                if (Object.getOwnPropertyNames(Event.prototype).includes(prop) || target[prop]) { // if it's a function or main thing
                    return target[prop];
                }
                else {
                    return target.data[prop];
                }
            }
        })
    }


    fire(/**/) {
		let args = Array.from(arguments);
        this.data.forEach( (v) => {
            v(...args);
        });
    }


	listen(func) {
		this.data.push(func);
	}
}

module.exports = Event;
