/* globals describe, it, expect */
describe('Enemy', function(){
	var Enemy = require('../../lib/enemy.js');
	it('can describe itsself', function(){
		var enemy = new Enemy('grunt');
		expect(enemy.describe().type).toBe('grunt');
	});
});
