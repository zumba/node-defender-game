var MongoClient = require('mongodb').MongoClient;

module.exports = {
	randomRange: function(min, max) {
		return Math.floor(Math.random() * (max - min + 1) + min);
	},
	mongoConnect: function(callback) {
		var host = process.env.MONGOHOST || '127.0.0.1',
			port = process.env.MONGOPORT || '27017',
			db = process.env.MONGODB || 'node-defender';
		MongoClient.connect('mongodb://' + host + ':' + port + '/' + db, callback);
	},
	initializeNodetime: function() {
		if(process.env.NODETIME_ACCOUNT_KEY) {
			require('nodetime').profile({
				accountKey: process.env.NODETIME_ACCOUNT_KEY,
				appName: 'Node Defender Server'
			});
		}
	}
};
