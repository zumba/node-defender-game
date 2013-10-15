var events = require('events');
var _ = require('underscore');
var config = require('../config/player');
var AttackMode = require('./attack_mode');

module.exports = (function() {

	var _baseHP = config.baseHP;

	function Player(username) {
		this._emitter = new events.EventEmitter();
		this._hp = _baseHP;
		this._username = username;
		this._attack_mode = config.defaultAttackMode;
		this._kills = 0;
	}

	/**
	 * Attack Modes
	 *
	 * @static
	 * @access public
	 * @type Object
	 */
	Player.attack_modes = {
		power : new AttackMode('PowerAttack'),
		rapid : new AttackMode('RapidFire'),
		ranged : new AttackMode('RangedAttack'),
		collateral : new AttackMode('CollateralDamage'),
		defensive : new AttackMode('Defensive')
	};

	/**
	 * Uses the current attack mode to try to hit an enemy
	 *
	 * @param Enemy enemy
	 * @param Array collections [EnemyCollection, ...]
	 * @return Number
	 */
	Player.prototype.attackEnemy = function(enemy, collections) {
		return Player.attack_modes[this._attack_mode].attack(enemy._id, collections);
	};

	/**
	 * Set the attack mode.
	 *
	 * @param string mode
	 * @return void
	 */
	Player.prototype.attackMode = function(mode) {
		if (!_.contains(_.keys(Player.attack_modes), mode)) {
			return;
		}
		this._attack_mode = mode;
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
		if (this.isDead()) {
			this._emitter.emit('death', this);
		}
	};

	/**
	 * Returns the current attack mode's defense modifier.
	 *
	 * @return {[type]}
	 */
	Player.prototype.getDefenseMod = function(){
		return Player.attack_modes[this._attack_mode].get('defenseMod');
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
	 * Check if the player is dead
	 *
	 * @return boolean
	 */
	Player.prototype.isDead = function() {
		return this.health() <= 0;
	};

	/**
	 * Check if the player is alive
	 *
	 * @return boolean
	 */
	Player.prototype.isAlive = function() {
		return !this.isDead();
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
			health: this._hp,
			kills: this._kills
		};
	};

	Player.prototype.handleKill = function() {
		this._kills++;
	};

	Player.prototype.kills = function() {
		return this._kills;
	};

	return Player;
}());
