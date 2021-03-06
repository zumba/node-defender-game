var events = require('events');
var _ = require('underscore');
var config = require('../config/player');
var AttackMode = require('./attack_mode');
var TwitterOAuth = require('./twitter_oauth');
var GithubOAuth = require('./github_oauth');

module.exports = (function() {

	var _baseHP = config.baseHP;

	function Player(username, token, secret) {
		this._emitter = new events.EventEmitter();
		this._hp = _baseHP;
		this._username = username;
		this._attack_mode = config.defaultAttackMode;
		this._kills = this._damage = this._waveClears = 0;
		this._profile = {};
		if (!!token) {
			this._token = token;
		}
		if (!!secret) {
			this._secret = secret;
		}
	}

	Player.prototype.validateTwitter = function(db, callback) {
		if (!db) {
			TwitterOAuth.get(this, _.bind(function(error, user) {
				if (error) {
					callback(error);
					return;
				}
				this.name(user.screen_name);
				this._profile = user;
				callback(null, true);
			}, this));
			return;
		}
		db.collection('users').findOne({token: this._token, secret: this._secret}, _.bind(function(error, result) {
			if (error) {
				callback(error);
				return;
			}
			if (!result) {
				// Retrieve from twitter
				TwitterOAuth.get(this, _.bind(function(error, user) {
					if (error) {
						callback(error);
						return;
					}
					this.name(user.screen_name);
					this._profile = user;
					// Cache the user
					this.save(db);
				}, this));
			} else {
				this.name(result.profile.screen_name);
				this._profile = result.profile;
			}
			callback(null, true);
		}, this));
	};

	Player.prototype.validateGithub = function(db, callback) {
		var ghClient;
		ghClient = new GithubOAuth(this._token);
		if (!db) {
			ghClient.getUser(_.bind(function(error, user) {
				if (error) {
					return callback(error);
				}
				this.name(user.screen_name);
				this._profile = user;
				callback(null, true);
			}), this);
			return;
		}
		db.collection('users').findOne({token: this._token}, _.bind(function(error, result) {
			if (error) {
				return callback(error);
			}
			if (!result) {
				ghClient.getUser(_.bind(function(error, user) {
					if (error) {
						return callback(error);
					}
					this.name(user.screen_name);
					this._profile = user;
					this.save(db, function() {});
				}, this));
			} else {
				this.name(result.profile.screen_name);
				this._profile = result.profile;
			}
			callback(null, true);
		}, this));
	};

	Player.prototype.save = function(db, callback) {
		db.collection('users').insert({
			username: this.name(),
			token: this._token,
			secret: this._secret,
			profile: this._profile
		}, function(error, result) {
			if (error) {
				callback(error);
				return;
			}
			callback(null, result);
		});
	};

	/**
	 * Uses the current attack mode to try to hit an enemy
	 *
	 * @param Enemy enemy
	 * @param Array collections [EnemyCollection, ...]
	 * @return array
	 */
	Player.prototype.attackEnemy = function(enemy, collections) {
		var attacks;
		// Record effective damage
		attacks = AttackMode.getModes()[this._attack_mode].attack(enemy._id, collections);
		this._damage += _.reduce(attacks, function(memo, attack) {
			return memo + attack.effectiveDamage;
		}, 0);

		return attacks;
	};

	/**
	 * Set the attack mode.
	 *
	 * @param string mode
	 * @return void
	 */
	Player.prototype.attackMode = function(mode) {
		if (!_.contains(_.keys(AttackMode.getModes()), mode)) {
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
		return (this._token ? '@' : '') + this._username;
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
	 * Get the amount of effective damage the player has done.
	 *
	 * @return Number
	 */
	Player.prototype.effectiveDamage = function() {
		return this._damage;
	};

	/**
	 * Returns the current attack mode's defense modifier.
	 *
	 * @return Number
	 */
	Player.prototype.getDefenseMod = function(){
		return AttackMode.getModes()[this._attack_mode].get('defenseMod');
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
			name: this.name(),
			profile: this._profile,
			health: this._hp,
			kills: this._kills,
			damage: this._damage,
			waveClears: this._waveClears
		};
	};

	Player.prototype.handleKill = function() {
		this._kills++;
	};

	Player.prototype.kills = function() {
		return this._kills;
	};

	Player.prototype.waveCleared = function() {
		this._waveClears++;
	};

	Player.prototype.wavesCleared = function() {
		return this._waveClears;
	};

	return Player;
}());
