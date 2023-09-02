var { ws } = require('../../../../index.js');
const { Soup } = require('stews');


class Player {
    constructor(parent, user) {
        this.parent = parent

        const { Event } = this.parent.parent;

        this.events = new Soup({
            "newValue": new Event(),
            "updateValue": new Event()
        });

		
        this.info = new Soup({
            id: user.id,
            values: new Soup(Object),
            state: "initial",
        });

        var self = this;


        this.Value = new Proxy(class {
            constructor(name, content) {
                self.info.values.push(name, { name: name, content: content })
                self.events.newValue.fire(self.info.values[name]);
                
                return self.info.values[name];
        	}
		}, {
			set(target, prop, value) {
				self.events.updateValue.fire(self.info.values[target]);
				target[prop] = value;
			}
		});
		

        return this;
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
