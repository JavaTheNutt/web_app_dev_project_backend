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
  })
});
