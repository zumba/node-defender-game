var Github = require('github'),
	_ = require('underscore');

module.exports = (function() {
	var Client, authenticate;

	Client = function(token) {
		this.token = token;
		this.ghClient = new Github({
			version: '3.0.0',
			protocol: 'https'
		});
	};

	Client.prototype.getUser = function(callback) {
		authenticate(this);
		this.ghClient.user.get({}, function(err, res) {
			if (err) {
				return callback(err);
			}
			callback(null, {
				screen_name: res.login,
				profile_image_url_https: res.avatar_url,
				lang: 'en-US'
			});
		});
	};

	Client.prototype.setClient = function(client) {
		this.ghClient = client;
	};

	authenticate = function(client) {
		client.ghClient.authenticate({
			type: 'oauth',
			token: client.token
		});
	};

	return Client;

}());
