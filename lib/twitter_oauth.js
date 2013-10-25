var oauth = require('oauth');
var _ = require('underscore');

module.exports = {
	consumer: function() {
		return new oauth.OAuth(
    		"https://twitter.com/oauth/request_token", 
    		"https://twitter.com/oauth/access_token", 
    		process.env.TWITTER_CONSUMER_KEY, 
    		process.env.TWITTER_CONSUMER_SECRET, 
    		"1.0A", 
    		process.env.TWITTER_CALLBACK || null, 
    		"HMAC-SHA1"
    	);   
	},
    get: function(player, callback) {
        this.consumer().get(
                "https://api.twitter.com/1.1/account/verify_credentials.json", 
                player._token, 
                player._secret,
                function (error, data, response) {
                    if (error) {
                        callback(error);
                        return;
                    }
                    callback(null, _.pick(JSON.parse(data), ['screen_name', 'profile_image_url_https', 'lang']));
                }
            )
    }
}
