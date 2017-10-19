require('module-alias/register');
const chai   = require('chai');
const expect = chai.expect;
chai.use(require('sinon-chai'));
const sinon    = require('sinon');
const ObjectId = require('mongoose').Types.ObjectId;

const sandbox        = sinon.sandbox.create();
const addressService = require('@Address/service/addressService');
const User           = require('@user/models/User').model;
const Address        = require('@Address/models/Address').model;

describe('address service', () => {
  'use strict';
  describe('validate address', () => {
    let validateStub, addressDetails;
    beforeEach(() => {
      addressDetails = {
        text: '123 fake street'
      };
      validateStub   = sandbox.stub(Address.prototype, 'validate');
    });
    it('should return true when an address is valid', async () => {
      validateStub.resolves(true);
      const result = await addressService.validateAddress(addressDetails);
      expect(result).to.exist;
      expect(validateStub).to.be.calledOnce;
      expect(result._id).to.exist;
    });
    it('should handle errors gracefully', async () => {
      validateStub.throws(Error('an error has occurred'));
      const result = await addressService.validateAddress(addressDetails);
      expect(result).to.not.exist;
      expect(validateStub).to.be.calledOnce;
    });
    afterEach(() => {
      sandbox.restore();
    })
  });
  describe('format details', () => {
    let addressDetails, expectedResponse;
    beforeEach(() => {
      addressDetails   = {
        text: '123, fake street',
        geo: {
          lat: 10,
          lng: 10
        }
      };
      expectedResponse = {
        text: addressDetails.text,
        loc: {
          type: 'Point',
          coordinates: [addressDetails.geo.lat, addressDetails.geo.lng]
        }
      };
    });
    it('should correctly format the details', () => {
      const newDetails = addressService.formatDetails(addressDetails);
      expect(newDetails).to.eql(expectedResponse);
    });
    it('should correctly set default values when no coordinates are provided', () => {
      addressDetails.geo   = null;
      expectedResponse.loc = {
        type: 'Point',
        coordinates: [0, 0]
      };
      const result         = addressService.formatDetails(addressDetails);
      expect(result).to.eql(expectedResponse);
    });
    it('should return false when there is no text provided', () => {
      addressDetails.text = null;
      const result        = addressService.formatDetails(addressDetails);
      expect(result).to.be.false;
    });
  })
});
