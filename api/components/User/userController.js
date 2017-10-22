/**
 * This is the controller for dealing with the User model.
 *
 * @module user/userController
 */
const Logger      = require('@util/Logger')('USER_CTRL');
const _           = require('lodash');
const userService = require('@user/service/userService');
const authService = require('@Auth/service/authService');
const errorUtils  = require('@util/errorUtils');
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
      res.status(500);
      return res.send({error: {message: 'token was parsed successfully but is missing details'}});
    }
    Logger.verbose(`new user details assumed correct`);
    const savedUser = await userService.createUser(req.body.customAuthUser);
    if (savedUser.error) {
      Logger.warn(`there was an error saving the user`);
      return res.status(500).send(errorUtils.formatSendableErrorFromObject(savedUser));
    }
    Logger.verbose(`user assumed created`);
    Logger.verbose(`new user: ${JSON.stringify(savedUser)}`);
    const savedAuth = await authService.createAuthUser({
      email: req.body.customAuthUser.email,
      user: savedUser._id,
      firebaseId: req.body.customAuthUser.firebaseId
    });
    if (savedAuth.error) {
      Logger.warn(`there was an error saving the auth object`);
      const deleteUser = await userService.deleteUser(savedUser._id);
      /*if(deleteUser.error){
        Logger.warn(`an error occurred while deleting user`);
      }*/
      return res.status(500).send(errorUtils.formatSendableErrorFromObject(savedAuth));
    }
    Logger.verbose(`auth object assumed created`);
    Logger.verbose(`new auth: ${JSON.stringify(savedAuth)}`);
    Logger.verbose(`user has been successfully created`);
    const claimsSuccessful = await authService.setCustomClaims(savedAuth.firebaseId, {user: savedAuth.user});
    if (claimsSuccessful.error) {
      Logger.warn(`adding custom auth claim failed`);
      const deleteUser = await userService.deleteUser(savedUser._id);
      const deleteAuth = await authService.deleteAuthRecordById(savedAuth._id);
      return res.status(500).send(errorUtils.formatSendableErrorFromObject(claimsSuccessful));
    }
    return res.status(201).send(savedUser);
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
    if (returnedUser.error) {
      Logger.warn(`new user does not exist, aborting`);
      return res.status(400).send(errorUtils.formatSendableErrorFromObject(returnedUser))
    }
    Logger.verbose(`user exists, returning new user`);
    res.status(200).send(returnedUser);
  },
  async updateUser(req, res, next) {
    'use strict';
    Logger.info(`request made to update user`);
    if (!req.body || !req.body.updateParams || _.isEmpty(req.body.updateParams)) {
      Logger.warn(`no params available, aborting`);
      return res.status(400).send(errorUtils.formatSendableError('no update params provided'));
    }
    const updatedUser = await userService.updateUser(req.body.customAuthUser.user, req.body.updateParams);
    if (updatedUser.error) {
      Logger.warn(`new user contains error, aborting`);
      return res.status(400).send(errorUtils.formatSendableErrorFromObject(updatedUser));
    }
    Logger.verbose(`user assumed fetched, returning to client`);
    return res.status(200).send(updatedUser);
  },
  async fetchUserById(req, res, next) {
    'use strict';
    Logger.info(`request recieved to fetch uer by id`);
    const user = await userService.fetchUserById(req.body.customAuthUser.user);
    if(user.error){
      Logger.warn(`an error occurred while fetching user`);
      Logger.verbose(`error: ${JSON.stringify(user)}`);
      return res.status(500).send(errorUtils.formatSendableErrorFromObject(user))
    }
    Logger.verbose(`user assumed fetched without error`);
    return res.status(200).send(user);
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
