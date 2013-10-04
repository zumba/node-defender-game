/* globals describe, it, expect, jasmine */
describe('Player', function(){
	var Player = require('../../lib/player.js');

	it('can reveal the defense mod of the current attack mode', function(){
		var player = new Player('Mod Squad');
		expect(player.getDefenseMod()).toEqual(jasmine.any(Number));
	});
});