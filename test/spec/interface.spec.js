/* globals describe, it, expect, jasmine */
describe('Interface Loader', function(){
	var interfaces = require('../../lib/interfaces');

	it('can retrieve an interface constructor', function(){
		var RequiredLib = require('../../lib/interfaces/attack_mode_interface.js');
		var LoadedLib = interfaces.get('AttackMode');

		expect(LoadedLib).toBe(RequiredLib);
	});

	it('can modify a constructor prototype to implement an interface', function(){
		var TestConstructor = function(){};
		var TestLib = interfaces.get('AttackMode');

		interfaces.implement(TestConstructor, 'AttackMode');
		expect(TestConstructor.prototype).toEqual(jasmine.any(TestLib));
	});
});