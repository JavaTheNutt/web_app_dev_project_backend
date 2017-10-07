/**
 * This is the controller for dealing with the User model.
 *
 * @module controllers/userController
 */
const Logger   = require('@util/Logger')('USER_CTRL');
const _        = require('lodash');
module.exports = {
  /**
   * Create new User
   *
   * @memberOf module:controllers/userController
   * @param req {Object} the request object
   * @param res {Object} Response the response object
   * @param next {Function} next callback
   */
  createNewUser(req, res, next) {
    'use strict';
    Logger.info(`request made to create new user`);
    if (_.isEmpty(req.body) || !req.body.user.email || !req.body.user.firebaseId) {
      Logger.warn(`there is data missing!`);
      Logger.verbose(`request body: ${JSON.stringify(req.body)}`);
      res.status(400);
      return res.send('missing data');
    }
    res.status(200);
    return res.send('user created');
  }

};
