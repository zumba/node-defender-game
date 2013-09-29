module.exports = (function() {

	// Sequential static ID for uniqueness
	var _id = 1;

	function Enemy(type, initialRound) {
		this._id = _id++;
		this.type = type;
		this.initialRound = initialRound;
		// @todo randomize health based on mob repo ranges
		this.hp = 3;
	}

	Enemy.prototype.describe = function() {
		return {
			id: this._id,
			type: this.type,
			hitpoints: this.hp
		};
	};

	Enemy.prototype.attack = function() {
		// @todo calculate based on mob ranges
		return Math.ceil(Math.random() * 10);
	};

	return Enemy;

}());
