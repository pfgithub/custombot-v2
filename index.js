var irc = require('irc-api');

var permList = [
  "+","%","@","&","~"
]
var permData = {
  "+": "voice",
  "%": "voice",
  "@": "chanop",
  "&": "chanop",
  "~": "chanop"
};

Array.prototype.indexOf||(Array.prototype.indexOf=function(r,t){var n;if(null==this)throw new TypeError('"this" is null or not defined');var e=Object(this),i=e.length>>>0;if(0===i)return-1;var a=+t||0;if(Math.abs(a)===1/0&&(a=0),a>=i)return-1;for(n=Math.max(a>=0?a:i-Math.abs(a),0);i>n;){if(n in e&&e[n]===r)return n;n++}return-1});

if (!String.prototype.startsWith) {
    String.prototype.startsWith = function(searchString, position){
      position = position || 0;
      return this.substr(position, searchString.length) === searchString;
  };
}

function Custombot(data){
  var datas = data.split('/')
  this.bot = new irc.Irc(datas[0], parseInt(datas[1],10), datas[2]);

  this.commands = [];
  this.regrepls = [];

  this.lastSeenTable = {};
  this.logs = {};

  this.bot.on('privmsg', function(msg,user,chan){
    if(!this.logs[chan]) this.logs[chan] = [];
    this.logs[chan].push({time:new Date(),user:user.nick,msg:msg});
    if(this.logs[chan].length > 20) this.logs[chan].shift();

    this.lastSeenTable[user.nick] = new Date();

    this.commands.forEach(function(command){
      if(msg.startsWith(command.cmd)){
        var params = msg.split(command.cmd + ' ').join('').split(' ');
        var parsedparams = {};
        command.args.forEach(function(arg,i){
          if(params[i]){
            switch (arg.type){
              case "string":
                parsedparams[arg.name] = params[i];
                break;
              case "string...":
                var clonedParams = params.slice();
                clonedParams.splice(0,i);
                parsedparams[arg.name] = clonedParams.join(' ');
                break;
              case "int":
                try{
                  parsedparams[arg.name] = parseInt(params[i],10);
                }catch(e){
                  parsedparams[arg.name] = undefined;
                  console.log(e);
                }

                break;
              case "number":
                try{
                  parsedparams[arg.name] = parseFloat(params[i]);
                }catch(e){
                  parsedparams[arg.name] = undefined;
                  console.log(e);
                }

                break;
            }
          }
        }.bind(this));
        command.callback(chan,parsedparams,user.nick);
      }
    }.bind(this));
    if(msg.startsWith('<help')){
      var help = [];
      help.push('Commands:')
      this.commands.forEach(function(command){
        if(command.help){
          var args = [];
          command.args.forEach(function(arg){
            args.push(arg.name + '<' + arg.type + '>')
          });
          help.push(' - ' + command.cmd + ' ' + args.join(' ') + ' : ' + command.help);
        }
      }.bind(this));
      help.push('Replacers:')
      this.regrepls.forEach(function(reg){
        if(reg.help){
          help.push(' - ' + reg.help)
        }
      }.bind(this));
      this.say(chan, 'Bot help:');
      help.forEach(function(heli){
        this.say(chan, heli);
      }.bind(this));
      this.say(chan, 'End of bot help');
    }
    this.regrepls.forEach(function(regexp,i){
      var match = msg.match(regexp.regex);
      if(match){
        match.forEach(function(cont){
          regexp.callback(chan,cont,user.nick);
        });
      }
    });
  }.bind(this));

  this.bot.on('connect',function(){
    this.bot.join(datas[3]);
    this.bot.say(datas[3],'Hello, I\'m '+datas[2] + '. Use <help to see my commands and syntaxes' )
  }.bind(this))
}

Custombot.prototype.registerCommand = function (command,help,args,callback) {
  this.commands.push({
    cmd: command,
    help: help,
    args: args,
    callback: callback
  });
};

Custombot.prototype.registerLookup = function (regex,help,callback) {
  this.regrepls.push({
    regex: regex,
    help: help,
    callback: callback
  });
};

Custombot.prototype.say = function(chan, msg){
  this.bot.say(chan,msg);
};

module.exports = Custombot;
