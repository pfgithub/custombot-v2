var Custombot = require('../index.js');
var moment = require('moment');

var reminders = {};

var bot = new Custombot('apex.lolwutnet.xyz/6667/bag/#lolwut');

bot.bot.on('privmsg', function(msg,user,chan){
  if(reminders[user.nick]){
    bot.say(chan, 'Hey there, '+user.nick+'. Check your PMs from me.');
    bot.say(user.nick, 'Some people have sent you reminders:');
    reminders[user.nick].forEach(function(reminder,i){
      bot.say(user.nick, moment(reminder[2]).fromNow() + ': <'+reminder[0]+'> '+reminder[1]);
    });
    reminders[user.nick] = undefined;
  }
});

bot.registerCommand("<join", undefined, [
  {
    "type": "string",
    "name": "channel"
  }
], function(channel, args, user){
  console.log('Joining Channel '+args.channel)
  bot.bot.join(args.channel)
});

bot.registerCommand("<part", undefined, [
  {
    "type": "string",
    "name": "channel"
  }
], function(channel, args, user){
  console.log('Parting Channel '+args.channel)
  bot.bot.part(args.channel)
});

bot.registerCommand("<seen", "Checks when the user was last seen",[
  {
    "type": "string",
    "name": "user"
  }
], function(channel, args, user){
  if(bot.lastSeenTable[args.user]) bot.say(channel,args.user + ' was last seen on ' + moment(bot.lastSeenTable[args.user]).fromNow());
  else bot.say(channel, "I have not seen "+args.user+'. Maybe I restarted, or you typed their name wrong.');
  if(args.user == "bag") bot.say(channel, "lolwut");
});

bot.registerCommand("<logs", "Sends you logs for the channel",[], function(channel, args, user){
  bot.say(user,'Logs for '+channel+' as of '+moment(new Date()).format() + ' are as follows:');
  bot.logs[channel].forEach(function(log){
    bot.say(user,moment(log.time).fromNow() + ': <' + log.user + '> ' + log.msg)
  });
});

bot.registerCommand("<exit", undefined, [
  {
    "type": "string",
    "name": "channel"
  }
], function(channel, args, user){
  console.log('Shutting Down For ' + user)
  bot.say(channel, 'Shutting Down')
  setTimeout(function(){
    process.exit(0);
  }, 1000);
});

bot.registerCommand("<notify", 'Notifies <user> <message> next time they talk', [
  {
    "type": "string",
    "name": "user"
  },
  {
    "type": "string...",
    "name": "message"
  }
], function(channel, args, user){
  if(!reminders[args.user]) reminders[args.user] = [];
  reminders[args.user].push([user,args.message,new Date()]);
  bot.say(channel, args.user + ' has been notified to '+args.message)
});

bot.registerCommand("<about", 'Displays about information', [], function(channel, args, user){
  bot.say(channel, 'Hello, I\'m bag. I am the example bot for custombot-v2 (NodeJS), and I was made by pfg. Type <help for a list of commands. Custombot-v2 is not currently available for download.')
});

bot.registerLookup(new RegExp(/r\/[A-Za-z1-9]+/g), "Links all r/threads to their reddit page", function(channel, regcontent, user){
  bot.say(channel, 'https://www.reddit.com/r/' + regcontent.replace('r/','') + ' (for r/' + regcontent.replace('r/','') + ')')
});

bot.registerLookup(new RegExp(/^s\/[a-zA-Z0-9 \']+\/[a-zA-Z0-9 \']+$/g), "Adds s/thing/other thing syntax (spaces allowed)", function(channel, regcontent, user){
  bot.say(channel, '<' + bot.logs[channel][bot.logs[channel].length-2].user + '> ' +bot.logs[channel][bot.logs[channel].length-2].msg.split(regcontent.split('/')[1]).join(regcontent.split('/')[2]))
});
