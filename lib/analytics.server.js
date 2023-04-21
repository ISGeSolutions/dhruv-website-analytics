var config = require('./config'),
	rabbit = require("wascally"),
	express = require('express'),
	app = require('express')(),
	server=require('http').createServer(app),
	io = require("socket.io"),
	path = require('path');

var allowCrossDomain = function(req, res, next) {
  var refererURL = req.headers.referer;
  if(refererURL){
	  var arr = refererURL.split("/");
	  if(arr && arr.length > 2){
		origin = arr[0] + "//" + arr[2]
	  }
  }
  res.header('Access-Control-Allow-Origin', "*");
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
  res.header('Access-Control-Allow-Headers', 'X-Requested-With, Accept, Origin, Referer, User-Agent, Content-Type, Authorization');
  //res.header('Access-Control-Allow-Credentials', 'true');

  // intercept OPTIONS method
  if (req.method === 'OPTIONS') {
    res.send(200);
  }
  else {
    next();
  }
};

app.configure(function(){
	app.use(allowCrossDomain);

});

app.use(express.compress());

app.get('/', function(req,res){
	res.sendfile(path.resolve('./dashboard.html'));
});

app.get('/health', function(req,res){
	res.send({status: "OK"});
});

app.get('/dashboard.html', function(req,res){
	res.sendfile(path.resolve('./dashboard.html'));
});

app.get('/all.js', function(req,res){
	res.sendfile(path.resolve('./all.js'));
});

app.get('/all.min.js', function(req,res){
	res.sendfile(path.resolve('./all.min.js'));
});
app.get('/allbkg.min.js', function(req,res){
	res.sendfile(path.resolve('./allbkg.min.js'));
});
app.get('/allquote.min.js', function(req,res){
	res.sendfile(path.resolve('./allquote.min.js'));
});
app.get('/all.dhruv.min.js', function(req,res){
	res.sendfile(path.resolve('./all.dhruv.min.js'));
});
app.get('/all.dhruv.js', function(req,res){
	res.sendfile(path.resolve('./all.dhruv.js'));
});
app.get('/socket.min.js', function(req,res){
	res.sendfile(path.resolve('./socket.io.min.js'));
});

app.get('/test', function(req,res){
	res.sendfile(path.resolve('./simplepage.html'));
});

app.get('/testbkg', function(req,res){
	res.sendfile(path.resolve('./testbkg.html'));
});
app.get('/testquote', function(req,res){
	res.sendfile(path.resolve('./testquote.html'));
});

app.get('/jquery.min.js', function(req,res){
	res.sendfile(path.resolve('./jquery.min.js'));
});

app.get('/jquery.browser.min.js', function(req,res){
	res.sendfile(path.resolve('./jquery.browser.min.js'));
});

app.get('/analytics.js', function(req,res){
	res.sendfile(path.resolve('./analytics.js'));
});

app.get('/jquery.querystring.js', function(req,res){
	res.sendfile(path.resolve('./jquery.querystring.js'));
});

console.log('Starting server..');

server.listen(config.server.port);
console.log('Listening on port %s', config.server.port);

setupMQ(function(){
	console.log('MQ connection opened');

	console.log('Opening listner..');

	var socketIO = io.listen(server);

	socketIO.set('log level', config.server.loglevel);

	socketIO.configure(function () {
	  socketIO.set("transports", ["xhr-polling"]);
	  socketIO.set("polling duration", 10);
	});

	console.log('Server started');

	socketIO.sockets.on('connection', function(socket){
		console.log('Client connected.');
		console.log(socket.handshake.address.address);

		socket.on('analytics_msg', function(msg) {
			console.log("Received message.");

			//socketIO.sockets.emit('pageview', msg);
			//console.log('Message published');

			publishMessage(msg);
		});
		socket.on('refresh', function(data){
			console.log('received referesh msg, accountcode: ' + data.accountcode);
			socket.broadcast.emit('refresh', data);
		});
		socket.on('load', function(accountcode){
			socket.broadcast.emit('get-data', accountcode);
		});
	});

	function publishMessage(message){
		console.log('publishing message');
	  var p = rabbit.publish(config.mq.exchangeName, {
	    type: 'analytics.message',
	    body: message,
	    routingKey: config.mq.routingKey
	  }).done(function(){
	  	console.log('publish done');
	  });
  }
});

function setupMQ(cb){
	console.log('Opening mq conection..');

	var mqConfig = {
	  connection: {
	    user: config.mq.user, pass: config.mq.pass, server: config.mq.server, port: 5672, vhost: config.mq.vhost
	  },
	  queues: [ { name: config.mq.queueName, subscribe: false, durable: true} ],
	  exchanges: [ { name: config.mq.exchangeName, type: config.mq.exchangeType, persistent: true, durable: config.mq.exchangeDurable || true } ],
	  bindings: [ { exchange: config.mq.exchangeName, target: config.mq.queueName, keys: [config.mq.routingKey] } ]
	};

	rabbit.configure(mqConfig)
		.then(function(){
			cb();
		});
};
