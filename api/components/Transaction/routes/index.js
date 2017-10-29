/**
 * Transaction Router
 * @module transaction/router
 */

const Logger = require('@util/Logger')('USER_ROUTER');

module.exports = server => {
  /**
   * Create new user route
   * @memberOf module:user/router
   */
  server.get('/transaction', (req, res) => {
    'use strict';
    Logger.info('get request retrieved by transaction controller');
    res.status(200);
    return res.send('hello from user route');
  });
};
