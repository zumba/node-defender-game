var _ = require('underscore');

var MobRepo = require('./mob_repository');
var Enemy = require('./enemy');
var EnemyCollection = require('./enemy_collection');

var Game = (function() {

	var _mobTypes = ['range', 'melee'];
	var _wavePoint = 4; // Every fourth round should be a new wave

	function Game() {
		this.round = 1;
		this.enemyCollection = new EnemyCollection();
	}

	Game.prototype.getRound = function() {
		return this.round;
	};

	Game.prototype.setupRound = function() {
		if (this.enemyCollection.isEmpty() || this.round % _wavePoint === 0) {
			_.each(_mobTypes, function(type) {
				for (var i = 0; i < Math.ceil(MobRepo[type].spawnFactor * this.round); i++) {
					this.enemyCollection.add(new Enemy(type, this.round));
				}
			}, this);
		}
		this.round++;
	};

	Game.prototype.getEnemies = function() {
		return this.enemyCollection.list();
	};

	Game.prototype.getEnemyAttackDamage = function() {
		return this.enemyCollection.massAttack({
			round: this.round
		});
	}

	Game.prototype.summary = function() {
		return {
			enemies: this.enemyCollection.summary()
		};
	};

	Game.prototype.recordGame = function(callback) {
		// Record game stats to storage and trigger callback
		callback(this);
	};

	return Game;

}());

module.exports = Game;
