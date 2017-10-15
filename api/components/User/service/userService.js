const Logger   = require('@util/Logger')('USER_SERVICE');
const User     = require('@user/models/User').model;
const Address = require('@Address/models/Address').model;
const addressService = require('@Address/service/addressService');

module.exports= exports = {
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
  async handleAddAddress(user, address){
    'use strict';
    Logger.info(`request`);
    Logger.info(`request made to add address to user`);
    Logger.verbose(`user: ${user}`);
    Logger.verbose(`address: ${JSON.stringify(address)}`);
    const validAddress = await exports.validateAddress(address);
    if(!validAddress){
      Logger.warn(`address is not valid, aborting`);
      return false;
    }
    const updatedUser = await exports.addAddress(user, validAddress);
    if(!updatedUser){
      Logger.warn(`returend user is not valid, aborting`);
      return false;
    }
    Logger.info(`address assumed added`);
    return updatedUser._doc;
  },
  async addAddress(user, address){
    'use strict';
    Logger.info(`request made to add address to user`);
    Logger.verbose(`user: ${user}`);
    Logger.verbose(`address: ${JSON.stringify(address)}`);
    try {
      const updatedUser = await User.findByIdAndUpdate(user, {$push: {addresses: address}}, {safe: true, new: true});
      Logger.verbose(`update completed without error`);
      Logger.verbose(`updated doc: ${JSON.stringify(updatedUser)}`);
      return updatedUser;
    } catch (e) {
      Logger.warn(`error during object creation`);
      Logger.error(`error: ${e}`);
      return false;
    }

  },
  async validateAddress(addressDetails){
    'use strict';
    Logger.info(`attempting to validate address`);
    Logger.verbose(`details to be validated: ${JSON.stringify(addressDetails)}`);
    try{
      return await addressService.validateAddress(addressDetails);
    }catch(err){
      Logger.warn(`there was an error while validating the address`);
      Logger.error(`error: ${JSON.stringify(err)}`);
      return false;
    }
  }
};

function formatDetails(details) {
  'use strict';
  return {
    email: details.email
  }
}
