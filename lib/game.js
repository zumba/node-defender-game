var _ = require('underscore');

var MobRepo = require('./mob_repository');
var Enemy = require('./enemy');
var EnemyCollection = require('./enemy_collection');
var Util = require('./util');

var Game = (function() {

	var _mobTypes = ['range', 'melee'];
	var _wavePoint = 6; // Wave trigger round mod

	function Game() {
		this.round = 1;
		this.enemyCollection = new EnemyCollection();
	}

	Game.prototype.getRound = function() {
		return this.round;
	};

	Game.prototype.setupRound = function() {
		if (this.enemyCollection.isEmpty() || this.round % _wavePoint === 0) {
			this.spawnEnemies();
		}
		this.round++;
	};

	Game.prototype.getEnemies = function() {
		return this.enemyCollection.list();
	};

	Game.prototype.spawnEnemies = function() {
		_.each(_mobTypes, function(type) {
			var spawnCount = Math.ceil(MobRepo[type].spawnFactor * this.round);
			for (var i = 0; i < spawnCount; i++) {
				if (i >= MobRepo[type].maxSpawn) {
					break;
				}
				this.enemyCollection.add(new Enemy(type, this.round));
			}
		}, this);
	}

	Game.prototype.attackEnemy = function(enemyId, weapon) {
		var enemy, playerDamage;
		enemy = this.enemyCollection.byId(enemyId);
		if (!enemy) {
			return;
		}
		// @todo flesh out the damage generator
		playerDamage = 4;
		enemy.damage(playerDamage);

		return playerDamage;
	}

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
