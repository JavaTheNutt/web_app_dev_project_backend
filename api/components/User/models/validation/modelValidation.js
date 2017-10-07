/**
 * This module contains validations that will be shared between Models
 */
const Logger         = require('@root/util/Logger')('MODEL_VALIDATION');
const emailValidator = require('email-validator');
const ObjectId       = require('mongoose').Types.ObjectId;
const mongoose       = require('mongoose');

function validateEmail(emailAddress) {
  Logger.info(`checking if ${emailAddress} is valid`);
  return emailValidator.validate(emailAddress);
}

function validateOptionalObjectId(id) {
  'use strict';
  Logger.info(`checking if optional id is in valid format`);
  if (id === null || id === undefined || id === '') {
    return true;
  }
  return validateObjectId(id);

}

function validateObjectId(strValue) {
  'use strict';
  Logger.info(`checking if ${strValue} is valid object id`);
  return /^[a-fA-F0-9]{24}$/.test(strValue) /*&& mongoose.Types.ObjectId.isValid(strValue)*/;
}

module.exports = {
  validateEmail,
  validateObjectId,
  validateOptionalObjectId
};
