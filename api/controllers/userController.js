/**
 * This is the controller for dealing with the User model.
 *
 * @module controllers/userController
 */
const Logger = require('@util/Logger')('USER_CTRL');

module.exports =  {
  /**
   * Create new User
   *
   * @memberOf module:controllers/userController
   * @param req {Object} the request object
   * @param res {Object} Response the response object
   * @param next {Function} next callback
   */
  createNewUser(req, res, next){
    'use strict';
    res.send(200);
  }

};
