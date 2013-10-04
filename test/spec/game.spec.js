/* globals describe, it, expect, jasmine */
describe('Game', function(){
	var Game = require('../../lib/game.js');
	var EnemyCollection = require('../../lib/enemy_collection.js');
	var Player = require('../../lib/player.js');

	it('keeps track of the current round', function(){
		var round1, round2, game;

		game = new Game();
		round1 = game.getRound();
		game.setupRound();
		round2 = game.getRound();

		expect(round1).toEqual(jasmine.any(Number));
		expect(round2).toEqual(jasmine.any(Number));
		expect(round1 === round2).toBe(false);
	});
	it('contains an array of enemy collections called "waves"', function(){
		var game = new Game();

		expect(game.waves).toEqual(jasmine.any(Array));
		expect(game.waves.length).toBe(0);

		game.setupRound();

		expect(game.waves.length).toBe(1);
		expect(game.waves[0]).toEqual(jasmine.any(EnemyCollection));
	});

	it('can instruct all the enemies to take their turn', function(){
		var game = new Game();
		var player = new Player('Robert Paulson');
		var actions;


		game.spawnEnemies();
		actions = game.processEnemyActions(player);

		expect(actions).toEqual(jasmine.any(Array));
		expect(actions[0]).toEqual(jasmine.any(Object));
		expect(actions[0].type).toEqual(jasmine.any(String));
	});
});