const Logger   = require('@util/Logger')('ADDRESS_SERVICE');
const User     = require('@user/models/User').model;
const Address  = require('@Address/models/Address').model;
module.exports = exports = {
  /**
   * Create and validate a new address
   * @param addressDetails the details to be validated
   * @returns {Promise.<void>} the created address if successful, false otherwise
   */
  async validateAddress(addressDetails) {
    'use strict';
    Logger.info(`attempting to validate address`);
    Logger.verbose(`details to be validated: ${JSON.stringify(addressDetails)}`);
    try {
      const newAddress = new Address(formatDetails(addressDetails));
      Logger.verbose(`address created without error`);
      Logger.verbose(`new address: ${JSON.stringify(newAddress)}`);
      await newAddress.validate();
      Logger.verbose(`address assumed valid`);
      return newAddress;
    } catch (err) {
      Logger.warn(`there was an error while validating the address`);
      Logger.error(`error: ${JSON.stringify(err)}`);
    }
  }
};

function formatDetails(addressDetails) {
  'use strict';
  Logger.info(`attempting to format address details`);
  Logger.verbose(`details: ${JSON.stringify(addressDetails)}`);
  return {
    text: addressDetails.text,
    loc: addressDetails.loc
  }
}
