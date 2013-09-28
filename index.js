// Modules
var io = require('socket.io').listen(process.env.PORT || 1337);
var tracer = require('tracer').colorConsole({
	level: process.env.LOGLEVEL || 'debug'
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
		var player = new Player(socket.handshake.query.username),
			round = 1;

		// Handle the player's demise
		player.on('death', function(player) {
			defender.emit('death', {
				'message': player.name() + ' is not in my base, killing my dudes anymore.',
				'stats': player.info()
			});
			socket.emit('disconnect', {});
			
		});

		// Welcome message
		socket.emit('handshake', {
			'message': 'Welcome ' + player.name() + ', prepare to be attacked!'
		});

		socket.on('action', function(data) {
			// Recieve action commands from the player
			// Should emit an event on the game "brain" class.
			// The game brain should determine how much damage etc per mob per round.
			var dmg = Math.ceil(Math.random() * 10);
			round++;
			player.damage(dmg);

			// Add a delay to not make the game instant
			setTimeout(function() {
				socket.emit('round', {
					player: player.info(),
					round: round,
					damage: {
						taken: dmg,
						inflicted: 0
					},
					mobs: []
				})
			}, 1000);
		});

		// Initial round
		socket.emit('round', {
			player: player.info(),
			round: round,
			damage: {
				taken: 0,
				inflicted: 0
			},
			mobs: []
		});
	});
