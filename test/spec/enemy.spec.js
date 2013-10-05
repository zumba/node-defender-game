/* globals describe, it, expect, jasmine */
describe('Enemy', function(){
	var Enemy = require('../../lib/enemy.js');
	var Player = require('../../lib/player.js');
	var _ = require('underscore');

	it('can describe itsself', function(){
		var enemy = new Enemy('grunt');
		expect(enemy.describe().type).toBe('grunt');
	});

	it('can attack a player object', function(){
		var enemy = new Enemy('swarmer');
		var player = new Player('Robert Paulson');
		var hp = player.health();

		enemy.attack(player);

		expect(player.health()).toBeLessThan(hp);
	});

	it('can perform logical actions like moving and attacking', function(){
		var enemy = new Enemy('grunt');
		var player = new Player('Robert Paulson');
		var actions = [];

		actions = enemy.processLogic(player);

		expect(actions).toEqual(jasmine.any(Array));
		expect(actions[0]).toEqual(jasmine.any(Object));
		expect(actions[0].type).toEqual('move');
	});

	it('can move', function(){
		var enemy = new Enemy('grunt');
		var position = enemy.getPosition();

		enemy.move();

		expect(enemy.getPosition()).not.toBe(position);
	});

	it('handles defining behaviors from the data template, resolving arrays', function(){
		var enemy = new Enemy('grunt');

		_.each(enemy.behaviors, function(behavior){
			expect(typeof behavior).toBe('string');
		});
	});
});