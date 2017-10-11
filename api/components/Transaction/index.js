/**
 * This will serve to abstract module route details away from the router, so that route defintions can be initilized
 * for this module
 * @param server {Object}
 * @module transaction
 */
module.exports = (server) => {
  require('./routes/index')(server);
};
