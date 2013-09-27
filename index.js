// Modules
var io = require('socket.io').listen(1337);
var tracer = require('tracer').colorConsole({
	level: 'debug'
});

// Libraries
var Player = require('./lib/player');

// Local
var defender;

io.set('logger', {
	debug: tracer.debug,
	info: tracer.info,
	warn: tracer.warn,
	error: tracer.error
});

io.set('authorization', function(data, accept) {
	if (typeof data.query.username === 'undefined') {
		return accept('Must define a username in order to connect.', false);
	}
	return accept(null, true);	
});

defender = io
	.of('/defender')
	.on('connection', function(socket) {
		var player = new Player(socket.handshake.query.username);
		socket.emit('handshake', {
			'message': 'Welcome ' + player.name() + ', prepare to be attacked!'
		});
		setInterval(function() {
			socket.emit('test_event', {
				'test': Math.floor(Math.random() * 10001)
			});
		}, 3000);
	});
