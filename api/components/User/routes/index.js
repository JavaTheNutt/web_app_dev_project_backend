/**
 * User Router
 * @module user/router
 */

const userController = require('@user/userController');
module.exports       = server => {
  /**
   * Create new user route
   * @memberOf module:user/router
   */
  server.post('/user', userController.createNewUser);
};
