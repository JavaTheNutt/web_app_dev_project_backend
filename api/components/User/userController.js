/**
 * This is the controller for dealing with the User model.
 *
 * @module user/userController
 */
const Logger      = require('@util/Logger')('USER_CTRL');
const _           = require('lodash');
const userService = require('@user/service/userService');
const authService = require('@Auth/authService');
module.exports    = {
  /**
   * Create new User
   * @param req {Object} the request object
   * @param res {Object} Response the response object
   * @param next {Function} next callback
   * @memberOf module:user/userController
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
    const savedUser = await userService.createUser(req.body.customAuthUser);
    if (!savedUser) {
      Logger.warn(`there was an error saving the user, returned user is null`);
      return res.status(400).send('error creating user');
    }
    Logger.verbose(`user assumed created`);
    Logger.verbose(`new user: ${JSON.stringify(savedUser)}`);
    const savedAuth = await authService.createAuthUser({
      email: req.body.customAuthUser.email,
      user: savedUser._id,
      firebaseId: req.body.customAuthUser.firebaseId
    });
    if(!savedAuth){
      Logger.warn(`there was an error saving the auth object`);
      return res.status(400).send('error while saving auth object');
    }
    Logger.verbose(`auth object assumed created`);
    Logger.verbose(`new auth: ${JSON.stringify(savedAuth)}`);
    Logger.verbose(`user has been successfully created`);
    if (!(await authService.setCustomClaims(savedAuth.firebaseId, {user: savedAuth.user}))) {
      Logger.warn(`adding custom auth claim failed`);
      return res.status(400).send('error while adding custom claims to firebase');
    }
    //res.status(200);
    return res.status(200).send('user created');
  },
  /**
   * Controller for adding an address to a user
   * @param req {Object} request
   * @param res {Object} response
   * @param next {Function} next callback
   * @returns {Promise.<void>}
   * @memberOf module:user/userController
   */
  async addAddress(req, res, next) {
    'use strict';
    Logger.info(`attempting to add address`);
    const authDetails = req.body.customAuthUser;
    Logger.verbose(`user: ${JSON.stringify(authDetails)}`);
    const returnedUser = await userService.handleAddAddress(authDetails.user, req.body.address);
    Logger.verbose(`modified user returned without error`);
    Logger.verbose(`new user: ${JSON.stringify(returnedUser)}`);
    if(!returnedUser){
      Logger.warn(`new user does not exist, aborting`);
      return res.status(400).send('there was an error while adding an address')
    }
    Logger.verbose(`user exists, returning new user`);
    res.status(200).send(returnedUser);
  }
};


/**
 * Check if required params are present on request to create user
 * @param req {Object} the request object
 * @returns {boolean} true if body fields present, false otherwise
 * @memberOf module:user/userController
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
