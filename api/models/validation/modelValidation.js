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
  if(strValue.toString().length === 12) return false;
  try {
    Logger.info(`checking if ${strValue} is valid object id`);
    return new RegExp(/^[a-fA-F0-9]{24}$/).test(strValue)
  } catch (e) {
    Logger.warn(`not valid id`);
    Logger.warn(`${JSON.stringify(e)}`);
    return false;
  }
}

module.exports = {validateEmail, validateObjectId};
