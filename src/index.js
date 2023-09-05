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
        var { ID, Lobby, Event } = classes;


        this.StorageID = new ID(9)();
        storage.push(this.StorageID, compiles);
				
		Object.defineProperty(this, "storage", {
			get() { return storage.get(this.StorageID); }
		});

		Object.defineProperty(this, "lobbies", {
			get() { return this.storage.lobbies; }
		});

		
        this.events = new Soup({

			createLobby: new Event(),
			updateLobby: new Event(),
			closeLobby: new Event(),
			lockLobby: new Event(),
			unlockLobby: new Event(),

			playerJoin: new Event(),
			playerLeave: new Event(),
			updatePlayer: new Event(),

			createSinglePlayerValue: new Event(),
			updateSinglePlayerValue: new Event(),

			createMuliPlayerValue: new Event(),
			updateMuliPlayerValue: new Event(),

			createLobbyValue: new Event(),
			updateLobbyValue: new Event(),

			createSignal: new Event(),
			throwSignal: new Event(),
			catchSignal: new Event(),

			createEvent: new Event()
		
        });

        
		var self = this;
		
		this.Lobby = new Proxy( class Lobby {
            constructor() {
				let lobby = new Lobby(self, ...Array.from(arguments));
				self.storage.lobbies.push(lobby.id, lobby);
                self.events.createLobby.fire(lobby);
                return lobby;
            }
        }, {
			set(target, prop, value) {
				target[prop] = value;
				self.events.updateLobby.fire(prop, target);
			}	
		});
		
		this.Event = class Event { 
			constructor(name) {
				let event = new Event();
				self.events.push(name, event);
				self.events.createEvent.fire(name, event);
			}
		};


		if (!wc.pangine.Instances) wc.pangine.Instances = new Soup(Object);
		wc.pangine.Instances.push(name, this);
		this.signals = new Soup(Object);
		
		return this;
    }

	
	close(lobbyID) {
		this.lobbies.delete(lobbyID);
	}

	
	lock(lobbyID) {
		this.lobbies[lobbyID].lock = true;
	}

	
	unlock(lobbyID) {
		this.lobbies[lobbyID].lock = false;
	}


    on(event, func) {
        if (!this.events.has(event)) this.events.push(event, new this.storage.classes.Event());
        this.events[event].listen(func)
    }

	event(event, func) { return this.event(event, func); }
	
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



module.exports = { Pangine, Instances: new Soup(Object) }
