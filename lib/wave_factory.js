var _ = require('underscore');
var EnemyCollection = require('./enemy_collection');
var Enemy = require('./enemy');
var MobRepo = require('../data/mobs');

module.exports = (function(){

	var getRoundCappedMobs, getMobs;

	/**
	 * Wave Factory
	 *
	 * Generates increasingly difficult waves of mobs
	 */
	var WaveFactory = function WaveFactory() {
		this.power = 4;
		this.factorySequence = 1;
	};

	/**
	 * Returns an EnemyCollection full of increasingly more difficult mob groups
	 *
	 * Uses the round parameter to ensure complex enemies do not arrive too early
	 *
	 * @access public
	 * @param Number round
	 * @return EnemyCollection
	 */
	WaveFactory.prototype.get = function(round){
		var collection, availableMobs, resolvedMobs;

		collection = new EnemyCollection(this.factorySequence++);
		round = round || 0;
		availableMobs = getRoundCappedMobs(round);
		resolvedMobs = getMobs.call(this, availableMobs);

		_.each(resolvedMobs, function(mobData){
			collection.add(new Enemy(mobData.type, round));
		});

		this.power += 2;
		return collection;
	};

	/**
	 * Return a selection of mobs from those provided that fit within the power level
	 *
	 * @param Object available
	 * @return Array
	 */
	getMobs = function(available){
		var total, power, mob, mobs, types, type;

		total = 0;
		power = this.power;
		mobs = [];
		types = _.keys(available);
		while(total < power){
			type = _.sample(types);
			mob = available[type];
			mobs.push({
				type : type,
				data : mob
			});
			total += mob.power;
		}
		return mobs;
	};

	/**
	 * Returns a MobRepo filtered by mobs available in the current round
	 *
	 * @return Object
	 */
	getRoundCappedMobs = function(round){
		var repo = {};
		_.each(MobRepo, function(data, type){
			if (data.round <= round){
				repo[type] = _.extend({}, data);
			}
		});
		return repo;
	};

	return WaveFactory;
}());
