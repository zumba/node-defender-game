var config = require('../config/attack_modes');
var Util = require('./util');
module.exports = (function(){
	var AttackMode = function(type){
		this.config = config[type];
	};

	var getAttack;

	/**
	 * Returns an array of damage objects
	 *
	 * @param Number targetId
	 * @param EnemyCollection collection
	 * @return Array [{ enemyId : Number, damage : Number }, ...]
	 */
	AttackMode.prototype.attack = function(targetId, collection){
		var attacks, rate, attack;

		attacks = [];
		if (collection.isEmpty()){
			return attacks;
		}
		rate = this.config.rate;
		while(rate--){
			attack = getAttack.call(this, targetId, collection);
			attacks.push(attack); // store for reporting

			// apply damage to enemy
			collection.byId(attack.enemyId).damage(attack.damage);
			if (collection.isEmpty()){
				break;
			}

			// update target id, so we don't keep picking random enemies
			// if one dies mid-attack
			targetId = attack.enemyId;
		}
		return attacks;
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

		return { enemyId : enemyId, damage : damage };
	};
	return AttackMode;
}());