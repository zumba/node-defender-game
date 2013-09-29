// Modules
var io = require('socket.io').listen(process.env.PORT || 1337);
var tracer = require('tracer').colorConsole({
	level: process.env.LOGLEVEL || 'debug'
});

// Libraries
var Player = require('./lib/player');
var Game = require('./lib/game');

// Local
var defender;

io.set('logger', {
	debug: tracer.debug,
	info: tracer.info,
	warn: tracer.warn,
	error: tracer.error
});


defender = io
	.of('/defender')
	.authorization(function(handshake, callback) {
		if (typeof handshake.query.username === 'undefined') {
			return callback('Must define a username in order to connect.', false);
		}
		return callback(null, true);	
	})
	.on('connection', function(socket) {
		var player = new Player(socket.handshake.query.username),
			game = new Game();

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

		// Recieve action commands from the player
		socket.on('action', function(data) {
			var dmg = game.getEnemyAttackDamage();
			player.damage(dmg);

			game.setupRound();

			// Add a delay to not make the game instant
			setTimeout(function() {
				socket.emit('round', {
					player: player.info(),
					round: game.getRound(),
					damage: {
						taken: dmg,
						inflicted: 0
					},
					summary: game.summary(),
					mobs: game.getEnemies()
				})
			}, 1000);
		});

		// Initial round
		socket.emit('round', {
			player: player.info(),
			round: game.getRound(),
			damage: {
				taken: 0,
				inflicted: 0
			},
			summary: game.summary(),
			mobs: game.getEnemies()
		});
	});
