/**
 * This will serve to abstract module route details away from the router, so that route defintions can be initilized
 * for this module
 * @param server the express server
 * @type{express.server}
 * @module transaction/router
 * @return {void}
 */
module.exports = server => {
    require('./routes/index')(server);
};
