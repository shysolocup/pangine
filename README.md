# Pangine
Pangine is a Discord.JS minigame framework using WillClient and Stews that includes built in:
- Lobby & player management
- Values & script signals
- Storage management
- Events

<br>

## Usage
```js
// src/commands/create.js

var { wc } = require('path to index.js');
var { inst } = wc.pangine.Instances;

wc.slashCommand("create", "creates a new lobby", async (ctx, cmd) => {
	let lobby = new inst.Lobby(ctx);

	let embed = new wc.Embed({
		title: "Untilted Game",
		description: `Use the command '\`/join ${lobby.id}' to join in the game`,

		fields: [
			{ name: "** **", value: "** **" },
			{ name: "Players", value: `- <@${lobby.players.join(">\n- <@")}>`},
			{ name: "** **", value: "** **" },
		],

		color: wc.colors.blurple,
		footer: `id: ${lobby.id}`
	});

	lobby.home = await ctx.reply({ embeds: [embed] });
});
```

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

	let embed = new wc.Embed({
		title: "Untilted Game",
		description: `Use the command '\`/join ${lobby.id}' to join in the game`,

		fields: [
			{ name: "** **", value: "** **" },
			{ name: "Players", value: `- <@${lobby.players.join(">\n- <@")}>`},
			{ name: "** **", value: "** **" },
		],

		color: wc.colors.blurple,
		footer: `id: ${lobby.id}`
	});

	lobby.home.edit({ embeds: [embed] });
});
```

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

	let embed = new wc.Embed({
		title: "Untilted Game",
		description: `Use the command '\`/join ${lobby.id}' to join in the game`,

		fields: [
			{ name: "** **", value: "** **" },
			{ name: "Players", value: `- <@${lobby.players.join(">\n- <@")}>`},
			{ name: "** **", value: "** **" },
		],

		color: wc.colors.blurple,
		footer: `id: ${lobby.id}`
	});

	lobby.home.edit({ embeds: [embed] });
});
```
