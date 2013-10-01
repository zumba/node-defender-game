var _ = require('underscore');

var MobRepo = require('./mob_repository');
//var Enemy = require('./enemy');
//var EnemyCollection = require('./enemy_collection');
var WaveFactory = require('./wave_factory');
//var Util = require('./util');

var Game = (function() {

	var wavesEmpty, onLastWaveEnemy;
	var _mobTypes = _.keys(MobRepo);
	var _wavePoint = 6; // Wave trigger round mod

	function Game() {
		this.round = 1;
		this.waves = [];
		this.waveFactory = new WaveFactory();
	}

	Game.prototype.getRound = function() {
		return this.round;
	};

	Game.prototype.setupRound = function() {
		if (this.waves.length === 0 || this.round % _wavePoint === 0) {
			this.spawnEnemies();
		}
		this.round++;
	};

	Game.prototype.getEnemies = function() {
		var list = [];
		_.each(this.waves, function(enemyCollection){
			list.push(enemyCollection.list());
		});
		return _.flatten(list);
	};

	Game.prototype.spawnEnemies = function() {
		// var collection;

		// collection = new EnemyCollection();
		var wave = this.waveFactory.get(this.round);
		wave.onLastWaveEnemy(_.bind(onLastWaveEnemy, this));
		this.waves.push(wave);
		/*_.each(_mobTypes, function(type) {
			var spawnCount = Math.ceil(MobRepo[type].spawnFactor * this.round);
			for (var i = 0; i < spawnCount; i++) {
				if (i >= MobRepo[type].maxSpawn) {
					break;
				}
				collection.add(new Enemy(type, this.round));
			}
		}, this);*/
	};

	Game.prototype.attackEnemy = function(enemyId) {
		var enemy, playerDamage;
		enemy = this.getEnemyById(enemyId);
		if (!enemy) {
			return;
		}
		// @todo flesh out the damage generator
		playerDamage = 4;
		enemy.damage(playerDamage);

		return playerDamage;
	};

	Game.prototype.getEnemyAttackDamage = function() {
		var damage = 0;
		_.each(this.waves, function(collection){
			damage += collection.massAttack();
		});
		return damage;
	};

	Game.prototype.getEnemyById = function(id) {
		var waves, length, i, enemy;
		waves = this.waves;
		length = waves.length;
		for (i = 0; i <= length; i++){
			enemy = waves[i].byId(id);
			if (enemy) {
				break;
			}
		}
		return enemy;
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

	Game.prototype.recordGame = function(callback) {
		// Record game stats to storage and trigger callback
		callback(this);
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
