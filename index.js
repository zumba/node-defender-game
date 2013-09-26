var tracer = require('tracer');
var io = require('socket.io').listen(1337);

io.sockets.on('connection', function(socket) {
	socket.emit('handshake', {});
});
