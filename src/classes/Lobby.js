var { ws } = require('../../../../index.js');
const { Soup } = require('stews');


class Lobby {
    constructor(ctx=null) {
        if (!ctx) ctx = ws.ctx;

        this.players = new Soup(Object)
    }

    addPlayer(user) {
        if (!this.players.has(user.id)) {
            this.players.push(user.id, {});
        }
    }

    removePlayer(user) {
        if (this.players.has(user.id)) {
            this.players.delete(user.id);
        }
    }
}


module.exports = Lobby
