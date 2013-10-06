/* globals describe, it, expect, jasmine */
describe('Enemy Collection', function(){
	var EnemyCollection = require('../../lib/enemy_collection.js');
	var Enemy = require('../../lib/enemy.js');
	var Player = require('../../lib/player.js');

	it('can add enemies', function(){
		var collection = new EnemyCollection(1);

		expect(collection.collection.length).toBe(0);
		collection.add(new Enemy('grunt'));
		expect(collection.collection.length).toBe(1);
	});

	it('can remove enemies', function(){
		var collection = new EnemyCollection(1),
			grunt = new Enemy('grunt'),
			id = grunt._id;

		collection.add(grunt);
		expect(collection.collection.length).toBe(1);

		collection.remove(id);
		expect(collection.collection.length).toBe(0);
	});

	it('can report on whether or not it is empty', function(){
		var collection = new EnemyCollection(1);

		expect(collection.isEmpty()).toBe(true);
		collection.add(new Enemy('grunt'));
		expect(collection.isEmpty()).toBe(false);
	});

	it('can return an enemy by id', function(){
		var collection = new EnemyCollection(1),
			grunt = new Enemy('grunt'),
			id = grunt._id;

		collection.add(grunt);
		expect(collection.byId(id)).toBe(grunt);
	});

	it('can return an array of all enemies', function(){
		var collection = new EnemyCollection(1);

		collection.add(new Enemy('grunt'));
		expect(collection.getAll()).toEqual(jasmine.any(Array));
		expect(collection.getAll().length).toBe(1);
		expect(collection.getAll()[0]).toEqual(jasmine.any(Enemy));
	});

	it('can return a summary of enemy totals grouped by type', function(){
		var collection = new EnemyCollection(1),
			summary;

		collection.add(new Enemy('grunt'));
		collection.add(new Enemy('grunt'));
		collection.add(new Enemy('grunt'));
		summary = collection.summary();
		expect(summary.grunt).toBe(3);
	});

	it('can return detailed info about each enemy', function(){
		var collection = new EnemyCollection(1),
			list;

		collection.add(new Enemy('grunt'));
		collection.add(new Enemy('grunt'));
		collection.add(new Enemy('grunt'));
		list = collection.list();
		expect(list.length).toBe(3);
		expect(list[0]).toEqual(jasmine.any(Object));
		expect(list[0].type).toBe('grunt');
	});

	it('can bind a callback to fire when all enemies are removed', function(){
		var collection = new EnemyCollection(1),
			grunt = new Enemy('grunt'),
			id = grunt._id,
			executed = false;

		collection.onLastWaveEnemy(function(){ executed = true; });

		collection.add(grunt);
		collection.remove(id);
		expect(executed).toBe(true);
	});

	it('can return a random enemy', function(){
		var collection = new EnemyCollection(1),
			grunt = new Enemy('grunt');

		collection.add(grunt);
		expect(collection.getRandom()).toBe(grunt);
	});

	it('can return an enemy position', function(){
		var collection = new EnemyCollection(1),
			grunt = new Enemy('grunt');

		collection.add(grunt);
		expect(collection.getPosition(grunt._id)).toEqual(jasmine.any(Number));
	});

	it('can instruct all of the enemies contained to take an action', function(){
		var collection = new EnemyCollection(1),
			enemy1 = new Enemy('flyer'),
			enemy2 = new Enemy('flyer'),
			player = new Player('Robert Paulson'),
			actions;

		collection.add(enemy1);
		collection.add(enemy2);

		actions = collection.massAction(player);

		expect(actions).toEqual(jasmine.any(Array));
		expect(actions[0]).toEqual(jasmine.any(Object));
		expect(actions[0].type).toEqual('move');
	});
});
