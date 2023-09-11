var { wc, bot } = require('../../../index.js');


const PangineClassBuilder = require('./builders/PangineClassBuilder.js');
const { Soup, Stew, Noodle } = require('stews');
const fs = require('fs');



class Pangine {
    constructor(name, settings={ starterLobbyValues:{} }) {
		this.__proto__ = wc.pangine.Pangine.prototype;

		if (!settings.starterLobbyValues) settings.starterLobbyValues = {};
		this.starterLobbyValues = Soup.from(settings.starterLobbyValues);
		
		
		this.name = name;
		this.parent = wc

		
		var config = new Soup({
			"data": require('./data'),
        	"classes": require('./classes'),
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

		Object.defineProperty(this, "homeIds", {
			get() { return this.storage.lobbies.values.map( (lobby) => {
				return lobby.home.id;
			})}
		});

		
        this.events = new Soup({

			createLobby: new Event(),
			updateLobby: new Event(),
			closeLobby: new Event(),
			lockLobby: new Event(),
			unlockLobby: new Event(),
			lobbyTimeout: new Event(),

			playerJoin: new Event(),
			playerLeave: new Event(),
			updatePlayer: new Event(),

			createPlayerValue: new Event(),
			updatePlayerValue: new Event(),

			createStarterPlayerValue: new Event(),
			updateStarterPlayerValue: new Event(),

			createLobbyValue: new Event(),
			updateLobbyValue: new Event(),

			createStarterLobbyValue: new Event(),
			updateStarterLobbyValue: new Event(),

			createSignal: new Event(),
			throwSignal: new Event(),
			catchSignal: new Event(),

			createEvent: new Event()
		
        });

        
		var self = this;

		
		this.Lobby = PangineClassBuilder(new Proxy( class {
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
		}));
		
		Object.defineProperty(this.Lobby, "name", { value: "Lobby" });

		
		this.Event = PangineClassBuilder(class { 
			constructor(name) {
				let event = new Event();
				self.events.push(name, event);
				self.events.createEvent.fire(name, event);

				return event;
			}
		});
		Object.defineProperty(this.Event, "name", { value: "Event" });


		this.StarterLobbyValue = PangineClassBuilder(new Proxy( class StarterPlayerValue {
            constructor(name, content) {
                self.starterlobbyValues.push(name, content)

				self.lobbies.forEach( (k, v) => {
					if (!v.values.has(name)) v.push(name, content);
				});
				
                parent.events.createStarterLobbyValue.fire(self.starterLobbyValues[name], self);
                
                return self.starterLobbyValues[name];
        	}
		}, {
			set(target, prop, value) {
				target[prop] = value;
				parent.events.updateStarterLobbyValue.fire(prop, target, self);
			}
		}));


		if (!wc.pangine.Instances) wc.pangine.Instances = new Soup(Object);
		wc.pangine.Instances.push(name, this);
		this.signals = new Soup(Object);
		
		return this;
    }

	
	close(lobbyID) {
		let lobby = this.lobbies.get(lobbyID);
		this.lobbies.delete(lobbyID);
		this.events.closeLobby.fire(lobby);
	}

	
	lock(lobbyID) {
		let lobby = this.lobbies.get(lobbyID);
		this.lobbies[lobbyID].lock = true;
		this.events.lockLobby.fire(lobby);
	}

	
	unlock(lobbyID) {
		let lobby = this.lobbies.get(lobbyID);
		this.lobbies[lobbyID].lock = false;
		this.events.unlockLobby.fire(lobby);
	}


	findHome(home) {
		let id;
		let the;
		
		if (typeof home == "string") id = home;
		else id = home.id;

		this.lobbies.forEach( (_, lobby) => {
			if (lobby.home.id == id) the = lobby;
		});
	
		return the;
	}


    on(event, func) {
        if (!this.events.has(event)) this.events.push(event, new this.storage.classes.Event());
        this.events[event].listen(func)
    }
	
	event(event, func) { return this.on(event, func); }
	
}



Pangine = PangineClassBuilder(Pangine);
module.exports = { Pangine, Instances: new Soup(Object) }
