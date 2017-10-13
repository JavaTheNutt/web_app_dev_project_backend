/**
 * This is the controller for dealing with the User model.
 *
 * @module user/userController
 */
const Logger   = require('@util/Logger')('USER_CTRL');
const _        = require('lodash');
const userService = require('@user/service/userService');

module.exports = {
  /**
   * Create new User
   *
   * @memberOf module:user/userController
   * @param req {Object} the request object
   * @param res {Object} Response the response object
   * @param next {Function} next callback
   */
  async createNewUser(req, res, next) {
    'use strict';
    Logger.info(`request made to create new user`);
    if (!checkCreateRequest(req)) {
      Logger.warn(`error while validating params, returning 400`);
      res.status(400);
      return res.send('missing data');
    }
    Logger.verbose(`new user details assumed correct`);
    //fixme insert user creation logic
    const savedUser = await userService.createUser(req.body.customAuthUser);
    //fixme insert auth creation logic
    Logger.verbose(`user has been successfully created`);
    res.status(200);
    return res.send('user created');
  }
};

/**
 * Check if required params are present on request to create user
 * @param req {Object} the request object
 * @returns {boolean} true if body fields present, false otherwise
 */
function checkCreateRequest(req) {
  'use strict';
  Logger.info(`testing request params for create new user`);
  if (_.isEmpty(req.body) || !req.body.customAuthUser || _.isEmpty(req.body.customAuthUser) || !req.body.customAuthUser.firebaseId || !req.body.customAuthUser.email) {
    Logger.warn(`there is data missing!`);
    Logger.verbose(`request body: ${JSON.stringify(req.body)}`);
    return false;
  }
  Logger.info(`required params present, proceeding`);
  return true;
}
