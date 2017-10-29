/**
 * This will serve to abstract module route details away from the router, so that route definitions can be initialized
 * for this module
 * @param server {Object}
 * @module user
 */
module.exports = server => {
  require('./routes')(server);
};
