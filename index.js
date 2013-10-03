// Modules
var io = require('socket.io').listen(process.env.PORT || 1337);
var MongoClient = require('mongodb').MongoClient;
var tracer = require('tracer').colorConsole({
	level: process.env.LOGLEVEL || 'info'
});

// Libraries
var Player = require('./lib/player');
var Game = require('./lib/game');

// Local
var defender, stats, db;

io.set('logger', {
	debug: tracer.debug,
	info: tracer.info,
	warn: tracer.warn,
	error: tracer.error
});

// Initiate the mongo connection
MongoClient.connect('mongodb://' + (process.env.MONGOHOST || '127.0.0.1') + ':27017/node-defender', function(err, connection) {
	if (err) {
		tracer.error(err);
		tracer.warn('Mongo DB connection failed, no game results will be recorded.');
		return;
	}
	db = connection;
});

// Stat channel (for scoreboard)
stats = io.of('/stats');

// Node defender main channel
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
			// Notify client of final player stats
			defender.emit('death', {
				'message': player.name() + ' is not in my base, killing my dudes anymore.',
				'stats': player.info()
			});

			// Kick the client
			socket.emit('disconnect', {});

			// Record player stats to DB
			game.recordGame(db, player, function (err, game) {
				if (err) {
					tracer.error(err);
					tracer.warn('Player stats not saved.');
					return;
				}

				// Read top 10 games and emit to stats channel
				Game.topScoreList(db, function(err, results) {
					if (err) {
						tracer.error(err);
						tracer.warn('top10 not transmitted.');
						return;
					}
					tracer.info({
						top10: results
					});
					stats.emit('top10', results);
				});
			});
		});

		// Welcome message
		socket.emit('handshake', {
			'message': 'Welcome ' + player.name() + ', prepare to be attacked!'
		});

		// Recieve action commands from the player
		socket.on('action', function(data) {
			var playerDamage, enemyDamage;

			// Process player action first, then mob action and spawning
			playerDamage = game.attackEnemy(data.target, data.weapon);

			enemyDamage = game.getEnemyAttackDamage();
			player.damage(enemyDamage);

			game.setupRound();

			// Add a delay to not make the game instant
			setTimeout(function() {
				socket.emit('round', {
					player: player.info(),
					round: game.getRound(),
					damage: {
						taken: enemyDamage,
						inflicted: playerDamage
					},
					summary: game.summary(),
					mobs: game.getEnemies()
				})
			}, process.env.DELAY || 1000);
		});

		// Initial round
		game.spawnEnemies();
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
