// Levels
// Version 1.0.0 - By zacimac (www.zachary.fun) & contributors

const Discord = require("discord.js");


const terminalLink = require('terminal-link');
const nodeHtmlToImage = require("node-html-to-image");
const path = require("path");
const fs = require("fs");
const client = new Discord.Client();
const config = require("./config.json");
var mysql = require('mysql');
client.login(config.token);
var con = mysql.createConnection({
    host: config.mysql.host,
    user: config.mysql.username,
    password: config.mysql.password,
    database: config.mysql.database
});

var userRatelimit = {};

con.connect(function(err) {
    if (err) throw err;
    console.log("MySQL database connected!");
    // Bot Ready
    client.on("ready", () => {
        if (client.guilds.cache.size == 0) console.log(`Your bot ${client.user.username} is not in a server yet, follow the link to add it to a server.`, terminalLink("Add your bot", `https://discordapp.com/oauth2/authorize?client_id=${client.user.id}&scope=bot&permissions=16384`));
        if (client.guilds.cache.size > 1) console.warn(`!!! NOTE !!! Levels is only designed to be in one server only! (In ${client.guilds.cache.size} guilds)\nDue to this, the guild specified in the config will only be listened to.`);
        console.log(`${client.user.username} is now ready!`);
        con.query("CREATE TABLE IF NOT EXISTS " + config.mysql.tableName + " (discord VARCHAR(255) NOT NULL PRIMARY KEY, level INT(10) NOT NULL DEFAULT '1', xp INT(10) NOT NULL DEFAULT '1', lastMessage VARCHAR(255) NOT NULL DEFAULT '1' );", function (err, result) {
            if (err) throw err;
        });
    });

    const commands = {
        "profile": (msg) => {
            msg.channel.startTyping();
            getUser(msg.author.id, function(dbUser) {
                /*msg.channel.send("", {
                    embed: {
                        color: config.colors.ok,
                        title: `Profile for ${msg.author.username}#${msg.author.discriminator}`,
                        fields: [
                            {
                                name: "Level",
                                value: dbUser.level,
                                inline: true
                            },
                            {
                                name: "XP",
                                value: dbUser.xp + "/" + (dbUser.level * config.xp.levelUp),
                                inline: true
                            }
                        ]
                    }
                });*/
                if (!fs.existsSync("./temp")){
                    fs.mkdirSync("./temp");
                }
                var now = new Date();
                var fileStr = msg.author.username + now.getUTCDate() + now.getMonth() + now.getMilliseconds() + ".png"
                nodeHtmlToImage({
                    output: "./temp/" + fileStr,
                    html: 
        `<html>
            <head>
                <style>
                    body {
                        width: 700px;
                        height: 400px;
                        font-family: Arial, Helvetica, sans-serif;
                        background-image: url("https://zachary.fun/i/space.jpg");
                        background-size: cover;
                        background-position: fixed;
                        background-repeat: no-repeat;
                    }
                    .contentArea {
                        position: fixed;
                        z-index: 10;
                        top: 60;
                        left: 50;
                        background: rgba(0, 0, 0, 0.8);
                        height: 300px;
                        width: 700px;
                        border-radius: 20px;
                    }
                    .avatarImage {
                        position: fixed;
                        z-index: 11;
                        display: block;
                        height: 50px;
                        width: 50px;
                        border-radius: 50%;
                        top: 100;
                        left: 80;
                        border: solid 2px white;
                    }
                    .usernameText {
                        position: fixed;
                        z-index: 11;
                        display: block;
                        font-size: 2em;
                        color: white;
                        top: 78;
                        left: 150;
                    }
                    .xpBar {
                        position: fixed;
                        z-index: 20;
                        background: rgba(255, 255, 255, 0.3);
                        height: 40px;
                        width: 600px;
                        top: 180;
                        left: 80;
                        border-radius: 20px;
                    }

                    .xpBarFill {
                        position: relative;
                        display: block;
                        background: #1abc9c;
                        height: 100%;
                        width: {{xpPercent}}%;
                        border-radius: 20px;
                        text-align: right;
                        vertical-align: center;
                    }
                    .xpBarFill span {
                        display: block;
                        padding-top: 7px;
                        padding-right: 5px;
                        font-size: 1.3em;
                        color: white;
                    }

                    #tlvl {
                        position: fixed;
                        color: white;
                        top: 220;
                        left: 140;
                        font-size: 1.8em;
                    }

                    #txp {
                        position: fixed;
                        color: white;
                        top: 220;
                        left: 520;
                        font-size: 1.8em;
                    }

                    #vlvl {
                        position: fixed;
                        color: white;
                        top: 260;
                        left: 140;
                        font-size: 1.5em;
                    }

                    #vxp {
                        position: fixed;
                        color: white;
                        top: 260;
                        left: 520;
                        font-size: 1.5em;
                    }
                </style>
            </head>
            <body>
                <div class="bannerImg">
                <img class="avatarImage" src="https://cdn.discordapp.com/avatars/138862213527109632/a_715d1412823b8abb428ddcfa5865ce22.webp">
                <p class="usernameText">{{name}}</p>
                <div class="contentArea">
                    <div class="xpBar">
                        <div class="xpBarFill"><span>{{xpPercent}}%</span></div>
                    </div>
                    <p id="tlvl">Level</p>
                    <p id="txp">XP</p>
                    <p id="vlvl">{{level}}</p>
                    <p id="vxp">{{xp}}</p>
                </div>
            </body>
        </html>`,
                    content: { name: `${msg.author.username}#${msg.author.discriminator}`, level: dbUser.level, xp: dbUser.xp + "/" + (dbUser.level * config.xp.levelUp), xpPercent: Math.round((dbUser.xp / (dbUser.level * config.xp.levelUp)) * 100) }
                })
                .then(() => {
                    msg.channel.stopTyping();
                    msg.channel.send({
                        files: [{
                          attachment: path.join(__dirname, "./temp/" + fileStr),
                          name: fileStr
                        }]
                    })
                    .then(setTimeout(function() {fs.unlinkSync("./temp/" + fileStr)}, 5000));
                });
            });
        },
        "xp": (msg) => {
            commands["profile"](msg);
        },
        "settings": (msg) => {
            if (config.admins.users.includes(msg.author.id)) {
                var msgArg = msg.content.toLowerCase().split(" ");
                if (msgArg[1] == "channel") {

                }
                else if (msgArg[1] == "xpadd") {
                    if (msgArg[2].match(/^\d+$/)) {
                        var user = msg.mentions.users.first();
                        if (user) {
                            msg.channel.send("", {
                                embed: {
                                    color: config.colors.error,
                                    title: `Adding ${msgArg[2]} XP to ${user.username}#${user.discriminator}`
                                }
                            })
                            .then(m => {
                                for (i=0; i < parseInt(msgArg[2]); i++) {
                                    addXP(user.id);
                                    if (i + 1 == parseInt(msgArg[2])) {
                                        m.edit("", {
                                            embed: {
                                                color: config.colors.ok,
                                                title: `Finished!!`,
                                                description: `Added ${msgArg[2]} XP to ${user.username}#${user.discriminator}.`
                                            }
                                        })
                                    }
                                }
                            });
                        }
                        else {
                            msg.channel.send("", {
                                embed: {
                                    color: config.colors.error,
                                    title: "Invalid or missing mention.",
                                    description: `Example for xpadd: \`\`${config.prefix}settings xpadd 20 @Zachary\`\``
                                }
                            });
                        }
                    }
                    else {
                        msg.channel.send("", {
                            embed: {
                                color: config.colors.error,
                                title: "That's not a number!",
                                description: `Example for xpadd: \`\`${config.prefix}settings xpadd 20 @Zachary\`\``
                            }
                        });
                    }
                }
                else {
                    msg.channel.send("", {
                        embed: {
                            color: config.colors.error,
                            title: "Missing or unknown command argument.",
                        }
                    });
                }
            }
            else {
                msg.channel.send("", {
                    embed: {
                        color: config.colors.error,
                        title: "Sorry!",
                        description: "You don't have permission to use this command."
                    }
                });
            }
        }
    };

    client.on("message", (msg) => {
        if (!msg.author.bot) {
            if (msg.guild) { // Check if guild
                if (msg.guild.id == config.guild) {
                    var timeNow = new Date().getTime();
                    // XP 
                    getUser(msg.author.id, function(dbUser) {
                        if (dbUser) {
                            if (timeNow - parseInt(dbUser.lastMessage) > config.xp.timeout) {
                                addXP(msg.author.id);
                            }
                        }
                        else {
                            addXP(msg.author.id);
                        }
                    });
                
                    // Commands
                    if (commands.hasOwnProperty(msg.content.toLowerCase().slice(config.prefix.length).split(' ')[0])) {
                        if (userRatelimit[msg.author.id] == undefined) {
                            userRatelimit[msg.author.id] = true;
                            commands[msg.content.toLowerCase().slice(config.prefix.length).split(' ')[0]](msg);
                            setTimeout(function() { delete userRatelimit[msg.author.id] }, 5000);
                        }
                        else {
                            msg.channel.send("", {
                                embed: {
                                    color: config.colors.error,
                                    title: "Hold up!",
                                    description: `Please wait more than ${config.cmdTimeout / 1000} second(s) before using and commands again.`,
                                    footer: {
                                        text: `Requested by ${msg.author.username}`
                                    }
                                }
                            }).then(m => {
                                setTimeout(function() { m.delete(); }, 10000);
                            })
                        }
                    }
                }
            }
        }
    });

    function addXP(user) {
        getUser(user, function(dbUser) {
            var timeNow = new Date().getTime();
            var newLevel = dbUser.level;
            var newXP = dbUser.xp;
            if (dbUser) {
                if (dbUser.xp + 1 == dbUser.level * config.xp.levelUp) {
                    newLevel = dbUser.level + 1;
                    newXP = 0;
                    xpRewards(user, newLevel);
                }
                else {
                    newXP = dbUser.xp + 1;
                }
                dbUser.lastMessage = timeNow.toString();
                con.query(`UPDATE xptbl SET level = ${newLevel}, xp = ${newXP}, lastMessage = '${timeNow.toString()}' WHERE discord = '${user}'`, function (err, result) {
                    if (err) throw err;
                });
            }
            else {
                con.query(`INSERT INTO xptbl (discord, lastMessage) VALUES (${user}, '${timeNow.toString()}')`, function (err, result) {
                    if (err) throw err;
                });
            }
        });
    }

    function xpRewards(user, level) {
        if (config.xp.rewards.hasOwnProperty(level)) {
            var rewardArray = config.xp.rewards[level];
            for (i = 0; i > rewardArray.length; i++) {
                var rewardType = rewardArray[i].split("-")[0];
                var rewardParam = rewardArray[i].split("-")[1];
                if (rewardType == "giveRole") {
                    client.guilds.cache.get(config.guild).members.cache.get(user).roles.add(rewardParam);
                }
                else {
                    console.log(`Unknown reward type for level ${level} when action ${i} was run... ${user} was skipped for this reward action.`);
                }
            }
        }
    }

    function getUser(uid, callback) {
        con.query(`SELECT * FROM xptbl WHERE discord = '${uid}'`, function(err, result) {
            if (err) throw err;
            if (result.length == 1) {
                callback(result[0]);
            }
            else {
                callback(undefined);
            }
        });
    }

    setInterval(function() {
        con.query(`SELECT 1`, function(err, result) {
            if (err) throw err;
        }); 
    }, 10000);
});