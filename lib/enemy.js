var events = require('events');

var MobRepo = require('./mob_repository');
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

	Enemy.prototype.attack = function(/* options */) {
		//if (options.round && this.initialRound + this._base.attackRound > options.round) {
		//	return 0;
		//}
		return Util.randomRange.apply(Util, this._base.damage);
	};

	Enemy.prototype.damage = function(amount) {
		this.hp -= amount;
		if (this.hp <= 0) {
			this._emitter.emit('death', this);
		}
	};

	return Enemy;

}());
