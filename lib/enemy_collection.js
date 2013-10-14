var events = require('events');

var _ = require('underscore');

var Enemy = require('./enemy');

var EnemyCollection = (function() {

	function EnemyCollection(factorySequence) {
		this.collection = [];
		this._id = factorySequence;
		this._emitter = new events.EventEmitter();
	}

	EnemyCollection.prototype.add = function(enemy) {
		if (!enemy instanceof Enemy) {
			return;
		}
		enemy.on('death', _.bind(function(enemy) {
			this.remove(enemy._id);
		}, this));
		this.collection.push(enemy);
	};

	EnemyCollection.prototype.remove = function(id) {
		this.collection = _.reject(this.collection, function(enemy) {
			return enemy._id === id;
		});
		if (this.collection.length === 0) {
			this._emitter.emit('lastWaveEnemy', this);
		}
	};

	EnemyCollection.prototype.isEmpty = function() {
		return this.collection.length === 0;
	};

	EnemyCollection.prototype.byId = function(id) {
		return _.find(this.collection, function(enemy) {
			return enemy._id === id;
		});
	};

	EnemyCollection.prototype.getAll = function() {
		return this.collection;
	};

	EnemyCollection.prototype.getPosition = function(id){
		return this.byId(id).getPosition();
	};

	EnemyCollection.prototype.getRandom = function() {
		return _.sample(this.collection);
	};

	EnemyCollection.prototype.summary = function() {
		var summary = {};
		_.each(this.collection, function(enemy) {
			if (typeof summary[enemy.type] === 'undefined') {
				summary[enemy.type] = 1;
			} else {
				summary[enemy.type] += 1;
			}
		});
		return summary;
	};

	EnemyCollection.prototype.list = function() {
		var list = [];
		_.each(this.collection, function(enemy) {
			list.push(enemy.describe());
		});
		return list;
	};

	/**
	 * Loops over the enemies and collects information on enemy actions.
	 *
	 * Yields the player object to the enemies so that it can be inspected and/or attacked
	 * by the enemy objects.
	 *
	 * Stops processing if the player dies
	 *
	 * @param Player player
	 * @return Array
	 */
	EnemyCollection.prototype.massAction = function(player) {
		var actions, i, length, collection;

		actions = [];
		collection = this.collection;
		length = collection.length;
		for (i = 0; i <= length; i++){
			if (collection[i]){
				actions.push.apply(actions, collection[i].processLogic(player));
			}
			if (player.isDead()){
				break;
			}
		}

		return actions;
	};

	// @deprecated
	EnemyCollection.prototype.massAttack = function(options) {
		var totalDamage = 0;
		_.each(this.collection, function(enemy) {
			totalDamage += enemy.attack(options);
		});

		return totalDamage;
	};

	EnemyCollection.prototype.onLastWaveEnemy = function(callback) {
		this._emitter.on('lastWaveEnemy', callback);
	};

	return EnemyCollection;

}());

module.exports = EnemyCollection;
