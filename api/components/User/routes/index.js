/**
 * User Router
 * @module user/router
 */

const Logger = require('@util/Logger')('USER_ROUTER');

module.exports = server => {
  /**
   * Create new user route
   * @memberOf module:user/router
   */
  server.post('/user', (req, res, next) => {
    'use strict';
    res.status(200);
    return res.send('hello from user route');
  })
};
