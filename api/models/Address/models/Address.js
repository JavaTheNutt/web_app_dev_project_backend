/**
 * Address model
 * @module address/models
 */

const mongoose = require('mongoose');

const AddressSchema = mongoose.Schema({
    text: {
        type: String,
        required: true
    },
    loc: {
        type: {
            type: String,
            enum: ['Point']
        },
        coordinates: {
            type: [Number]
        }
    }
});
AddressSchema.index({loc: '2dsphere'});

const AddressModel = mongoose.model('Address', AddressSchema);
module.exports     = {
    schema: AddressSchema,
    model: AddressModel
};
