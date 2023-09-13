const PangineClassBuilder = require('../builders/PangineClassBuilder.js');
var { ws } = require('../../../../index.js');
const { Soup } = require('stews');


class Player {
    constructor(parent, user) {
		this.__proto__ = parent.Player.prototype;
        this.parent = parent

		
        this.user = user
        this.values = new Soup(Object);

		
        var self = this;


        this.Value = PangineClassBuilder(new Proxy( class Value {
            constructor(name, content) {
				this.parent = self;
                self.values.push(name, content)
                parent.parent.events.createPlayerValue.fire(self.values[name]);
                
                return self.values[name];
        	}
		}, {
			set(target, prop, value) {
				target[prop] = value;
				parent.parent.events.updatePlayerValue.fire(prop, target);
			}
		}));
		
		this.parent.starterPlayerValues.forEach( (k, v) => {
			new this.Value(k, v);
		});


		this.__proto__.leave = function leave() {
			this.parent.players.delete(this.user.id);
			this.parent.parent.events.playerLeave.fire(this, this.parent);
		}

		this.__proto__[Symbol.toPrimitive] = function(hint) {
			if (hint === "string") {
            	return `<@${this.user.id}>`
        	}
		}
		

        return new Proxy(this, {
			get(target, prop) {
				if (target.values.has(prop)) return target.values.get(prop);
				else return target[prop];
			},

			set(target, prop, value) {
				if (target.values.has(prop)) return target.values.set(prop, value);
				else return target[prop] = value;
			},

			delete(target, prop) {
				if (target.values.has(prop)) return target.values.delete(prop);
				else return delete target[prop];
			}
		});
    }
}


module.exports = Player
