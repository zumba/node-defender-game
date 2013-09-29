/* globals describe, it, expect */
describe('Enemy', function(){
	var Enemy = require('../../lib/enemy.js');
	it('can describe itsself', function(){
		var enemy = new Enemy('CrazyType');
		expect(enemy.describe().type).toBe('CrazyType');
	});
});