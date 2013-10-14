/* globals describe, it, expect, jasmine */
describe('Player', function(){
	var Player = require('../../lib/player.js');

	it('can reveal the defense mod of the current attack mode', function(){
		var player = new Player('Mod Squad');
		expect(player.getDefenseMod()).toEqual(jasmine.any(Number));
	});

	it('is the health working as desired', function(){
		var player = new Player('Health Boy');
		expect(player.isAlive()).toBe(true);
		expect(player.isDead()).toBe(false);

		player.damage(10000);
		expect(player.isAlive()).toBe(false);
		expect(player.isDead()).toBe(true);
	});
});