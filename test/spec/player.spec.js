/* globals describe, it, expect, jasmine */
describe('Player', function(){
	var Player = require('../../lib/player.js');

	it('can reveal the defense mod of the current attack mode', function(){
		var player = new Player('Mod Squad');
		expect(player.getDefenseMod()).toEqual(jasmine.any(Number));
	});

	it('test if a new user is healthy', function(){
		var player = new Player('Health Boy');
		expect(player.isAlive()).toBe(true);
		expect(player.isDead()).toBe(false);
	});

	it('test if the user dies when take damage of his health', function() {
		var player = new Player('I gonna die');
		player.damage(player.health());
		expect(player.isAlive()).toBe(false);
		expect(player.isDead()).toBe(true);
	});

	it('test if the user dies when take damage more than his health', function() {
		var player = new Player('I gonna die');
		player.damage(player.health() + 1);
		expect(player.isAlive()).toBe(false);
		expect(player.isDead()).toBe(true);
	});
});