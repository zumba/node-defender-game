var AttackModeInterface;

/**
 * Attack Mode Interface
 *
 * @constructor
 */
AttackModeInterface = function(){};

/**
 * Returns an array of { enemyId : damage } objects.
 *
 * If targetId does not exist in the collection, the method should default to attacking the
 * closest enemy in the collection (chosen at random if there are more than one).
 *
 * If the collection is empty for some reason, method should return an empty array
 *
 * @param Number targetId
 * @param EnemyCollection collection
 * @return Array [{ enemyId : damage }, { enemyId : damage }]
 */
AttackModeInterface.prototype.getDamage = function(targetId, collection){
	targetId = null;
	collection = null;
	throw new Error('AttackModeInterface::getDamage must be implemented.');
};

module.exports = AttackModeInterface;