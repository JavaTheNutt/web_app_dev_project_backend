/**
 * This module contains validations that will be shared between Models
 * @module user/models/validation
 */
const Logger         = require('@root/util/Logger')('MODEL_VALIDATION');
const emailValidator = require('email-validator');

//fixme add integration tests for validation
/**
 * Check if an email is valid
 * @param emailAddress {String} the address to be checked
 * @returns {boolean} true if email valid, false otherwise
 * @memberOf module:user/models/validation
 */
function validateEmail(emailAddress) {
    Logger.info(`checking if ${emailAddress} is valid`);
    return emailValidator.validate(emailAddress);
}

/**
 * Validate an optional ObjectId
 * @param id {String} the id to be validated
 * @returns {boolean} true if id does not exist, or is a 24 char hex string, false otherwise
 * @memberOf module: user/models/validation
 */
function validateOptionalObjectId(id) {
    'use strict';
    Logger.info('checking if optional id is in valid format');
    if (id === null || id === undefined || id === '') {
        return true;
    }
    return validateObjectId(id);
}

/**
 * Validate a mandatory ObjectId
 * @param id {String} the id to be validated
 * @returns {boolean} true if id is a 24 char hex string, false otherwise
 * @memberOf module: user/models/validation
 */
function validateObjectId(id) {
    'use strict';
    Logger.info(`checking if ${id} is valid object id`);
    return /^[a-fA-F0-9]{24}$/.test(id) /*&& mongoose.Types.ObjectId.isValid(strValue)*/;
}

/**
 * Export public functions
 * @type {{validateEmail: module:user/models/validation.validateEmail, validateObjectId: module.validateObjectId,
 *     validateOptionalObjectId: module.validateOptionalObjectId}}
 */
module.exports = {
    validateEmail,
    validateObjectId,
    validateOptionalObjectId
};
