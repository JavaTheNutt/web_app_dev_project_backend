/**
 * This module contains validations that will be shared between Models
 */
const Logger         = require('@root/util/Logger')('MODEL_VALIDATION');
const emailValidator = require('email-validator');
const ObjectId = require('mongoose').Types.ObjectId;
function validateEmail(emailAddress) {
  Logger.info(`checking if ${emailAddress} is valid`);
  return emailValidator.validate(emailAddress);
}

function validateObjectId(strValue) {
  'use strict';
  try {
    Logger.info(`checking if ${strValue} is valid object id`);
    Logger.verbose(`checking if ${new ObjectId(strValue).toString()} is equal to ${strValue}`);
    return new ObjectId(strValue).toString() === strValue;
  } catch (e) {
    Logger.warn(`not valid id`);
    return false;
  }
}

module.exports = {validateEmail, validateObjectId};
