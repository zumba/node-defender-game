var io = require('socket.io').listen(1337);
var tracer = require('tracer').colorConsole({
	level: 'debug'
});

io.set('logger', {
	debug: tracer.debug,
	info: tracer.info,
	warn: tracer.warn,
	error: tracer.error
});

io.sockets.on('connection', function(socket) {
	socket.emit('handshake', {});
	setInterval(function() {
		socket.emit('test_event', {
			'test': Math.floor(Math.random() * 10001)
		});
	}, 3000);
});
