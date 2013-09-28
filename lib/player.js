var events = require('events');

var Player = (function() {

	var _baseHP = 100;

	function onDeath(player) {
		// record player statistics in mongo.
	};

	function Player(username) {
		this._emitter = new events.EventEmitter();
		this._hp = _baseHP;
		this._username = username;
		// Register an internal death listener
		this._emitter.on('death', onDeath);
	};

	/**
	 * Sets and gets the player's username.
	 *
	 * @param string username
	 * @return string
	 */
	Player.prototype.name = function(username) {
		username = username || null;
		if (username !== null) {
			this._username = username;
		}
		return this._username;
	};

	Player.prototype.on = function(e, callback) {
		this._emitter.on(e, callback);
	};

	/**
	 * Diminishes a player's HP by an amount.
	 *
	 * @param integer amount
	 * @return void
	 */
	Player.prototype.damage = function(amount) {
		this._hp -= amount;
		if (this._hp <= 0) {
			this._emitter.emit('death', this);
		}
	};

	Player.prototype.health = function() {
		return this._hp;
	};

	Player.prototype.info = function() {
		return {
			name: this._username,
			health: this._hp
		}
	};

	return Player;
}());

module.exports = Player;
