/**
 * Service for interacting with User data models
 * @module user/service
 */

const Logger         = require('@util/Logger')('USER_SERVICE');
const User           = require('@user/models/User').model;
const addressService = require('@Address/service/addressService');
const errorUtils     = require('@util/errorUtils');
const _              = require('lodash');
const authService    = require('@Auth/service/authService');

module.exports = exports = {
  /**
   * Create a new user record
   * @param userDetails {object} the details required to make a new user
   * @returns {Promise.<Object>}
   * @memberOf module:user/service
   */
  async createUser(userDetails) {
    'use strict';
    Logger.info('request to create user recieved');
    Logger.verbose(`details fo user to be created: ${JSON.stringify(userDetails)}`);
    const newUser = new User(formatDetails(userDetails));
    Logger.verbose(`created user: ${JSON.stringify(newUser)}`);
    try {
      await newUser.save();
      Logger.verbose('user saved without error');
      return newUser._doc;
    } catch (err) {
      Logger.warn('user save failed');
      Logger.error(`error: ${err}`);
      return errorUtils.formatError('an error occurred during the user save operation', err);
    }
  },
  async handleCreateUser(email, firebaseId) {
    'use strict';
    const savedUser = await exports.createUser({email});
    if (savedUser.error) {
      Logger.warn('there was an error saving the user');
      return errorUtils.formatSendableErrorFromObject(savedUser);
    }
    Logger.verbose('user assumed created');
    Logger.verbose(`new user: ${JSON.stringify(savedUser)}`);
    const savedAuth = await authService.createAuthUser({
      email,
      user: savedUser._id,
      firebaseId
    });
    if (savedAuth.error) {
      Logger.warn('there was an error saving the auth object');
      await exports.deleteUser(savedUser._id);
      return errorUtils.formatSendableErrorFromObject(savedAuth);
    }
    Logger.verbose('auth object assumed created');
    Logger.verbose(`new auth: ${JSON.stringify(savedAuth)}`);
    Logger.verbose('user has been successfully created');
    const claimsSuccessful = await authService.setCustomClaims(savedAuth.firebaseId, {user: savedAuth.user});
    if (claimsSuccessful.error) {
      Logger.warn('adding custom auth claim failed');
      exports.deleteUser(savedUser._id);
      authService.deleteAuthRecordById(savedAuth._id);
      return errorUtils.formatSendableErrorFromObject(claimsSuccessful);
    }
    return savedUser;
  },
  /**
   * Wrapper for address validation and insertion
   * @param user {ObjectId} the id of the user
   * @param address {Object} geospatial address to be saved
   * @returns {Promise.<*>} the updated user if successful, false otherwise
   *
   * @memberOf module:user/service
   */
  async handleAddAddress(user, address) {
    'use strict';
    Logger.info('request made to add address to user');
    Logger.verbose(`user: ${user}`);
    Logger.verbose(`address: ${JSON.stringify(address)}`);
    const validAddress = await exports.validateAddress(address);
    if (validAddress.error) {
      Logger.warn('address is not valid, aborting');
      Logger.warn(`error: ${JSON.stringify(validAddress.error)}`);
      return validAddress;
    }
    const updatedUser = await exports.addAddress(user, validAddress);
    if (updatedUser.error) {
      Logger.warn('returend user is not valid, aborting');
      Logger.warn(`error: ${JSON.stringify(updatedUser.error)}`);
      return updatedUser;
    }
    Logger.info('address assumed added');
    Logger.verbose(`returning ${JSON.stringify(updatedUser)}`);
    return updatedUser;
  },
  /**
   * Wrapper around adding an address to a user
   * @param user {ObjectId} the id of the user
   * @param address {Object} the address to be added
   * @returns {Promise.<*>} the updated user if successful, false otherwise
   *
   * @memberOf module:user/service
   */
  async addAddress(user, address) {
    'use strict';
    Logger.info('request made to add address to user');
    Logger.verbose(`user: ${user}`);
    Logger.verbose(`address: ${JSON.stringify(address)}`);
    try {
      const updatedUser = await User.findByIdAndUpdate(user, {$push: {addresses: address}}, {
        safe: true,
        new: true,
        runValidators: true
      });
      Logger.verbose('update completed without error');
      Logger.verbose(`updated doc: ${JSON.stringify(updatedUser)}`);
      return updatedUser;
    } catch (err) {
      Logger.warn('error during object creation');
      Logger.error(`error: ${err}`);
      return errorUtils.formatError('an error occurred while updating the user', err);
    }
  },
  /**
   * fetch a single address for a user
   * @param userId {ObjectId}
   * @param addressId {ObjectId}
   * @returns {Promise.<*|{error: {message: string}}>}
   */
  async fetchSingleAddress(userId, addressId) {
    'use strict';
    Logger.info('request made to fetch single address');
    Logger.verbose(`fetching address with id ${addressId} fro user ${userId}`);
    const addresses = await exports.fetchAddresses(userId);
    return addresses.error ? addresses :
      (addresses.find(address => address._id.toString() === addressId.toString()) || errorUtils.formatError('address is not found'));
  },


  /**
   * fetch all addresses for a single user
   * @param userId
   * @returns {Promise.<Object|$pull.addresses|{_id}|Array|null|*|*>}
   */
  async fetchAddresses(userId) {
    'use strict';
    Logger.info('request recieved to fetch user addresses');
    Logger.verbose(`user: ${JSON.stringify(userId)}`);
    const user = await exports.getUserById(userId);
    Logger.verbose(`user: ${JSON.stringify(user)}`);
    return user.error ? user : (user.addresses || errorUtils.formatError('the user has no addresses'));
  },
  /**
   * delete a users address by its id
   * @param userId {ObjectId} users object id
   * @param addressId {ObjectId} address object id
   * @returns {Promise.<*>}
   */
  async deleteAddressById(userId, addressId) {
    'use strict';
    Logger.info('request made to delete an address by id');
    Logger.verbose(`deleting address ${addressId} from user ${userId}`);
    const newUser = await exports.updateUser(userId, {$pull: {addresses: {_id: addressId}}});
    if (newUser.error) {
      Logger.warn('new user contains errors');
      return errorUtils.updateErrorMessage('error occurred during delete operation', newUser);
    }
    Logger.verbose('delete assumed successful');
    return newUser;

  },
  /**
   * wrapper to update user by id
   * @param user {ObjectId}
   * @param updateParams {{}}
   * @returns {Promise.<*>}
   */
  async updateUser(user, updateParams) {
    'use strict';
    Logger.info('request made to update user');
    Logger.verbose(`user to be updated ${JSON.stringify(user)}`);
    Logger.verbose(`params to be applied: ${JSON.stringify(updateParams)}`);
    try {
      const newUser = await User.findByIdAndUpdate(user, updateParams, {
        runValidators: true,
        new: true,
      });
      Logger.verbose('update succeeded without error');
      Logger.verbose(`new user ${JSON.stringify(newUser)}`);
      return newUser;
    } catch (err) {
      Logger.warn('error while updating user');
      Logger.verbose(`attempted to apply ${JSON.stringify(updateParams)}`);
      Logger.verbose(`to user ${JSON.stringify(user)}`);
      Logger.error(`error: ${err}`);
      return errorUtils.formatError('an error has occurred while updating user', err);
    }
  },
  /**
   * wrapper to fetch user by id
   * @param userId {ObjectId}
   * @returns {Promise.<*>}
   */
  async getUserById(userId) {
    'use strict';
    Logger.info('request recieved to fetch uer by id');
    Logger.verbose(`user id: ${JSON.stringify(userId)}`);
    try {
      const user = await User.findById(userId);
      Logger.verbose('user fetch completed without error');
      if (!user || _.isEmpty(user)) {
        Logger.warn('user is falsey');
        return errorUtils.formatError('user returned is not valid');
      }
      return user;
    } catch (err) {
      Logger.warn('error occurred while fetching user by id');
      Logger.error(`error: ${err}`);
      return errorUtils.formatError('error occurred while fetching user', err);
    }
  },
  /**
   * Wrapper around address validation
   * @param addressDetails {Object} the details to be validated
   * @returns {Promise.<*>} Address if successful, false otherwise
   *
   * @memberOf module:user/service
   */
  async validateAddress(addressDetails) {
    'use strict';
    Logger.info('attempting to validate address');
    Logger.verbose(`details to be validated: ${JSON.stringify(addressDetails)}`);
    const formattedAddress = await addressService.validateAddress(addressDetails);
    if (formattedAddress.error) {
      Logger.warn('an error occurred while validating the address');
      Logger.warn(`error message: ${formattedAddress.error.message}`);
      return formattedAddress;
    }
    return formattedAddress;
  },
  /**
   * Wrapper to delete user by id
   * @param userId {ObjectId}
   * @returns {Promise.<*>}
   */
  async deleteUser(userId) {
    'use strict';
    Logger.info(`request made ro delete user with id ${userId}`);
    try {
      await User.findByIdAndRemove({_id: userId});
      Logger.verbose('user assumed deleted');
      return true;
    } catch (err) {
      Logger.warn('there was an error while deleting the user');
      Logger.error(`error: ${err}`);
      return errorUtils.formatError('error while deleting user', err);
    }
  }
};

/**
 * This function sanitises inputs to be saved
 * @param details{{email}}
 * @returns {{email}}
 */
function formatDetails(details) {
  'use strict';
  return {
    email: details.email
  };
}
