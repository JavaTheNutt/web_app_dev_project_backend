/**
 * This module contains validations that will be shared between Models
 */
const Logger         = require('@root/util/Logger')('MODEL_VALIDATION');
const emailValidator = require('email-validator');
const ObjectId = require('mongoose').Types.ObjectId;
const mongoose = require('mongoose');

function validateEmail(emailAddress) {
  Logger.info(`checking if ${emailAddress} is valid`);
  return emailValidator.validate(emailAddress);
}
function validateOptionalObjectId(id){
  'use strict';
  if(id === null || id === undefined || id === '') return true;
  return validateObjectId(id);

}
function validateObjectId(strValue) {
  'use strict';
  try {
    Logger.info(`checking if ${strValue} is valid object id`);
    //pretty sure the second check is unnecessary.
    return /^[a-fA-F0-9]{24}$/.test(strValue) /*&& mongoose.Types.ObjectId.isValid(strValue)*/;
  } catch (e) {
    Logger.warn(`not valid id`);
    Logger.warn(`${JSON.stringify(e)}`);
    return false;
  }
}

module.exports = {validateEmail, validateObjectId, validateOptionalObjectId};
