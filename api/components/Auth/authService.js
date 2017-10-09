const admin = require('firebase-admin');
const Logger = require('@util/Logger')('AUTH_SERVICE');
module.exports = {
  async validateToken(token){
    'use strict';
    Logger.info(`request received to validate authentication token`);
    const result = await admin.auth().verifyIdToken(token);
    Logger.info(`result is ${result}`);
    return result;
  }
};
