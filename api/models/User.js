const mongoose = require('mongoose');
const Logger = require('@root/util/Logger');
const emailValidation = require('@root/models/validation/modelValidation').validateEmail;
const Address = require('@root/models/Address').schema;

const UserSchema = mongoose.Schema({
  email: {
    type: String,
    required: true,
    validate: {
      validator: emailValidation,
      message: 'Email is poorly formatted'
    }
  },
  firstName: String,
  surname: String,
  addresses:[Address]
});
const UserModel = mongoose.model('User', UserSchema);

module.exports = {schema: UserSchema, model: UserModel};
