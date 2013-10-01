/* globals describe, it, expect, jasmine */
describe('Wave Factory', function(){
	var WaveFactory = require('../../lib/wave_factory.js');
	var EnemyCollection= require('../../lib/enemy_collection.js');

	it('Makes EnemyCollections', function(){
		var factory = new WaveFactory();
		expect(factory.get()).toEqual(jasmine.any(EnemyCollection));
	});
});