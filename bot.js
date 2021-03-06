var Discord = require('discord.io');
var logger = require('winston');
var axios = require('axios');
require('dotenv').config();
// Configure logger settings
logger.remove(logger.transports.Console);
logger.add(new logger.transports.Console, {
    colorize: true
});
logger.level = 'debug';
// Initialize Discord Bot
var bot = new Discord.Client({
    token: process.env.BOT_TOKEN,
    autorun: true
});
bot.on('ready', function (channelID, evt) {
    console.log(channelID);
    logger.info('Connected');
    logger.info('Logged in as: ');
    logger.info(bot.username + ' - (' + bot.id + ')');
    // bot.sendMessage({
    //     to: process.env.TEST_CHANNEL,
    //     message: 'Hello humans, I am ready to serve!\nTo find out what I can do type "!help".'
    // })
});

rps = (cmd) => {
    var choice = ['rock', 'paper', 'scissor']
    var rand = choice[Math.floor(Math.random() * choice.length)];
    var answer = [rand, cmd]

    if (rand === cmd) {
        answer.push("tied");
        return answer;
    } else if ((rand === choice[0] && cmd === choice[1]) ||
        (rand === choice[2] && cmd === choice[0]) ||
        (rand === choice[1] && cmd === choice[2])) {
        answer.push("win");
        return answer;
    } else {
        answer.push("lose");
        return answer;
    };
}

var gameSession = []
bot.on('message', function (user, userID, channelID, message, evt) {
    var findSession = gameSession.find(user => user.userID === userID)
    // Our bot needs to know if it will execute a command
    // It will listen for messages that will start with `!`
    if (message.substring(0, 1) == '!') {
        var args = message.substring(1).split(' ');
        var cmd = args[0];
        args = args.splice(1);
        switch (cmd) {
            // !ping
            case 'ping':
                bot.sendMessage({
                    to: channelID,
                    message: 'Pong!'
                });
                break;
            case 'hello':
                bot.sendMessage({
                    to: channelID,
                    message: 'Howdy partner!'
                });
                break;
            case 'roll':
                bot.sendMessage({
                    to: channelID,
                    message: 'You rolled ' + Math.floor((Math.random() * 100) + 1)
                });
                break;
            case 'game':
                if (gameSession.find(user => user.userID)) {
                    bot.sendMessage({
                        to: channelID,
                        message: "My score: " + findSession.botScore + "\n" +
                            user + " score: " + findSession.playerScore
                    })
                }
                else {
                    gameSession.push({ userID: userID, botScore: 0, playerScore: 0 })
                    bot.sendMessage({
                        to: channelID,
                        message: "Hey " + user + "!\n" + "Let's play rock paper scissors!\n" + " Best of Five." + "\nStarting new session..."
                    });
                }
                break;
            case 'paper':
            case 'scissor':
            case 'rock':
                if (gameSession.find(user => user.userID === userID)) {
                    var answer = rps(cmd);
                    console.log(gameSession.find(user => user.userID));
                    switch (answer[2]) {
                        case "tied":
                            bot.sendMessage({
                                to: channelID,
                                message: answer[0] + "\nTied, try again " + user + "\nMy score: " + findSession.botScore + "\n" + user + " score: " + findSession.playerScore
                            });
                            break;
                        case "win":
                            findSession.playerScore = (findSession.playerScore + 1)
                            if (findSession.playerScore >= 3) {
                                bot.sendMessage({
                                    to: channelID,
                                    message:
                                        answer[0] + "\nYou won the game " + user + "!!!\n\nMy score: " + findSession.botScore + "\n" + user + " score: " + findSession.playerScore
                                });
                                gameSession = removeA(gameSession, userID);
                            } else {
                                bot.sendMessage({
                                    to: channelID,
                                    message:
                                        answer[0] + "\nYou win " + user + "\nMy score: " + findSession.botScore + "\n" + user + " score: " + findSession.playerScore
                                });
                            }
                            break;
                        case "lose":
                            findSession.botScore = (findSession.botScore + 1)
                            if (findSession.botScore >= 3) {
                                bot.sendMessage({
                                    to: channelID,
                                    message:
                                        answer[0] + "\nYou lost the game " + user + "!!!\n\nMy score: " + findSession.botScore + "\n" + user + " score: " + findSession.playerScore
                                });
                                gameSession = removeA(gameSession, userID);
                            } else {
                                bot.sendMessage({
                                    to: channelID,
                                    message:
                                        answer[0] +
                                        "\nYou lose " +
                                        user + "\nMy score: " + findSession.botScore + "\n" + user + " score: " + findSession.playerScore
                                });
                            }
                            break;
                        default:
                            break;
                    }
                } else {
                    bot.sendMessage({
                        to: channelID,
                        message: "You haven't started a session.\nTo start a game session type !play"
                    })
                }
                break;
            case "translate":
                bot.sendMessage({
                    to: channelID,
                    message: "What do you want to translate?"
                })
                bot.on('message', (user, userID, channelID, message, evt) => {
                    try {
                        axios.get('https://translate.yandex.net/api/v1.5/tr.json/translate', {
                            params: {
                                key: process.env.YANDEX_API_KEY,
                                text: message,
                                lang: 'en'
                            }
                        }).then(res => {
                            console.log(res)
                            if (res.data.text[0] !== message) {
                                bot.sendMessage({
                                    to: channelID,
                                    message: res.data.text[0]
                                })
                            }
                        })
                    } catch (error) {
                        console.log(error)
                        bot.sendMessage({
                            to: channelID,
                            message: "Couldn't translate that... :("
                        })
                    }
                })
                break;
            case "test":
                bot.sendMessage({
                    to: userID,
                    message: "Is this what you're looking for?\n" + message
                })
                break;
            case "help":
                bot.sendMessage({
                    to: channelID,
                    message: "These are my commands:\n\n" +
                        "- !hello - Hello to you too.\n" +
                        "- !roll - To roll random number between 1-100\n" +
                        "- !ping - To recieve pong.\n" +
                        "- !game - To play rock paper scissors.(still under development...)\n" +
                        "- !translate - If you need translation"
                })
                break;
            default:
                break;
            // Just add any case commands if you want to..
        }
    }

});