/**
 * User Model
 * @module user/models
 */
const mongoose        = require('mongoose');
const emailValidation = require('@user/models/validation/modelValidation').validateEmail;
const Address         = require('@Address/models/Address').schema;

const UserSchema = mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    validate: {
      validator: emailValidation,
      message: 'Email is poorly formatted'
    }
  },
  firstName: String,
  surname: String,
  addresses: [Address]
}, {collection: 'users'});
const UserModel  = mongoose.model('User', UserSchema);

module.exports = {
  schema: UserSchema,
  model: UserModel
};
