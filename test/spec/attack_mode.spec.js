/* globals describe, it, expect, jasmine */
describe('Attack Mode', function(){
	var AttackMode = require('../../lib/attack_mode');

	it('can return configuration data by key', function(){
		var mode = new AttackMode('PowerAttack');

		expect(mode.get('defenseMod')).toEqual(jasmine.any(Number));
		expect(mode.get('damage')).toEqual(jasmine.any(Array));
	});
});