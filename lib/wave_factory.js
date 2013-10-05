var _ = require('underscore');
var EnemyCollection = require('./enemy_collection');
var Enemy = require('./enemy');
var mobs = require('../config/mobs');
var groups = require('../config/groups');
var waves = require('../config/waves');

module.exports = (function(){

	var getRoundCappedMobs, getMobs;

	/**
	 * Wave Factory
	 *
	 * Generates increasingly difficult waves of mobs
	 */
	var WaveFactory = function WaveFactory() {
		this._id = 1;
	};

	/**
	 * Returns an EnemyCollection full of increasingly more difficult mob groups
	 *
	 * @access public
	 * @param Number round
	 * @return EnemyCollection
	 */
	WaveFactory.prototype.get = function(round){
		var collection, waveLevel;

		round = round || 1;
		waveLevel = Math.min(this._id, waves.length) - 1;

		collection = new EnemyCollection(this._id++);

		// for each groupType in this wave level
		_.each(waves[waveLevel], function(groupType){
			// for each mobType in a random group from the wave
			_.each(_.sample(groups[groupType]), function(mobType){
				collection.add(new Enemy(mobType, round));
			});
		});
		return collection;
	};

	/**
	 * Return a selection of mobs from the list
	 *
	 * @param Object available
	 * @return Array
	 */
	getMobs = function(wave){
		var mobs = [];
		_.each(wave, function(groupType){
			mobs = _.sample(groups[groupType]);
		});
		return mobs;
	};

	/**
	 * Returns a mobs filtered by mobs available in the current round
	 *
	 * @return Object
	 * @deprecated
	 */
	getRoundCappedMobs = function(round){
		var repo = {};
		_.each(mobs, function(data, type){
			if (data.round <= round){
				repo[type] = _.extend({}, data);
			}
		});
		return repo;
	};

	return WaveFactory;
}());
