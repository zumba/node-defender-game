module.exports = (function() {

	// Sequential static ID for uniqueness
	var _id = 1;

	function randomRange(min, max) {
		return Math.ceil((max - min + 1) * Math.random());
	}

	function Enemy(type, initialRound) {
		this._id = _id++;
		this.type = type;
		this._base = MobRepo[this.type];
		this.initialRound = initialRound;
		this.hp = randomRange(this._base.healthRange.min, this._base.healthRange.max);
	}

	Enemy.prototype.describe = function() {
		return {
			id: this._id,
			type: this.type,
			hitpoints: this.hp
		};
	};


	Enemy.prototype.attack = function(options) {
		if (options.round && this.initialRound + this._base.attackRound > options.round) {
			return 0;
		}
		return randomRange(this._base.damageRange.min, this._base.damageRange.max);
	}

	return Enemy;

}());
