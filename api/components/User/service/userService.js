/**
 * Service for interacting with User data models
 * @module user/service
 */

const Logger         = require('@util/Logger')('USER_SERVICE');
const User           = require('@user/models/User').model;
const Address        = require('@Address/models/Address').model;
const addressService = require('@Address/service/addressService');

module.exports = exports = {
  /**
   * Create a new user record
   * @param userDetails {object} the details required to make a new user
   * @returns {Promise.<Object>}
   * @memberOf module:user/service
   */
  async createUser(userDetails) {
    'use strict';
    Logger.info(`request to create user recieved`);
    Logger.verbose(`details fo user to be created: ${JSON.stringify(userDetails)}`);
    const newUser = new User(formatDetails(userDetails));
    Logger.verbose(`created user: ${JSON.stringify(newUser)}`);
    try {
      await newUser.save();
      Logger.verbose(`user saved without error`);
      return {data:newUser._doc};
    } catch (err) {
      Logger.warn(`user save failed`);
      Logger.error(`error: ${err}`);
      return {error:{message:'an error occurred during the user save operation', err}};
    }
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
    Logger.info(`request made to add address to user`);
    Logger.verbose(`user: ${user}`);
    Logger.verbose(`address: ${JSON.stringify(address)}`);
    const validAddress = await exports.validateAddress(address);
    if (validAddress.error) {
      Logger.warn(`address is not valid, aborting`);
      Logger.warn(`error: ${JSON.stringify(validAddress.error)}`);
      return validAddress;
    }
    const updatedUser = await exports.addAddress(user, validAddress);
    if (updatedUser.error) {
      Logger.warn(`returend user is not valid, aborting`);
      Logger.warn(`error: ${JSON.stringify(updatedUser.error)}`);
      return updatedUser;
    }
    Logger.info(`address assumed added`);
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
    Logger.info(`request made to add address to user`);
    Logger.verbose(`user: ${user}`);
    Logger.verbose(`address: ${JSON.stringify(address)}`);
    try {
      const updatedUser = await User.findByIdAndUpdate(user, {$push: {addresses: address}}, {
        safe: true,
        new: true
      });
      Logger.verbose(`update completed without error`);
      Logger.verbose(`updated doc: ${JSON.stringify(updatedUser)}`);
      return {data:updatedUser.data};
    } catch (err) {
      Logger.warn(`error during object creation`);
      Logger.error(`error: ${err}`);
      return {error:{message:'an error occurred while updating the user', err}};
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
    Logger.info(`attempting to validate address`);
    Logger.verbose(`details to be validated: ${JSON.stringify(addressDetails)}`);
    const formattedAddress = await addressService.validateAddress(addressDetails);
    if(formattedAddress.error){
      Logger.warn(`an error occurred while validating the address`);
      Logger.warn(`error message: ${formattedAddress.error.message}`);
      return {error: formattedAddress.error}
    }
    return {data:formattedAddress};

  }
};

function formatDetails(details) {
  'use strict';
  return {
    email: details.email
  }
}
