/* globals describe, it, expect, jasmine */
describe('Attack Mode', function(){
	var AttackMode = require('../../lib/attack_mode');
	var WaveFactory = require('../../lib/wave_factory');
	var Player = require('../../lib/player');

	it('can return configuration data by key', function(){
		var mode = new AttackMode('PowerAttack');

		expect(mode.get('defenseMod')).toEqual(jasmine.any(Number));
		expect(mode.get('damage')).toEqual(jasmine.any(Array));
	});

	describe('Collateral Damage', function(){
		var factory = new WaveFactory();
		factory._id = 100;
		it('hits every enemy on the same position as the target, regardless of wave', function(){
			var wave1 = factory.get(100);
			var wave2 = factory.get(100);
			var enemy1 = wave1.getRandom();
			var enemy2 = wave2.getRandom();
			var player = new Player('Dumbledore');
			var allMobs = [];

			allMobs.push.apply(allMobs, wave1.getAll());
			allMobs.push.apply(allMobs, wave2.getAll());

			allMobs.forEach(function(enemy){
				expect(enemy.hp).toBe(enemy.maxHp);
			});

			enemy1.position = 3;
			enemy2.position = 3;

			player.attackMode('collateral');
			player.attackEnemy(enemy1, [wave1, wave2]);

			allMobs.forEach(function(enemy){
				// we don't check evasive enemies, because they might have dodged.
				if (enemy.position === 3 && !enemy.is('evasive')){
					expect(enemy.hp).toBeLessThan(enemy.maxHp);
				} else if (enemy.position !== 3) {
					expect(enemy.hp).toBe(enemy.maxHp);
				}
			});
		});
	});
});