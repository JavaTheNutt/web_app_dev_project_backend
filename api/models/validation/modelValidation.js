/**
 * This module contains validations that will be shared between Models
 */
const Logger         = require('@root/util/Logger')('MODEL_VALIDATION');
const emailValidator = require('email-validator');

function validateEmail(emailAddress) {
  Logger.info(`checking if ${emailAddress} is valid`);
  return emailValidator.validate(emailAddress);
}

module.exports = {validateEmail};
