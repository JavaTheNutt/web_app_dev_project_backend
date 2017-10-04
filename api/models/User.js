const mongoose = require('mongoose');
const Logger = require('@root/util/Logger');

const Address = require('@root/models/Address').schema;

const UserSchema = mongoose.Schema({
  email: {
    type: String
  },
  firstName: String,
  surname: String,
  addresses:[Address]
});
const UserModel = mongoose.model('User', UserSchema);

module.exports = {schema: UserSchema, model: UserModel};
