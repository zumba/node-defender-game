/* globals __dirname */

/**
 * Loader for all interfaces in the current directory
 */
var inflection = require('inflection');
var fs = require('fs');
var interfaces = {};

// sync, not async, because we need to export an object
// note: `require` is also sync, so this isn't a big bottleneck.
fs.readdirSync(__dirname)
	.forEach(function(file){
		var filename, name;
		if (file.match(/_interface\.js$/)){
			filename = file.split('.js')[0];
			name = inflection.camelize(filename.split('_interface')[0]);
			interfaces[name] = require('./' + filename);
		}
	});

module.exports = (function(){
	var Loader = function(){};

	/**
	 * Return an interface
	 *
	 * @param String name
	 * @return Function constructor
	 */
	Loader.prototype.get = function(name){
		return interfaces[name];
	};

	/**
	 * Forces Obj.prototype to be a new object derrived from the prototype of `interfaceName`
	 *
	 * @param Function Obj a constructor function
	 * @param String interfaceName
	 * @throws Error if the requested interface is not loaded.
	 * @return void
	 */
	Loader.prototype.implement = function(Obj, interfaceName){
		var I = interfaces[interfaceName];

		if (!I){
			throw new Error(interfaceName + ' Interface Not Found');
		}
		Obj.prototype = Object.create(I.prototype);
	};
	return new Loader();
}());