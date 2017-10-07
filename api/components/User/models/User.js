/**
 * User Model
 * @module user/models
 */
const mongoose        = require('mongoose');
const Logger          = require('@root/util/Logger');
const emailValidation = require('@user/models/validation/modelValidation').validateEmail;
const Address         = require('@user/models/Address').schema;

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
  addresses: [Address]
});
const UserModel  = mongoose.model('User', UserSchema);

module.exports = {
  schema: UserSchema,
  model: UserModel
};
