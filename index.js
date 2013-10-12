/* globals process, __dirname */
// Modules
var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io').listen(server);
var tracer = require('tracer').colorConsole({
	level: process.env.LOGLEVEL || 'info'
});
var _ = require('underscore');

// Libraries
var PlayerCollection = require('./lib/player_collection');
var Player = require('./lib/player');
var Game = require('./lib/game');
var Util = require('./lib/util');

// Local
var defender, db, stats, emitTop10;
var players = new PlayerCollection();

io.set('logger', {
	debug: tracer.debug,
	info: tracer.info,
	warn: tracer.warn,
	error: tracer.error
});

// Monitoring
Util.initializeNodetime();

// Setup Express Server
app.use(express.static(__dirname + '/public'));
app.engine('jade', require('jade').__express);
app.set('views', __dirname + '/templates');
app.set('view engine', 'jade');

// Express Routes
app.get('/', function(req, res) {
	res.render('index', {
		host: process.env.CLIENT || 'http://localhost:8080'
	});
});

emitTop10 = function() {
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
};

// Initiate the mongo connection
Util.mongoConnect(function(err, connection) {
	if (err) {
		tracer.error(err);
		tracer.warn('Mongo DB connection failed, no game results will be recorded.');
		return;
	}
	db = connection;
});

// Stat channel (for scoreboard)
server.listen(parseInt(process.env.PORT) || 8080);
stats = io
	.of('/stats')
	.on('connection', function() {
		emitTop10();
		// Get the player list and transmit
		stats.emit('playerRefresh', players.list());
	});

// Setup player collection listener
players.onCollectionUpdate(function(playerCollection) {
	stats.emit('playerRefresh', playerCollection.list());
});

// Node defender main channel
defender = io
	.of('/defender')
	.authorization(function(handshake, callback) {
		if (typeof handshake.query.username === 'undefined' && handshake.query.username.length > 0) {
			tracer.info('Username required for authorization.');
			return callback('unauthorized', false);
		} else if (players.byName(handshake.query.username)) {
			tracer.info('Username already registered playing a session.');
			return callback('unauthorized', false);
		}
		return callback(null, true);
	})
	.on('connection', function(socket) {
		var player = new Player(socket.handshake.query.username),
			game = new Game();
		players.add(player);

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
			game.recordGame(db, player, function (err) {
				if (err) {
					tracer.error(err);
					tracer.warn('Player stats not saved.');
					return;
				}

				emitTop10();
			});
		});

		// Welcome message
		socket.emit('handshake', {
			'message': 'Welcome ' + player.name() + '. prepare to be attacked!'
		});

		// Recieve action commands from the player
		socket.on('action', function(data) {
			var playerAttacks, enemyActions, enemy;

			// Process player action first, then mob action and spawning
			player.attackMode(data.attack_mode);
			enemy = game.getEnemyById(data.target);
			if (enemy){
				playerAttacks = player.attackEnemy(enemy.enemy, enemy.collection);
			}

			enemyActions = game.processEnemyActions(player);

			game.setupRound();

			// Add a delay to not make the game instant
			setTimeout(function() {
				socket.emit('round', {
					player: player.info(),
					round: game.getRound(),
					attacks : playerAttacks,
					enemyActions : enemyActions,
					summary: game.summary(),
					mobs: game.getEnemies()
				});
			}, process.env.DELAY || 1000);
		});

		socket.on('disconnect', function() {
			players.remove(player.name());
		});

		// Initial round
		game.spawnEnemies();
		socket.emit('round', {
			player: player.info(),
			round: game.getRound(),
			attacks : null,
			enemyActions : null,
			summary: game.summary(),
			mobs: game.getEnemies()
		});
	});
