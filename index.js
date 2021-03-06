/* globals process, __dirname */

// App Monitoring
require('newrelic');

// Modules
var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io').listen(server);
var tracer = require('tracer').colorConsole({
	level: process.env.LOGLEVEL || 'info'
});
var _ = require('underscore');
var RedisStore = require('socket.io/lib/stores/redis');
var redis = require('socket.io/node_modules/redis');
var async = require('async');

// Libraries
var PlayerCollection = require('./lib/player_collection');
var Player = require('./lib/player');
var Game = require('./lib/game');
var Util = require('./lib/util');
var Insulter = require('./lib/insulter');

// Local
var defender, db, stats, emitTop10, emitTopCategories, redisSocket;
var players = new PlayerCollection();

io.set('logger', {
	debug: tracer.debug,
	info: tracer.info,
	warn: tracer.warn,
	error: tracer.error
});
if (process.env.REDIS_HOST && process.env.REDIS_PORT) {
	redisSocket = {
		redis: redis,
		redisPub: redis.createClient(process.env.REDIS_PORT, process.env.REDIS_HOST),
		redisSub: redis.createClient(process.env.REDIS_PORT, process.env.REDIS_HOST),
		redisClient: redis.createClient(process.env.REDIS_PORT, process.env.REDIS_HOST)
	}
	if (process.env.REDIS_AUTH) {
		async.map(
			['redisPub', 'redisSub', 'redisClient'],
			_.bind(function(redisClient, callback) {
				redisSocket[redisClient].auth(process.env.REDIS_AUTH, callback);
			}, redisSocket),
			function(err) {
				if (err) {
					tracer.error('Redis unable to authenticate. Falling back to MemoryStore.');
					return;
				}
				io.set('store', new RedisStore(redisSocket));
			}
		);
	} else {
		io.set('store', new RedisStore(redisSocket));
	}
} else {
	tracer.warn('Redis socket.io store not engaged - Using MemoryStore.');
}

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
		host: process.env.CLIENT || 'http://localhost:8080',
		secure: !!process.env.SECURECLIENT
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

emitTopCategories = function() {
	Game.topCategoryList(db, function (err, results) {
		if (err) {
			tracer.error(err);
			tracer.warn('topCategories not transmitted.');
			return;
		}
		tracer.info({
			topCategories: results
		});
		stats.emit('topCategories', results);
	});
}

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
		emitTopCategories();
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
		}
		if (!/^[\w\-\(\) ]+$/.test(handshake.query.username)) {
			tracer.info('Invalid Username: invalid characters.');
			return callback('unauthorized', false);
		}
		if (handshake.query.username.length > 30) {
			tracer.info('Invalid Username: too long.');
			return callback('unauthorized', false);
		}
		if (players.byName(handshake.query.username)) {
			tracer.info('Username already registered playing a session.');
			return callback('unauthorized', false);
		}
		if (!!handshake.query.token && !!handshake.query.type) {
			handshake.player = new Player(handshake.query.username, handshake.query.token, handshake.query.secret);
			switch (handshake.query.type) {
				case 'twitter':
					handshake.player.validateTwitter(db, function(error, isValid) {
						if (error) {
							tracer.error(error);
							callback('unauthorized', false);
						}
						if (players.byName(handshake.player.name())) {
							tracer.info('Twitter user already registered playing a session.');
							return callback('unauthorized', false);
						}
						callback(isValid ? null : 'unauthorized', isValid);
					});
					break;
				case 'github':
					handshake.player.validateGithub(db, function(error, isValid) {
						if (error) {
							tracer.error(error);
							return callback('unauthorized', false);
						}
						if (players.byName(handshake.player.name())) {
							tracer.info('Github user already registered playing a session.');
							return callback('unauthorized', false);
						}
						callback(isValid ? null : 'unauthorized', isValid);
					});
			}
			return;
		}
		tracer.info('Authorizing anonymous player.');
		handshake.player = new Player(handshake.query.username);
		return callback(null, true);
	})
	.on('connection', function(socket) {
		var player = socket.handshake.player,
			game = new Game(player),
			gameEnded = false,
			roundResponseTimeout;
		players.add(player);

		// Handle the player's demise
		player.on('death', function(player) {
			// Stop the rounds
			clearTimeout(roundResponseTimeout);
			gameEnded = true;

			// Notify client of final player stats
			socket.emit('death', {
				'message': player.name().toUpperCase() + ' IS NOT IN MY BASE, KILLING MY DUDES ANYMORE.',
				'stats': _.extend(player.info(), {score: game.calculateScore()})
			});

			// Notify channel of player demise
			socket.broadcast.emit('mandown', {
				'message': player.name().toUpperCase() + ' IS SWIMMING WITH DA\' FISHES.'
			});

			// Kick the client
			socket.emit('disconnect', {});

			// Record player stats to DB
			game.recordGame(db, function (err) {
				if (err) {
					tracer.error(err);
					tracer.warn('Player stats not saved.');
					return;
				}

				emitTop10();
				emitTopCategories();
			});
		});

		// Welcome message
		socket.emit('handshake', {
			'message': 'Welcome ' + player.name() + '. prepare to be attacked!'
		});

		// Recieve action commands from the player
		socket.on('action', function(data) {
			var playerAttacks, enemyActions, enemy;
			if (gameEnded || !game.validateRoundToken(data.roundToken)) {
				return;
			}
			game.consumeRoundToken(data.roundToken);

			// Process player action first, then mob action and spawning
			player.attackMode(data.attack_mode);
			enemy = game.getEnemyById(data.target) || game.getRandomEnemy();
			if (enemy){
				playerAttacks = player.attackEnemy(enemy.enemy, game.waves);
			}

			enemyActions = game.processEnemyActions(player);

			game.setupRound();

			// Add a delay to not make the game instant
			roundResponseTimeout = setTimeout(function() {
				socket.emit('round', {
					player: player.info(),
					insult: Insulter.getAny(),
					round: game.getRound(),
					roundToken: game.getRoundToken(),
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
			insult: null,
			round: game.getRound(),
			roundToken: game.getRoundToken(),
			attacks : null,
			enemyActions : null,
			summary: game.summary(),
			mobs: game.getEnemies()
		});
	});
