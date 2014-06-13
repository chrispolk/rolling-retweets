
/**
 * Module dependencies.
 */

var express = require('express');
var routes = require('./routes');
var http = require('http');
var path = require('path');
var fs = require('fs')
var Twit = require('twit')
var config = require('./oauth.js')

var app = express();

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(express.cookieParser());
app.use(express.bodyParser());
app.use(express.session({ secret: 'SECRETA' }));
app.use(app.router);
app.use(require('stylus').middleware(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

app.get('/', routes.index);


var server = http.createServer(app).listen(app.get('port'), function() {
  console.log('Express server listening on port ' + app.get('port'));
});

//Twitter
var T = new Twit({
  consumer_key: config.twitter.consumerKey,
  consumer_secret: config.twitter.consumerSecret,
  access_token: config.twitter.accessToken,
  access_token_secret: config.twitter.accessTokenSecret
})

//Socket.io
var io = require('socket.io').listen(server);
var stream = T.stream('statuses/sample');

var top_ten_retweets = {};

var rolling_window_minutes = 10;

io.sockets.on('connection', function (socket) {
  console.log("made sockets connection!");
  stream.on('tweet', function(tweet) {
    if(tweet.retweeted_status) {
      // here, check to see the retweet counts, add a timestamp as well, check to see if greater than time interval that has been set
      socket.emit('info', { tweet: tweet});
    }
  });
});
