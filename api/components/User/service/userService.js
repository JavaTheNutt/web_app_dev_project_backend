const Logger   = require('@util/Logger')('USER_SERVICE');
const User     = require('@user/models/User').model;
module.exports = {
  async createUser(userDetails) {
    'use strict';
    Logger.info(`request to create user recieved`);
    Logger.verbose(`details fo user to be created: ${JSON.stringify(userDetails)}`);
    const newUser = new User(formatDetails(userDetails));
    Logger.verbose(`created user: ${JSON.stringify(newUser)}`);
    try {
      await newUser.save();
      Logger.verbose(`user saved without error`);
      return newUser;
    } catch (err) {
      Logger.warn(`user save failed`);
      Logger.error(`error: ${err}`);
      return null;
    }
  }
};

function formatDetails(details) {
  'use strict';
  return {
    email: details.email
  }
}
