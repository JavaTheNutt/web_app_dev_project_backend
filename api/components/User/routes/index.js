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
  /**
   * Fetch the details of the user who made the request
   * @memberOf module:user/router
   */
  server.get('/user', userController.getCurrentUser);
  /**
   * Update the user who made the request
   * @memberOf module:user/router
   */
  server.put('/user', userController.updateUser);
  /**
   * Delete an address from a user specified by address ID
   * @memberOf module:user/router
   */
  server.delete('/user/address/:id', userController.deleteAddress);
  /**
   * Delete address from a user specified by address ID
   */
  server.get('/user/address/:id', userController.fetchSingleAddress);
  /**
   * Add an address to a user
   * @memberOf module:user/router
   */
  server.post('/user/address', userController.addAddress);
  /**
   * Fetch all addresses for a user
   * @memberOf module:user/router
   */
  server.get('/user/address', userController.fetchAllAddresses);

};
