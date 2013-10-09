var events = require('events');

var _ = require('underscore');

var Player = require('./player');

module.exports = (function() {

	function PlayerCollection() {
		this.collection = [];
		this._emitter = new events.EventEmitter();
	}

	PlayerCollection.prototype.add = function(player) {
		if (!player instanceof Player) {
			return;
		}
		player.on('death', _.bind(function(player) {
			this.remove(player.name());
		}, this));
		this.collection.push(player);
		this._emitter.emit('collectionUpdate', this);
	};

	PlayerCollection.prototype.byName = function(name) {
		return _.find(this.collection, function(player) {
			return player.name() === name;
		});
	};

	PlayerCollection.prototype.list = function() {
		var list = [];
		_.each(this.collection, function(player) {
			list.push(player.name());
		});
		return list;
	};

	PlayerCollection.prototype.onCollectionUpdate = function(callback) {
		this._emitter.on('collectionUpdate', callback);
	};

	PlayerCollection.prototype.remove = function(username) {
		var countBefore = this.collection.length;
		this.collection = _.reject(this.collection, function(player) {
			return player.name() === username;
		});
		if (this.collection.length !== countBefore) {
			this._emitter.emit('collectionUpdate', this);
		}
	};

	return PlayerCollection;

}());
