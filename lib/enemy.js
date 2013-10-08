var _ = require('underscore');
var events = require('events');
var mobs = require('../config/mobs');
var Util = require('./util');
var config = require('../config/game');

module.exports = (function() {
	var resolveBehaviors;

	// Sequential static ID for uniqueness
	var _id = 1;

	var Enemy = function Enemy(type, initialRound) {
		var base;

		this._id = _id++;
		this._base = base = mobs[type];
		this._emitter = new events.EventEmitter();

		this.type = type;
		this.initialRound = initialRound;
		this.hp = Util.randomRange.apply(Util, this._base.health);
		this.position = _.sample(base.startPositions);
		this.behaviors = resolveBehaviors(base.behaviors);
	};

	/**
	 * Performs an attack on the player object.
	 *
	 * @param Player player
	 * @return Number|Boolean
	 */
	Enemy.prototype.attack = function(player) {
		var damage = false, position;
		if (this.canAttack()){
			damage = Util.randomRange.apply(Util, this._base.damage);
			if (this.is('ranged')){
				damage = damage * config.rangeDamageMod;
			}
			if (this.is('ranged-boost')){
				position = this.position;
				while(position !== 0) {
					damage *= config.rangedBoostMod;
					position--;
				}
			}
			damage = Math.ceil(damage * player.getDefenseMod());

			player.damage(damage);
		}
		return damage;
	};

	Enemy.prototype.canAttack = function(){
		var isRanged = this.is('ranged');
		var position = this.position;
		return position === 0 || (position !== 0 && isRanged);
	};

	Enemy.prototype.damage = function(amount, type) {
		if (this.is('armored') && type !== 'PowerAttack'){
			amount = Math.ceil(amount / 2);
		}
		this.hp -= amount;
		if (this.hp <= 0) {
			this._emitter.emit('death', this);
		}
	};

	Enemy.prototype.describe = function() {
		return {
			id: this._id,
			type: this.type,
			hitpoints: this.hp,
			initialRound: this.initialRound
		};
	};

	Enemy.prototype.getPosition = function(){
		return this.position;
	};

	Enemy.prototype.is = function(thing){
		var things = this.behaviors.slice(0);

		things.push(this.type);
		return _.contains(things, thing);
	};

	/**
	 * Perform move logic
	 *
	 * @return Object|Boolean
	 */
	Enemy.prototype.move = function(){
		var result = false;
		var position = this.position;
		if (this.is('melee') && position > 0){
			this.position--;
		} else if (this.is('ranged-boost') && position < 5){
			this.position++;
		}
		if (position !== this.position){
			result = {
				id : this._id,
				type : 'move',
				position : this.position
			};
		}
		return result;
	};

	Enemy.prototype.on = function(e, callback) {
		this._emitter.on(e, callback);
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

	resolveBehaviors = function(template){
		var behaviors = [];
		_.each(template, function(behavior){
			behaviors.push(behavior instanceof Array ? _.sample(behavior) : behavior);
		});
		return behaviors;
	};

	return Enemy;

}());
