const mongoose = require('mongoose');
const Logger   = require('@util/Logger')('ADDRESS_MODEL');

const AddressSchema = mongoose.Schema({
  text: {
    type: String,
    required: true
  },
  loc: {
    type: {type: String, enum: ['Point'], default: 'Point'},
    coordinates: {type: [Number], default: [0,0]}
  }
});
AddressSchema.index({loc: '2dsphere'});

const AddressModel = mongoose.model('Address', AddressSchema);
module.exports = {schema: AddressSchema, model: AddressModel};
