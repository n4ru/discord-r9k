const fluidb = require('fluidb');
const Discord = require('discord.js');
const crypto = require('crypto');
const db = new fluidb('r9k');

const config = {
    // Half the initial ban time in seconds
    'timeout': 2,
    // Multiplier per subsequent ban,
    'timeoutMultiplier': 2,
    // Auth token for the bot
    'token': "BOT_TOKEN",
    // Channel ID
    'channel': "CHANNEL_ID",
    // Muted Role
    'role': "MUTED_ROLE",
    // Unmuted Role
    'drole': "UNMUTED_ROLE",
    // Server ID
    'guild': "SERVER_ID",
    // Admin
    'admin': "ADMIN_ID"
}

// Login
const client = new Discord.Client();
client.login(config.token);

if (!db.ban) db.ban = {};
if (!db.messages) db.messages = {};
if (!db.nonce) db.nonce = {};

tagRegex = function (msg) {
    if (/<@!?[0-9]*>/.test(msg.content))
        return msg.content.match(/<@!?([0-9]*)>/)[1];
}

const filter = (msg) => {
    return Array.from(
        new Set(
            msg.content
                .toLowerCase() // Cast to lowercase
                .trim() // Whitespace
                .replace(/<(?:[^\d>]+|:[A-Za-z0-9]+:)\w+>/g, '') // Discord Tags
                .replace(/[^a-z]/g, ''))) // All remaining non-alphas
        .join('')
}

const hash = (msg) => {
    return crypto.createHmac('sha256',
        filter(msg)) // Break down alphas into single occurrence letters (26! possible combinations)
        .digest('hex');
}

const mute = (msg, ) => {
    let id = msg.author.id;
    db.nonce[id] = db.nonce[id] ? db.nonce[id] + 1 : 1;
    let timeout = (config.timeout * Math.pow(config.timeoutMultiplier, db.nonce[id]))
    db.ban[id] = Date.now() + (timeout * 1000);
    msg.member.addRole(config.role);
    msg.member.removeRole(config.drole);
    msg.delete();
    console.log(`${id} muted for ${timeout} seconds. Letter sequence: ${filter(msg)}`)
    try { msg.author.send(`You have been muted for ${timeout} seconds for sending a non-unique message.`) } catch (e) { }
}

const forceMute = (msg, id) => {
    db.nonce[id] = db.nonce[id] ? db.nonce[id] + 1 : 1;
    let timeout = (config.timeout * Math.pow(config.timeoutMultiplier, db.nonce[id]))
    db.ban[id] = Date.now() + (timeout * 1000);
    client.guilds.get(config.guild).members.get(id).addRole(config.role);
    client.guilds.get(config.guild).members.get(id).removeRole(config.drole);
    console.log(`${id} manually muted for ${timeout} seconds. `)
    try { client.guilds.get(config.guild).members.get(id).send(`You have been muted for ${timeout} seconds for sending a non-unique message.`) } catch (e) { }
}

const nonceSet = (msg, id) => {
    db.nonce[id] = 1;
    db.ban[id] = 0;
    console.log(`${id} nonce and mutes manually cleared.`)
    msg.channel.send(`Nonce and mutes cleared!`)
}

const unmute = (msg, id) => {
    db.ban[id] = 0;
    console.log(`${id} mute manually cleared.`)
    msg.channel.send(`Mute cleared!`)
}

const check = (msg) => {
    // Only check specified channel
    if (msg.channel.id != config.channel) return;

    // Check if the message was unique
    let seq = filter(msg);
    if (!db.messages[seq]) {
        console.log(`Letter sequence stored: ${seq}`);
        db.messages[seq] = true;
        return;
    }
    msg.content.includes("!mute")
    // Mute the user
    if (msg.author.id != config.admin) mute(msg);
}

// Check New Messages and Edited Messages
client.on('message', msg => {
    if (msg.author.id == config.admin) {
        if (msg.content.includes("!mute")) forceMute(msg, tagRegex(msg));
        if (msg.content.includes("!nonce")) nonceSet(msg, tagRegex(msg));
        if (msg.content.includes("!unmute")) unmute(msg, tagRegex(msg));
    }
    check(msg);
});
client.on('messageUpdate', msg => {
    check(msg);
});

// Clear Bans
setInterval(() => {
    Object.keys(db.ban).forEach(id => {
        if (Date.now() > db.ban[id]) {
            delete db.ban[id];
            client.guilds.get(config.guild).members.get(id).removeRole(config.role);
            client.guilds.get(config.guild).members.get(id).addRole(config.drole);
            console.log(`${id} unbanned.`);
        }
    })
}, 1000)