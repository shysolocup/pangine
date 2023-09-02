var { wc, bot } = require('../../../index.js');


const { Soup, Stew, Noodle } = require('stews');
const fs = require('fs');



class Pangine {
    constructor(name) {

		this.name = name;
		this.parent = wc

		var config = new Soup({
			"data": require('./data'),
        	"classes": require('./classes')
		});

		
        let compiles = Soup.from(config);
        compiles = compiles.map( (call, dir) => {
	        return wc.compile(dir, [], function (path, file, compiled, name) {
                compiled.push(name, require(`${path}/${file}`)); 
            });
        });
		compiles.lobbies = new Soup(Object);

		
        var { classes, data } = compiles;
        var { storage } = data;
        var { ID, Lobby, Player, Event } = classes;


        this.StorageID = new ID(9)();
        storage.push(this.StorageID, compiles);

		
        this.events = new Soup({
            "createLobby": new Event()
        });

        
		var self = this;
		
		this.Lobby = class {
            constructor(ctx) {
                self.events.createLobby.fire(ctx);
                return new Lobby(self, ctx);
            }
        };
		this.Event = Event

		
		Object.defineProperty(this, "storage", {
			get() { return storage.get(this.StorageID); }
		});


		if (!wc.Instances) wc.Instances = new Soup(Object);
		wc.Instances.push(name, this);
		return this;
    }


    on(event, func) {
        if (!this.events.has(event)) this.events.push(event, new Soup(Array));
        this.events[event].listen(func)
    }
}


// Function Maker
class PangineFunctionMaker {
    constructor(name, func) {
        var stuff = (func instanceof Function) ? func : function() { return func; }

        Object.defineProperty(stuff, "name", { value: name });
        Object.defineProperty( Pangine.prototype, name, { value: stuff });

        return stuff;
    }
}


Object.defineProperties(Pangine, {
    "Function": { value: PangineFunctionMaker }, "function": { value: PangineFunctionMaker },
    "Func": { value: PangineFunctionMaker }, "func": { value: PangineFunctionMaker}
});



// Property Maker
class PanginePropertyMaker {
    constructor(name, value, attributes={set:undefined, enumerable:false, configurable:false}) {
        var func = (value instanceof Function) ? value : function() { return value; };
        
        Object.defineProperty(func, "name", { value: name });
        Object.defineProperty(Pangine.prototype, name, {
            get: func,
            set: attributes.set,
            enumerable: attributes.enumerable,
            configurable: attributes.configurable
        });

        return func;
    }
}


Object.defineProperties(Pangine, {
    "Property": { value: PanginePropertyMaker }, "property": { value: PanginePropertyMaker },
    "Prop": { value: PanginePropertyMaker }, "prop": { value: PanginePropertyMaker }
});



module.exports = { Pangine }
