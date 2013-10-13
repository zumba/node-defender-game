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
		it('hits every enemy in a collection', function(){
			var wave = factory.get(100);
			var enemy = wave.getRandom();
			var player = new Player('Dumbledore');

			wave.getAll().forEach(function(enemy){
				// we don't check evasive enemies, because they might have dodged.
				if (!enemy.is('evasive')){
					expect(enemy.hp).toBe(enemy.maxHp);
				}
			});

			player.attackMode('collateral');
			player.attackEnemy(enemy, wave);

			wave.getAll().forEach(function(enemy){
				expect(enemy.hp).toBeLessThan(enemy.maxHp);
			});
		});
	});
});