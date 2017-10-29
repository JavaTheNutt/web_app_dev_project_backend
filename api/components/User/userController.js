/**
 * This is the controller for dealing with the User model.
 *
 * @module user/userController
 */
const Logger      = require('@util/Logger')('USER_CTRL');
const _           = require('lodash');
const userService = require('@user/service/userService');
const errorUtils  = require('@util/errorUtils');

const oidValidation = require('@user/models/validation/modelValidation').validateObjectId;
module.exports      = {
  /**
   * Create new User
   * @param req {Object} the request object
   * @param res {Object} Response the response object
   * @memberOf module:user/userController
   */
  async createNewUser(req, res) {
    'use strict';
    Logger.info('request made to create new user');
    if (!checkCreateRequest(req)) {
      Logger.warn('error while validating params, returning 400');
      res.status(500);
      return res.send(errorUtils.formatSendableError('token was parsed successfully but is missing details'));
    }
    Logger.verbose('new user details assumed correct');
    const savedUser = await userService.handleCreateUser(req.body.customAuthUser.email, req.body.customAuthUser.firebaseId);
    if (savedUser.error) {
      Logger.warn(`saved user contains errors, error: ${JSON.stringify(savedUser)}`);
      return res.status(savedUser.error.status || 500).send(savedUser);
    }
    return res.status(201).send(savedUser);
  },
  /**
   * Controller for adding an address to a user
   * @param req {Object} request
   * @param res {Object} response
   * @returns {Promise.<void>}
   * @memberOf module:user/userController
   */
  async addAddress(req, res) {
    'use strict';
    Logger.info('attempting to add address');
    const authDetails = req.body.customAuthUser;
    Logger.verbose(`user: ${JSON.stringify(authDetails)}`);
    const returnedUser = await userService.handleAddAddress(authDetails.user, req.body.address);
    Logger.verbose('modified user returned without error');
    Logger.verbose(`new user: ${JSON.stringify(returnedUser)}`);
    if (returnedUser.error) {
      Logger.warn('new user does not exist, aborting');
      return res.status(400).send(errorUtils.formatSendableErrorFromObject(returnedUser));
    }
    Logger.verbose('user exists, returning new user');
    return res.status(200).send(returnedUser);
  },
  async updateUser(req, res) {
    'use strict';
    Logger.info('request made to update user');
    if (!req.body || !req.body.updateParams || _.isEmpty(req.body.updateParams)) {
      Logger.warn('no params available, aborting');
      return res.status(400).send(errorUtils.formatSendableError('no update params provided'));
    }
    const updatedUser = await userService.updateUser(req.body.customAuthUser.user, req.body.updateParams);
    if (updatedUser.error) {
      Logger.warn('new user contains error, aborting');
      return res.status(400).send(errorUtils.formatSendableErrorFromObject(updatedUser));
    }
    Logger.verbose('user assumed fetched, returning to client');
    return res.status(200).send(updatedUser);
  },
  async getCurrentUser(req, res) {
    'use strict';
    Logger.info('request recieved to fetch uer by id');
    const user = await userService.getUserById(req.body.customAuthUser.user);
    if (user.error) {
      Logger.warn('an error occurred while fetching user');
      Logger.verbose(`error: ${JSON.stringify(user)}`);
      return res.status(500).send(errorUtils.formatSendableErrorFromObject(user));
    }
    Logger.verbose('user assumed fetched without error');
    return res.status(200).send(user);
  },
  async deleteAddress(req, res) {
    'use strict';
    Logger.info('request recieved to delete address');
    if (!req.params || !req.params.id) {
      Logger.warn('missing data for request');
      return res.status(400).send(errorUtils.formatSendableError('address id is required'));
    }
    if (!oidValidation(req.params.id)) {
      Logger.warn('id is not valid format');
      return res.status(400).send(errorUtils.formatSendableError('address id is invalid format'));
    }
    const updatedUser = await userService.deleteAddressById(req.body.customAuthUser.user, req.params.id);
    if (updatedUser.error) {
      Logger.warn('updated user contains errors');
      return res.status(500).send(errorUtils.formatSendableErrorFromObject(updatedUser));
    }
    Logger.verbose('user assumed updated');
    return res.status(200).send(updatedUser);
  },
  async fetchSingleAddress(req, res) {
    'use strict';
    Logger.info('request recieved to fetch single address');
    if (!req.params || !req.params.id) {
      Logger.warn('missing data for request');
      return res.status(400).send(errorUtils.formatSendableError('address id is required'));
    }
    if (!oidValidation(req.params.id)) {
      Logger.warn('id is not valid format');
      return res.status(400).send(errorUtils.formatSendableError('address id is invalid format'));
    }
    Logger.verbose('object id is assumed valid');
    const address = await userService.fetchSingleAddress(req.body.customAuthUser.user, req.params.id);
    if (address.error) {
      Logger.warn('fetched address contains errors');
      address.error.message === 'address is not found' ? res.status(404) : res.status(500);
      return res.send(errorUtils.formatSendableErrorFromObject(address));
    }
    Logger.verbose('address assumed fetched');
    return res.status(200).send(address);
  },
  async fetchAllAddresses(req, res) {
    'use strict';
    Logger.info('request called to fetch all addresses');
    const addresses = await userService.fetchAddresses(req.body.customAuthUser.user);
    Logger.verbose(`returned addresses: ${JSON.stringify(addresses)}`);
    if (addresses.error) {
      Logger.warn('address fetch has errors');
      return res.status(500).
        send(errorUtils.formatSendableErrorFromObject(errorUtils.updateErrorMessage('error occurred while fetching all addresses', addresses)));
    }
    if (Array.isArray(addresses) && addresses.length === 0) {
      Logger.warn('address array is empty');
      return res.status(200).send({message: 'this user has no addresses'});
    }
    return res.status(200).send(addresses);
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
  Logger.info('testing request params for create new user');
  if (_.isEmpty(req.body) || !req.body.customAuthUser || _.isEmpty(req.body.customAuthUser) || !req.body.customAuthUser.firebaseId || !req.body.customAuthUser.email) {
    Logger.warn('there is data missing!');
    Logger.verbose(`request body: ${JSON.stringify(req.body)}`);
    return false;
  }
  Logger.info('required params present, proceeding');
  return true;
}
