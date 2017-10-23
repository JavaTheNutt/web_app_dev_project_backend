/**
 * User Router
 * @module user/router
 */

const userController = require('@user/userController');
module.exports       = server => {
  /**
   * Create new user route
   * Breaking HATEOAS principal so that I can exclusively catch this route. Since there will not be a user present in
   * the system for this route, it will be required to authenticate this route differently
   * @memberOf module:user/router
   */
  server.post('/user/new', userController.createNewUser);
  server.get('/user', userController.getCurrentUser);

  server.put('/user', userController.updateUser);

  server.delete('/user/address/:id', userController.deleteAddress);
  /**
   * Add an address to a user
   * @memberOf module:user/router
   */
  server.post('/user/address', userController.addAddress);
  server.get('/user/address', userController.fetchAllAddresses);

};
