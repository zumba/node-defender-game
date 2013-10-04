var events = require('events');

var MobRepo = require('../data/mobs');
var Util = require('./util');

module.exports = (function() {

	// Sequential static ID for uniqueness
	var _id = 1;

	function Enemy(type, initialRound) {
		this._id = _id++;
		this.type = type;
		this._base = MobRepo[this.type];
		this.initialRound = initialRound;
		this.hp = Util.randomRange.apply(Util, this._base.health);
		this._emitter = new events.EventEmitter();
		this.position = 3;
	}

	Enemy.prototype.describe = function() {
		return {
			id: this._id,
			type: this.type,
			hitpoints: this.hp,
			initialRound: this.initialRound
		};
	};

	Enemy.prototype.on = function(e, callback) {
		this._emitter.on(e, callback);
	};

	/**
	 * Performs an attack on the player object.
	 *
	 * @param Player player
	 * @return Number|Boolean
	 */
	Enemy.prototype.attack = function(player) {
		var damage = false;
		if (this.canAttack()){
			damage = Util.randomRange.apply(Util, this._base.damage);
			damage = Math.ceil(damage * player.getDefenseMod());

			player.damage(damage);
		}
		return damage;
	};

	Enemy.prototype.canAttack = function(){
		return true; // todo: check for range of enemy attacks (a.k.a. melee)
	};

	Enemy.prototype.damage = function(amount) {
		this.hp -= amount;
		if (this.hp <= 0) {
			this._emitter.emit('death', this);
		}
	};

	/**
	 * Move and/or attack the player.
	 *
	 *
	 * @return Array
	 */
	Enemy.prototype.processLogic = function(player){
		var actions = [], move, damage;

		move = this.move();
		if (move){
			actions.push(move);
		}

		damage = this.attack(player);
		if (damage !== false){ // might be int 0, so using strict check
			actions.push({
				id : this._id,
				type : 'attack',
				damage : damage
			});
		}

		return actions;
	};

	/**
	 * Perform move logic
	 *
	 * @return Object|Boolean
	 */
	Enemy.prototype.move = function(){
		var result = false;
		if (this.position > 0){
			this.position--;
			result = {
				id : this._id,
				type : 'move',
				position : this.position
			};
		}

		return result;
	};

	Enemy.prototype.getPosition = function(){
		return this.position;
	};

	return Enemy;

}());
