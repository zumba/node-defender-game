function Player(username) {
	this.username = username;
};

Player.prototype.name = function(username) {
	username = username || null;
	if (username !== null) {
		this.username = username;
	}
	return this.username;
};

module.exports = Player;
