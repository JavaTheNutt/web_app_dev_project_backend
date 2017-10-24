const Logger   = require('@util/Logger')('ADDRESS_SERVICE');
const User     = require('@user/models/User').model;
const Address  = require('@Address/models/Address').model;
const _        = require('lodash');
const errorUtils = require('@util/errorUtils');
module.exports = exports = {
  /**
   * Create and validate a new address
   * @param addressDetails the details to be validated
   * @returns {Promise.<Object>} the created address if successful, false otherwise
   */
  async validateAddress(addressDetails) {
    'use strict';
    Logger.info(`attempting to validate address`);
    Logger.verbose(`details to be validated: ${JSON.stringify(addressDetails)}`);
    try {
      const formattedDetails = exports.formatDetails(addressDetails);
      if(formattedDetails.error){
        Logger.warn(`an error occurred while formatting address`);
        return formattedDetails
      }
      Logger.verbose(`newly formatted Details: ${JSON.stringify(formattedDetails)}`);
      const newAddress = new Address(formattedDetails);
      Logger.verbose(`address created without error`);
      Logger.verbose(`new address: ${JSON.stringify(newAddress)}`);
      await newAddress.validate();
      Logger.verbose(`address assumed valid`);
      return newAddress;
    } catch (err) {
      Logger.warn(`there was an error while validating the address`);
      Logger.error(`error: ${JSON.stringify(err)}`);
      return errorUtils.formatError('address validation failed', err);
    }
  },
  /**
   *
   * @param addressDetails
   * @returns {*}
   */
  formatDetails(addressDetails) {
    'use strict';
    Logger.info(`attempting to format address details`);
    Logger.verbose(`details: ${JSON.stringify(addressDetails)}`);
    if (!addressDetails.text) {
      Logger.warn(`no address text provided, aborting`);
      return errorUtils.formatError('address text is required');
    }
    Logger.verbose(`address text is provided, procceding`);
    const detailsToBeReturned = {
      text: addressDetails.text
    };
    if (!addressDetails.geo || _.isEmpty(addressDetails.geo)) {
      Logger.warn(`no geospatial coodinates provided, using defaults`);
      detailsToBeReturned.loc = {
        type: 'Point',
        coordinates: [0, 0]
      };
    } else {
      Logger.verbose(`geospatial coordinates provided`);
      detailsToBeReturned.loc = {
        type: addressDetails.geo.type || 'Point',
        coordinates: [addressDetails.geo.lat || 0, addressDetails.geo.lng || 0]
      };
    }
    Logger.verbose(`returning details: ${JSON.stringify(detailsToBeReturned)}`);
    return detailsToBeReturned
  }
};

