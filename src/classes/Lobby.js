var { wc } = require('../../../../index.js');

const { Soup } = require('stews');
const Player = require('./Player.js');
const CoolError = require('./CoolError.js');
const PangineClassBuilder = require('../builders/PangineClassBuilder.js');
const ID = require('./ID.js');


class Lobby {
    constructor(parent, ctx=null, settings={ starterPlayerValues:{}, values:{}, players: [], idLength:4, id:null, timeout:false, timeoutClose:true }) {
		this.__proto__ = parent.Lobby.prototype;

		
		if (!settings.starterPlayerValues) settings.starterPlayerValues = {};
		if (!settings.values) settings.values = {};
		if (!settings.players) settings.players = [];
		if (!settings.idLength) settings.idLength = 4;
		if (!settings.timeoutClose || settings.timeoutClose.toString() != "false") settings.timeoutClose = true;
        if (!ctx) ctx = wc.ctx;

		
        this.parent = parent
        this.players = new Soup(Object);
		this.starterPlayerValues = Soup.from(settings.starterPlayerValues);
		this.id = (settings.id) ? settings.id : new ID(settings.idLength)();
		this.timeoutClose = settings.timeoutClose;
		this.values = new Soup(settings.values);
		this.ctx = ctx;
		this.home = null;
		this.timeout = null;

		
        var self = this;

		
		var locked = false
		Object.defineProperty(this, "locked", {
			get() { 
				return locked;
			},
			set(to) {
				locked = to;
				
				if (to == true) parent.events.lockLobby.fire(self);
				else if (to == false) parent.events.unlockLobby.fire(self);
			}
		});


		
        this.Player = PangineClassBuilder(new Proxy( class {
            constructor(user) {
				if (self.locked) throw new CoolError("Lobby Locked", "Player attempted to join a locked lobby.");
                
				let player = new Player(self, ...Array.from(arguments));
				self.players.push(user.id, player);
				parent.events.playerJoin.fire(player, self);
				return player;
			}
		}, {
			set(target, prop, value) {
				target[prop] = value;
				parent.events.updatePlayer.fire(prop, target, self);
			}
		}));
		
		Object.defineProperty(this.Player, "name", { value: "Player" });

		
		this.Value = PangineClassBuilder(new Proxy( class Value {
            constructor(name, content) {
                self.values.push(name, content)
                parent.events.createLobbyValue.fire(self.values[name], self);
                
                return self.values[name];
        	}
		}, {
			set(target, prop, value) {
				target[prop] = value;
				parent.events.updateLobbyValue.fire(prop, target, self);
			}
		}));


		this.parent.starterLobbyValues.forEach( (k, v) => {
			new this.Value(k, v);
		});

		
		this.StarterPlayerValue = PangineClassBuilder(new Proxy( class StarterPlayerValue {
            constructor(name, content) {
                self.starterPlayerValues.push(name, content)

				self.players.forEach( (k, v) => {
					if (!v.values.has(name)) v.push(name, content);
				});
				
                parent.events.createStarterPlayerValue.fire(self.starterPlayerValues[name], self);
                
                return self.starterPlayerValues[name];
        	}
		}, {
			set(target, prop, value) {
				target[prop] = value;
				parent.events.updateStarterPlayerValue.fire(prop, target, self);
			}
		}));


		this.Signal = PangineClassBuilder(class Signal {
			constructor(name) {
				this.name = name;
				this.parent = self;
				parent.events.createSignal.fire(this, self);
			}

			throw() {
				parent.signals.push(this.name, Array.from(arguments));
				parent.events.throwSignal.fire(this, self);
			}

			catch() {
				let content = parent.signals.get(this.name);
				parent.events.catchSignal.fire(this, content, self);
				parent.signals.delete(this.name);
				return content;
			}
		})

		
		let host = (ctx.author) ? ctx.author : ctx.user;
		this.host = new this.Player(host);


		settings.players.forEach( (user) => {
			new this.Player(user);
		});

		
		this.__proto__.close = function close(reason=null) {
			this.parent.lobbies.delete(this.id);
			this.parent.events.closeLobby.fire(this, reason);
		}

		this.__proto__.lock = function lock() {
			this.lock = true;
			this.parent.events.lockLobby.fire(this);
		}

		this.__proto__.unlock = function unlock() {
			this.lock = false;
			this.parent.events.unlockLobby.fire(this);
		}

		this.__proto__.resetTimeout = function resetLobbyTimeout(time=null) {
			clearTimeout(this.timeout);
			let action = TimeoutAction.bind(this);
			time = (time) ? time : this.timeoutTime;
			
			this.timeout = setTimeout( action, wc.time.parse(time)*1000 );
			
			this.parent.events.resetTimeout.fire(this, this.timeout);
		}

		this.__proto__.clearTimeout = function clearLobbyTimeout() {
			clearTimeout(this.timeout);

			this.parent.events.clearTimeout.fire(this);
		}

		this.__proto__.setTimeout = function setLobbyTimeout(time) {
			let action = TimeoutAction.bind(this);
			time = (time) ? time : (this.timeoutTime) ? this.timeoutTime : 0;

			this.timeoutTime = time;
			this.timeout = setTimeout( action, wc.time.parse(time)*1000 );
			
			this.parent.events.setTimeout.fire(this, this.timeout);
		}

		this.__proto__[Symbol.toPrimitive] = function(hint) {
			if (hint === "string") {
            	return this.id
        	}
		}


		if (settings.timeout) {
			let action = TimeoutAction.bind(this);
			this.timeoutTime = settings.timeout;
			this.timeout = setTimeout( action, wc.time.parse(settings.timeout)*1000 );
		}

		else if (this.parent.defaultTimeout) {
			let action = TimeoutAction.bind(this);
			this.timeoutTime = this.parent.defaultTimeout;
			this.timeout = setTimeout( action, wc.time.parse(this.parent.defaultTimeout)*1000 );
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


function TimeoutAction() {
	if (this.timeoutClose) this.close("timeout");
	this.parent.events.lobbyTimeout.fire(this, this.timeout);
	clearTimeout(this.timeout);
}


module.exports = Lobby
