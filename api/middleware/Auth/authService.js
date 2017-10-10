const admin = require('firebase-admin');
const Logger = require('@util/Logger')('AUTH_SERVICE');
module.exports = {
  async validateToken(token){
    'use strict';
    Logger.info(`request received to validate authentication token`);
    if(!token || typeof token !== 'string' || token.length < 1){
      Logger.warn(`token is not valid format`);
      return false;
    }
    Logger.verbose(`token is valid format, testing validity`);
    try{
      return await admin.auth().verifyIdToken(token);
    }catch (err){
      Logger.error(`an error has occurred while validating firebase token`);
      return false;
    }

  }
};
