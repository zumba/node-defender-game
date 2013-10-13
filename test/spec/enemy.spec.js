/* globals describe, it, expect, jasmine, spyOn */
describe('Enemy', function(){
	var global = require('../../config/game');
	var Enemy = require('../../lib/enemy');
	var Player = require('../../lib/player');
	var mobs = require('../../config/mobs');
	var _ = require('underscore');

	describe('Basic Functionality', function(){
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
			var enemy = new Enemy('flyer');
			var player = new Player('Robert Paulson');
			var actions = [];

			actions = enemy.processLogic(player);

			expect(actions).toEqual(jasmine.any(Array));
			expect(actions[0]).toEqual(jasmine.any(Object));
			expect(actions[0].type).toEqual('move');
		});

		it('can move', function(){
			var enemy = new Enemy('flyer');
			var position = enemy.getPosition();

			enemy.move();

			expect(enemy.getPosition()).not.toBe(position);
		});
	});

	describe('Behavior', function(){
		it('handles defining behaviors from the data template, resolving arrays', function(){
			var enemy = new Enemy('grunt');

			_.each(enemy.behaviors, function(behavior){
				expect(typeof behavior).toBe('string');
			});
		});

		it('can tell you if it is a behavior or not', function(){
			var enemy = new Enemy('speed-demon');

			// Speed Demons might be melee, or ranged
			expect(typeof enemy.is('melee')).toBe('boolean');

			// They are always evasive
			expect(enemy.is('evasive')).toBe(true);
		});

		/**
		 * Specific behavior functionality
		 */
		describe('melee', function(){
			var melee = new Enemy('grunt');

			// force the behavior to be melee
			melee.behaviors = _.reject(melee.behaviors, function(b){
				return b === 'ranged';
			});
			melee.behaviors.push('melee');

			it('prevents an enemy from attacking until it reaches the player', function(){
				melee.position = 5;
				while(melee.position > 0){
					expect(melee.canAttack()).toBe(false);
					melee.position--;
				}
				expect(melee.canAttack()).toBe(true);
			});
		});
		describe('ranged', function(){
			var ranged = new Enemy('grunt');

			// force the behavior to be ranged
			ranged.behaviors = _.reject(ranged.behaviors, function(b){
				return b === 'melee';
			});
			ranged.behaviors.push('ranged');

			it('can attack from any position', function(){
				ranged.position = 0;
				while(ranged.position <= 5){
					expect(ranged.canAttack()).toBe(true);
					ranged.position++;
				}
			});
			it('has it\'s damage reduced by the global ranged mod', function(){
				var mod = global.rangeDamageMod;
				var range = mobs.grunt.damage;
				var player = new Player('Dummy');
				var damage, i;

				// Spy on the player object to fake any defense mods.
				spyOn(player, 'getDefenseMod').andReturn(1);

				// take a sample set of attacks, to increase test accuracy

				i = 10;
				while(i--) {
					damage = ranged.attack(player);
					expect(damage >= Math.ceil(range[0] * mod)).toBe(true);
					expect(damage <= Math.ceil(range[1] * mod)).toBe(true);
				}
			});
		});

		describe('armored', function(){
			var armored = new Enemy('trooper');

			// force the behavior to be armored
			armored.behaviors.push('armored');

			it('takes half damage from all attacks except for power attack', function(){
				armored.hp = 100;

				armored.damage(10, 'PowerAttack');
				expect(armored.hp).toBe(90);

				armored.damage(10, 'RapidFire');
				expect(armored.hp).toBe(85);

				armored.damage(10, 'RangedAttack');
				expect(armored.hp).toBe(80);

				armored.damage(10, 'CollateralDamage');
				expect(armored.hp).toBe(75);

				armored.damage(10, 'Defensive');
				expect(armored.hp).toBe(70);
			});
		});
		describe('evasive', function(){
			var speedy = new Enemy('speed-demon');

			speedy.behaviors.push('evasive');
			it('has a chance to dodge some attacks', function(){
				var i;
				speedy.hp = 1000;

				for(i = 0; i < 10; i++){
					speedy.damage(10, 'PowerAttack');
				}
				expect(speedy.hp).toBeGreaterThan(900);
			});
		});
		describe('ranged-boost', function(){
			var ranged = new Enemy('flyer');

			// force the behavior to be ranged and ranged boost
			ranged.behaviors = _.reject(ranged.behaviors, function(b){
				return b === 'melee';
			});
			ranged.behaviors.push('ranged');
			ranged.behaviors.push('ranged-boost');

			it('walks away from the player', function(){
				var position = 0;
				ranged.position = 0;
				while(ranged.position < 5){
					ranged.move();
					expect(ranged.position).toBeGreaterThan(position);
					position = ranged.position;
				}
				expect(ranged.canAttack()).toBe(true);
			});

			it('does more damage from a distance than from up close', function(){
				var player = new Player('Dummy');
				var damageClose, damageFar;

				// Spy on the player object to fake any defense mods.
				spyOn(player, 'getDefenseMod').andReturn(1);

				ranged.position = 0;
				damageClose = ranged.attack(player);

				ranged.position = 5;
				damageFar = ranged.attack(player);

				expect(damageFar).toBeGreaterThan(damageClose);
			});
		});
		describe('diminishing', function(){
			it('reduces incoming damage to either `1` or `20% of max hp`, whichever is greater', function(){
				var cluster = new Enemy('cluster');
				cluster.behaviors.push('diminishing');

				cluster.hp = 5;
				cluster.diminishingDamage = 1;
				cluster.damage(10, 'PowerAttack');
				expect(cluster.hp).toBe(4);

				cluster.hp = 100;
				cluster.diminishingDamage = 20;
				cluster.damage(10, 'PowerAttack');
				expect(cluster.hp).toBe(80);
			});

			it('gets weaker as it is damaged', function(){
				var damageA, damageB;
				var cluster = new Enemy('cluster');
				var player = new Player('Ricky Bobby');

				spyOn(player, 'getDefenseMod').andReturn(1);
				cluster.behaviors.push('diminishing');

				damageA = cluster.attack(player);

				cluster.damage(10, 'PowerAttack');
				cluster.damage(10, 'PowerAttack');
				cluster.damage(10, 'PowerAttack');

				damageB = cluster.attack(player);

				expect(damageB).toBeLessThan(damageA);
			});
		});
		describe('heavy', function(){
			var heavy = new Enemy('bruiser');

			// force the behavior to be heavy
			heavy.behaviors.push('heavy');

			it('Takes only 1 damage, no matter what attack mode', function(){
				heavy.hp = 10;

				heavy.damage(10, 'PowerAttack');
				expect(heavy.hp).toBe(9);

				heavy.damage(10, 'RapidFire');
				expect(heavy.hp).toBe(8);

				heavy.damage(10, 'RangedAttack');
				expect(heavy.hp).toBe(7);

				heavy.damage(10, 'CollateralDamage');
				expect(heavy.hp).toBe(6);

				heavy.damage(10, 'Defensive');
				expect(heavy.hp).toBe(5);
			});
		});
	});
});