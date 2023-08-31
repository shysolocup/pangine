var { ws } = require('../../../../index.js');
const { CoolError } = require('./CoolError.js')
const { Soup } = require('stews');


class Lobby {
    constructor(ctx=null) {
        if (!ctx) ctx = ws.ctx;

        this.players = new Soup(Object)

        this.events = new Soup({
            join: new Soup(Array),
            leave: new Soup(Array)
        });

        return this;
    }

    addPlayer(user) {
        if (!this.players.has(user.id)) {
            this.players.push(user.id, {});

            this.events
        }
    }

    removePlayer(user) {
        if (this.players.has(user.id)) {
            this.players.delete(user.id);
        }
    }

    on(event, func) {
        if (!this.events.has(event)) this.events.push(event, new Soup(Array));
        this.events[event].push(func);
    }
}


// Function Maker
class LobbyFunctionMaker {
    constructor(name, func) {
        var stuff = (func instanceof Function) ? func : function() { return func; }

        Object.defineProperty(stuff, "name", { value: name });
        Object.defineProperty( Lobby.prototype, name, { value: stuff });

        return stuff;
    }
}


Object.defineProperties(Lobby, {
    "Function": { value: LobbyFunctionMaker }, "function": { value: LobbyFunctionMaker },
    "Func": { value: LobbyFunctionMaker }, "func": { value: LobbyFunctionMaker}
});



// Property Maker
class LobbyPropertyMaker {
    constructor(name, value, attributes={set:undefined, enumerable:false, configurable:false}) {
        var func = (value instanceof Function) ? value : function() { return value; };
        
        Object.defineProperty(func, "name", { value: name });
        Object.defineProperty(Lobby.prototype, name, {
            get: func,
            set: attributes.set,
            enumerable: attributes.enumerable,
            configurable: attributes.configurable
        });

        return func;
    }
}


Object.defineProperties(Lobby, {
    "Property": { value: LobbyPropertyMaker }, "property": { value: LobbyPropertyMaker },
    "Prop": { value: LobbyPropertyMaker }, "prop": { value: LobbyPropertyMaker }
});


module.exports = Lobby
