var Discord = require('discord.io');
var logger = require('winston');
var auth = require('./auth.json');
// Configure logger settings
logger.remove(logger.transports.Console);
logger.add(new logger.transports.Console, {
    colorize: true
});
logger.level = 'debug';
// Initialize Discord Bot
var bot = new Discord.Client({
    token: auth.token,
    autorun: true
});
bot.on('ready', function (evt) {
    logger.info('Connected');
    logger.info('Logged in as: ');
    logger.info(bot.username + ' - (' + bot.id + ')');
});

sps = (cmd) => {
    var choice = ['stone', 'paper', 'scissor']
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

bot.on('message', function (user, userID, channelID, message, evt) {
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
            case 'hello':
                bot.sendMessage({
                    to: channelID,
                    message: 'Howdy partner!'
                });
            case 'roll':
                bot.sendMessage({
                    to: channelID,
                    message: 'You rolled ' + Math.floor((Math.random() * 100) + 1)
                });
            case 'paper':
            case 'scissor':
            case 'stone':
                var answer = sps(cmd);
                switch (answer[2]) {
                    case "tied":
                        bot.sendMessage({
                            to: channelID,
                            message: answer[0] + "\nTied, try again " + user
                        });
                        break;
                    case "win":
                        bot.sendMessage({
                            to: channelID,
                            message:
                                answer[0] + "\nYou win " + user
                        });
                        break;
                    case "lose":
                        bot.sendMessage({
                            to: channelID,
                            message:
                                answer[0] +
                                "\nYou lose " +
                                user
                        });
                        break;
                    default:
                        break;
                }
                break;

            // Just add any case commands if you want to..
        }
    }
});