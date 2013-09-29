var _ = require('underscore');

var Enemy = require('./enemy');

var EnemyCollection = (function() {

	function EnemyCollection() {
		this.collection = [];
	}

	EnemyCollection.prototype.add = function(enemy) {
		if (!enemy instanceof Enemy) {
			return;
		}
		this.collection.push(enemy);
	};

	EnemyCollection.prototype.remove = function(id) {
		this.collection = _.reject(this.collection, function(enemy) {
			return enemy._id === id;
		});
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

	EnemyCollection.prototype.massAttack = function(options) {
		var totalDamage = 0;
		_.each(this.collection, function(enemy) {
			totalDamage += enemy.attack(options);
		});

		return totalDamage;
	};

	return EnemyCollection;

}());

module.exports = EnemyCollection;
