/**
 * This is the controller for dealing with the User model.
 *
 * @module user/userController
 */
const Logger      = require('@util/Logger')('USER_CTRL');
const _           = require('lodash');
const userService = require('@user/service/userService');
const authService = require('@Auth/service/authService');
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
      return res.send({error:{message:'token was parsed successfully but is missing details'}});
    }
    Logger.verbose(`new user details assumed correct`);
    const savedUser = await userService.createUser(req.body.customAuthUser);
    if (savedUser.error) {
      Logger.warn(`there was an error saving the user`);
      const errorMsg = savedUser.error.err ? `${savedUser.error.message}: ${savedUser.error.err.message}` : savedUser.error.message;
      Logger.verbose(`error message to be returned: ${errorMsg}`);
      return res.status(500).send({error:{message: errorMsg}});
    }
    Logger.verbose(`user assumed created`);
    Logger.verbose(`new user: ${JSON.stringify(savedUser)}`);
    const savedAuth = await authService.createAuthUser({
      email: req.body.customAuthUser.email,
      user: savedUser.data._id,
      firebaseId: req.body.customAuthUser.firebaseId
    });
    if (savedAuth.error) {
      Logger.warn(`there was an error saving the auth object`);
      const errorMsg = savedAuth.error.err ? `${savedAuth.error.message}: ${savedAuth.error.err.message}` : savedAuth.error.message;
      Logger.verbose(`error to be returned: ${errorMsg}`);
      const deleteUser = await userService.deleteUser(savedUser.data._id);
      /*if(deleteUser.error){
        Logger.warn(`an error occurred while deleting user`);
      }*/
      return res.status(500).send({error:{message: errorMsg}});
    }
    Logger.verbose(`auth object assumed created`);
    Logger.verbose(`new auth: ${JSON.stringify(savedAuth)}`);
    Logger.verbose(`user has been successfully created`);
    const claimsSuccessful = await authService.setCustomClaims(savedAuth.data.firebaseId, {user: savedAuth.data.user});
    if (claimsSuccessful.error) {
      Logger.warn(`adding custom auth claim failed`);
      const errorMsg = claimsSuccessful.error.err ? `${claimsSuccessful.error.message}: ${claimsSuccessful.error.err.message}` : claimsSuccessful.error.message;
      const deleteUser = await userService.deleteUser(savedUser.data._id);
      const deleteAuth = await authService.deleteAuthRecordById(savedAuth.data._id);
      return res.status(500).send({error:{message: errorMsg}});
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
      const errorMsg = returnedUser.error.err ? `${returnedUser.error.message}: ${returnedUser.error.err.message}` : returnedUser.error.message;
      Logger.verbose(`error to be returned: ${errorMsg}`);
      return res.status(400).send({error:{message: errorMsg}})
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
