var _ = require('underscore');
var config = require('../config/game');
var scoring = require('../config/scoring');
var MobRepo = require('../config/mobs');
var WaveFactory = require('./wave_factory');

var Game = (function() {

	var onLastWaveEnemy;
	var _mobTypes = _.keys(MobRepo);

	var _waveInterval = config.waveInterval; // Wave trigger round mod

	function Game(player) {
		this.waveTimer = 1;
		this.round = 1;
		this.waves = [];
		this.player = player;
		this.waveFactory = new WaveFactory();
	}

	Game.prototype.getRound = function() {
		return this.round;
	};

	Game.prototype.setupRound = function() {
		var clear = this.waves.length === 0;
		if (clear || this.waveTimer % _waveInterval === 0) {
			if (clear) {
				this.player.waveCleared();
			}
			this.spawnEnemies();
			this.waveTimer = 0;
		}
		this.round++;
		this.waveTimer++;
	};

	Game.prototype.getEnemies = function() {
		var list = [];
		_.each(this.waves, function(enemyCollection){
			list.push(enemyCollection.list());
		});
		return _.flatten(list);
	};

	Game.prototype.spawnEnemies = function() {
		var wave = this.waveFactory.get(this.round);
		wave.onLastWaveEnemy(_.bind(onLastWaveEnemy, this));
		wave.onEnemyDeath(_.bind(this.player.handleKill, this.player));
		this.waves.push(wave);
	};

	/**
	 * Loops over the waves and collects information on enemy actions.
	 *
	 * Yields the player object to the enemies so that it can be inspected and/or attacked
	 * by the enemy objects.
	 *
	 * Stops processing if the player dies
	 *
	 * @param Player player
	 * @return Array
	 */
	Game.prototype.processEnemyActions = function(player){
		var waves, length, i, result;

		waves = this.waves;
		length = waves.length;
		result = [];
		for (i = 0; i <= length; i++){
			if (waves[i]){
				result.push.apply(result, waves[i].massAction(player));
			}
			if (player.isDead()){
				break;
			}
		}

		return result;
	};

	Game.prototype.getEnemyById = function(id) {
		var i, enemy, result;
		for (i = 0; i < this.waves.length; i++) {
			enemy = this.waves[i].byId(id);
			if (enemy) {
				result = {
					enemy : enemy,
					collection : this.waves[i]
				};
				break;
			}
		}
		return result;
	};

	Game.prototype.summary = function() {
		var summary = [];
		_.each(this.waves, function(collection){
			summary.push({
				wave : collection._id,
				enemies : collection.summary()
			});
		});
		return summary;
	};

	Game.prototype.recordGame = function(db, callback) {
		var resultsCollection, data;
		if (!db) {
			callback('No Mongo connection available.', this);
			return;
		}
		resultsCollection = db.collection('results');
		data = _.extend(
			{round: this.round},
			this.player.info(),
			{score: this.calculateScore()});
		resultsCollection.insert(data, _.bind(function(err) {
			callback(err, this);
		}, this));
	};

	Game.prototype.calculateScore = function() {
		return this.player.kills() * scoring.kill +
			this.player.effectiveDamage() * scoring.damage +
			this.round * scoring.round +
			this.player.wavesCleared() * scoring.waveCleared;
	};

	/**
	 * Retrieve the (up to) top 10 scores.
	 *
	 * @param MongoClient db
	 * @param function callback
	 * @return void
	 */
	Game.topScoreList = function(db, callback) {
		if (!db) {
			callback('DB not available.');
			return;
		}
		db.collection('results').aggregate([
			{ $sort: {score: -1} },
			{ $group: { _id: "$name", score: { $first: "$score" } } },
			{ $sort: {score: -1}}, {$limit: 10}
		], function(err, result) {
			var results = [];
			if (err) {
				callback(err, []);
			}
			_.each(result, function(entry) {
				results.push({
					username: entry._id,
					score: entry.score
				});
			});
			callback(null, results);
		});
	};

	/**
	 * Listener for when the last enemy is removed from a wave's enemy collection.
	 *
	 * @access private
	 * @param EnemyCollection collection
	 * @return void
	 */
	onLastWaveEnemy = function(collection) {
		this.waves = _.reject(this.waves, function (wave) {
			return wave._id === collection._id;
		});
	};

	return Game;

}());

module.exports = Game;
