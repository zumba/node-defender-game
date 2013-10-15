var config = require('../config/attack_modes');
var game = require('../config/game');
var _ = require('underscore');
var Util = require('./util');
module.exports = (function(){
	var AttackMode = function(type){
		this.type = type;
		this.config = config[type];
	};

	var getAttack, collateralIterator;

	/**
	 * Returns an array of damage objects
	 *
	 * @param Number targetId
	 * @param Array collections [EnemyCollection, EnemyCollection]
	 * @return Array [{ enemyId : Number, damage : Number }, ...]
	 */
	AttackMode.prototype.attack = function(targetId, collections){
		var attacks, rate, attack, type, collection;

		attacks = [];
		collection = _.find(collections, function(wave){ return !!wave.byId(targetId); });
		if (collection.isEmpty()){
			return attacks;
		}
		rate = this.config.rate;
		type = this.type;
		while(rate--){
			attack = getAttack.call(this, targetId, collection);
			attacks.push(attack); // store for reporting

			// apply damage to enemy
			collection.byId(attack.enemyId).damage(attack.damage, type);

			// handle collateral damage`
			if(type === 'CollateralDamage'){
				collections.forEach(collateralIterator(attack, type, attacks));
			}
			if (collection.isEmpty()){
				break;
			}

			// update target id, so we don't keep picking random enemies
			// if one dies mid-attack
			targetId = attack.enemyId;
		}
		return attacks;
	};

	AttackMode.prototype.get = function(key){
		var value = this.config[key];

		// avoid exposing the original array, since it would be passed by reference.
		return value instanceof Array ? value.slice(0) : value;
	};

	collateralIterator = function(attack, type, attacks){
		var enemyId = attack.enemyId;
		var position = attack.position;
		return function(wave){
			wave.getAll().forEach(function(enemy){
				if(enemy._id !== enemyId && enemy.position === position){
					attacks.push({
						enemyId : enemyId,
						damage : game.collateralDamage,
						position : position
					});
					enemy.damage(game.collateralDamage, type);
				}
			});
		};
	};

	/**
	 * Returns a single attack
	 *
	 * @access private
	 * @param Number targetId
	 * @param EnemyCollection collection
	 * @return Object
	 */
	getAttack = function(targetId, collection){
		var config, enemy, position, damage, range, falloff, enemyId;

		config = this.config;
		damage = Util.randomRange.apply(Util, config.damage);

		enemy = collection.byId(targetId) || collection.getRandom();
		enemyId = enemy._id;

		position = collection.getPosition(enemyId);
		range = config.range;
		falloff = config.falloff;

		while(position > range){
			position--;
			damage *= falloff;
		}
		damage = Math.ceil(damage);

		return { 
			enemyId: enemyId,
			damage: damage,
			effectiveDamage: damage > enemy.hp ? enemy.hp : damage,
			position: position
		};
	};
	return AttackMode;
}());
