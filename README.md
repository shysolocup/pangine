# Pangine
Pangine is a Discord.JS multiplayer minigame framework using WillClient and Stews that includes built in:
- Lobby & player management
- Values & script signals
- Storage management
- Events

<br>

## Usage
Using Pangine in this command it creates a new lobby and sends an embed that says how many players are in the lobby
```js
// src/commands/create.js

var { wc } = require('path to index.js');
var { inst } = wc.pangine.Instances;


// creates a refresh function for the embed
new inst.Lobby.Function("refresh", function() {
	return new wc.Embed({
		title: "Untilted Game",
		description: `Use the command '\`/join ${this.id}\`' to join in the game`,

		fields: [
			{ name: "** **", value: "** **" },
			{ name: "Players", value: `- <@${this.players.join(">\n- <@")}>`},
			{ name: "** **", value: "** **" },
		],

		color: wc.colors.blurple,
		footer: `id: ${lobby.id}`
	});
});


// command that creates the lobby
wc.slashCommand("create", "creates a new lobby", async (ctx, cmd) => {
	let lobby = new inst.Lobby(ctx);

	let embed = lobby.refresh();

	lobby.home = await ctx.reply({ embeds: [embed] });
});
```
In this command it lets players join the lobby
```js
// src/commands/join.js

var { wc } = require('path to index.js');
var { inst } = wc.pangine.Instances;


let options = [{
	name: "id",
	description: "lobby id to join",
	required: true,
	type: "str"	
}];


wc.slashCommand({ name: "join", desc: "joins a lobby" options: options }, async (ctx, cmd) => {
	let id = cmd.args[0].value;

	if (!inst.lobbies.has(id)) return wc.reply("There is no lobby with that ID", { ephemeral: true });
	let lobby = inst.lobbies.get(id);

	if (lobby.players.has(ctx.author.id)) return wc.reply("You're already in that lobby", { ephemeral: true });
	new lobby.Player(ctx.author);

	let embed = lobby.refresh();

	lobby.home.edit({ embeds: [embed] });
});
```
In this command it lets players leave the lobby
```js
// src/commands/leave.js

var { wc } = require('path to index.js');
var { inst } = wc.pangine.Instances;


let options = [{
	name: "id",
	description: "lobby id to leave",
	required: true,
	type: "str"
}];


wc.slashCommand({ name: "leave", desc: "leaves a lobby" options: options }, async (ctx, cmd) => {
	let id = cmd.args[0].value;

	if (!inst.lobbies.has(id)) return wc.reply("There is no lobby with that ID", { ephemeral: true });
	let lobby = inst.lobbies.get(id);

	if (!lobby.players.has(ctx.author.id)) return wc.reply("You're not in that lobby", { ephemeral: true });
	let player = lobby.players.get(ctx.author.id)

	player.leave();

	let embed = lobby.refresh();

	lobby.home.edit({ embeds: [embed] });
});
```
