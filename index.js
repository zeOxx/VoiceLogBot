const Discord = require('discord.js');
const fs = require("fs");
const client = new Discord.Client();

let channels;
let data = null;
let token = "";
let voiceLogChannel = "";
let prefix = "";

client.on('ready', () => {
	console.log(`Logged in as ${client.user.username}!`);
	updateChannels();
	setLogChannel(data.voiceLogChannel);
});

client.on('voiceStateUpdate', (oldMember, newMember) => {
	// Check if voiceLogChannel has been set
	if (data.voiceLogChannel === "")
		return;

	let username = oldMember.displayName;
	let oldVCID = oldMember.voiceChannelID;
	let newVCID = newMember.voiceChannelID;

	let oldChannelName = (oldVCID != null && typeof oldVCID != undefined) ? channels.get(oldVCID).name : null;
	let newChannelName = (newVCID != null && typeof newVCID != undefined) ? channels.get(newVCID).name : null;
	
	if (oldChannelName === null)
		voiceLogChannel.sendMessage(`${username} connected to voice and joined ${newChannelName}`);
	else if (newChannelName === null)
		voiceLogChannel.sendMessage(`${username} disconnected`);
	else
		voiceLogChannel.sendMessage(`${username} moved to ${newChannelName}`);
});

client.on('channelCreate', (channel) => {
	updateChannels();
});

client.on('channelDelete', (channel) => {
	updateChannels();
});

client.on('message', (message) => {
	let msg = message.content;

	if (!msg.startsWith(prefix))
		return;

	// extract command and parameters
	let cmd = msg.replace(prefix, '').slice(0, msg.indexOf(' ') - 1);
	let params = msg.slice(msg.indexOf(' ') + 1, msg.length + 1);

	// check if the user has permission to make changes to the bot
	if (!message.member.hasPermission("ADMINISTRATOR", true))
		return;
	else {
		switch(cmd) {
			case "setLogChannel":
				// Primitive implementation, pls change
				setLogChannel(params, message.channel);
				writedata();
				break;
			default:
				message.channel.sendMessage("Sorry, I don't recognize that command T_T.");
		}
	}
});

let readdata = function () {
	data = JSON.parse(fs.readFileSync("data.json"));
	token = data.token;
	prefix = data.prefix;
}

let writedata = function () {
	fs.writeFile('data.json', JSON.stringify(data), 'utf8', () => {
		console.log('Data written successfully!');
	});
}

let updateChannels = function () {
	channels = client.channels;
}

let setLogChannel = function (channel, msgChannel) {
	voiceLogChannel = channels.get(channels.findKey('name', channel));

	// Return if no channel has been set
	if (typeof voiceLogChannel === 'undefined')
		return;
	else if (typeof voiceLogChannel === 'undefined' && msgChannel) {
		msgChannel.sendMessage(`Couldn't find channel '${channel}'`);
		return;
	}
	else if (voiceLogChannel.type === 'voice' && msgChannel) {
		msgChannel.sendMessage(`Can only log to text channels`);
		return;
	}

	data.voiceLogChannel = channel;

	if (msgChannel)
		msgChannel.sendMessage(`Channel for logging set to '${channel}'`);
}

readdata();
client.login(token);