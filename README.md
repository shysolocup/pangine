# Pangine
Pangine is a Discord.JS minigame framework using WillClient and Stews that includes built in:
- Lobby & player management
- Values & script signals
- Storage management
- Events

<br>

## Usage
index.js (using the WillClient starter kit)
```js
const config = require('./config.json');

const { Client } = require('discord.js');
const bot = new Client({ intents: config.intents });
const { WillClient } = require('willclient');
const wc = new WillClient({ client: bot, prefix: config.prefix, token: config.token });

const { Soup } = require('stews');

let compiles = Soup.from(config.compile);
compiles = compiles.map( (call, dir) => {
	return wc.compile(dir);
});

let stuff = Soup.from({ wc, bot });
let exp = stuff.merge(compiles);

module.exports = exp;
if (config.plugins && Soup.from(config.plugins).length > 0) {
	Soup.from(config.plugins).forEach( (call, dir) => {
		wc.addon(call, dir);
	});
}

config.build.forEach( (dir) => {
	wc.build(dir);
});


bot.login(config.token);
```
