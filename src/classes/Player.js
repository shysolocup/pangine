var { ws } = require('../../../../index.js');
const { Soup } = require('stews');


class Player {
    constructor(parent, user) {
        this.parent = parent
		
        this.user = user
        this.values = new Soup(Object);
        this.state = this.parent.defaultState;

        var self = this;


        this.Value = new Proxy(class {
            constructor(name, content) {
                self.values.push(name, content)
                parent.parent.events.createSinglePlayerValue.fire(self.values[name]);
                
                return self.values[name];
        	}
		}, {
			set(target, prop, value) {
				parent.parent.events.updateSinglePlayerValue.fire(prop, target);
				target[prop] = value;
			}
		});
		
		this.parent.playerValues.forEach( (k, v) => {
			new this.Value(k, v);
		});
		

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

	leave() {
		this.parent.players.delete(this.user.id);
		this.parent.parent.events.playerLeave.fire(this, this.parent);
	}
}


// Function Maker
class PlayerFunctionMaker {
    constructor(name, func) {
        var stuff = (func instanceof Function) ? func : function() { return func; }

        Object.defineProperty(stuff, "name", { value: name });
        Object.defineProperty( Player.prototype, name, { value: stuff });

        return stuff;
    }
}


Object.defineProperties(Player, {
    "Function": { value: PlayerFunctionMaker }, "function": { value: PlayerFunctionMaker },
    "Func": { value: PlayerFunctionMaker }, "func": { value: PlayerFunctionMaker}
});



// Property Maker
class PlayerPropertyMaker {
    constructor(name, value, attributes={set:undefined, enumerable:false, configurable:false}) {
        var func = (value instanceof Function) ? value : function() { return value; };
        
        Object.defineProperty(func, "name", { value: name });
        Object.defineProperty(Player.prototype, name, {
            get: func,
            set: attributes.set,
            enumerable: attributes.enumerable,
            configurable: attributes.configurable
        });

        return func;
    }
}


Object.defineProperties(Player, {
    "Property": { value: PlayerPropertyMaker }, "property": { value: PlayerPropertyMaker },
    "Prop": { value: PlayerPropertyMaker }, "prop": { value: PlayerPropertyMaker }
});


module.exports = Player
