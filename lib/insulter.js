var insults = require('../config/insults');
var taunts = require('../config/taunts');
var config = require('../config/game');
var _ = require('underscore');

module.exports = (function(){
	return {
		getAny : function(){
			var msg = null;
			if (Math.random() <= config.insultThreshold){
				msg = Math.random() <= 0.15 ? this.getInsult() : this.getTaunt();
			}
			return msg;
		},
		getInsult : function(){
			var insult = _.sample(insults).toUpperCase();
			var article = ['A', 'E', 'I', 'O', 'U'].indexOf(insult[0]) === -1 ? 'A' : 'A';

			return 'YOU ARE SUCH ' + article + ' ' + insult;
		},
		getTaunt : function(){
			return _.sample(taunts).toUpperCase();
		}
	};
}());