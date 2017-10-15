const Logger   = require('@util/Logger')('USER_SERVICE');
const User     = require('@user/models/User').model;
const Address = require('@user/models/Address').model;
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
  },
  async addAddress(user, address){
    'use strict';
    Logger.info(`request made to add address to user`);
    Logger.verbose(`user: ${user}`);
    Logger.verbose(`address: ${JSON.stringify(address)}`);
    const addressToBeAdded = new Address(address);
    try {
      const addressValid = await addressToBeAdded.validate();
      Logger.verbose(`address validation completed without error`);
      if(!addressValid){
        Logger.warn(`address is invalid`);
        return false;
      }
      Logger.verbose(`address assumed valid`);
      const updatedUser = await User.findByIdAndUpdate(user, {$push: {addresses: addressToBeAdded}}, {safe: true, new: true});
      Logger.verbose(`update completed without error`);
      Logger.verbose(`updated doc: ${JSON.stringify(updatedUser)}`);
      return updatedUser;
    } catch (e) {
      Logger.warn(`erorr during object creation`);
      Logger.error(`error: ${e}`);
    }

  }
};

function formatDetails(details) {
  'use strict';
  return {
    email: details.email
  }
}
