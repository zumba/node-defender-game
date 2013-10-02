var events = require('events');

var config = require('../config/player.json');

module.exports = (function() {

	var _baseHP = config.baseHP;

	function Player(username) {
		this._emitter = new events.EventEmitter();
		this._hp = _baseHP;
		this._username = username;
	}

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

	/**
	 * Adds a callback to an event.
	 *
	 * @param String e
	 * @param Function callback
	 * @return void
	 */
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

	/**
	 * Returns the player's current health
	 *
	 * @param void
	 * @return Number
	 */
	Player.prototype.health = function() {
		return this._hp;
	};

	/**
	 * Returns info about the Player
	 *
	 * @param void
	 * @return Object
	 */
	Player.prototype.info = function() {
		return {
			name: this._username,
			health: this._hp
		};
	};

	return Player;
}());