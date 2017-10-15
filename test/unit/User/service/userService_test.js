require('module-alias/register');
const chai   = require('chai');
const expect = chai.expect;
chai.use(require('sinon-chai'));
const sinon    = require('sinon');
const ObjectId = require('mongoose').Types.ObjectId;

const sandbox     = sinon.sandbox.create();
const userService = require('@user/service/userService');
const User        = require('@user/models/User').model;
const Address     = require('@user/models/Address').model;
describe('user service', () => {
  'use strict';
  describe('user creation', () => {
    let userDetails, saveStub, savedResponse;
    beforeEach(() => {
      userDetails   = {email: 'test@test.com'};
      savedResponse = {
        _id: 'someidhere',
        email: 'test@test.com'
      };
      saveStub      = sandbox.stub(User.prototype, 'save');
    });
    afterEach(() => {
      sandbox.restore();
    });
    it('should successfully return a newly created user when passed correct details', async () => {
      const res = await userService.createUser(userDetails);
      expect(saveStub).to.be.calledOnce;
      expect(res._doc).to.have.own.keys('_id', 'email', 'addresses');
      expect(res._doc._id.toString().length).to.equal(24);
      expect(Array.isArray(res._doc.addresses)).to.be.true;
      expect(res._doc.addresses.length).to.equal(0);
      expect(res._doc.email).to.equal(userDetails.email);
    });
    it('should handle errors gracefully', async () => {
      saveStub.throws(Error('an error has occurred'));
      const res = await userService.createUser(userDetails);
      expect(res).to.not.exist;
    });
  });
  describe('add address', () => {
    let addressDetails, updateStub, validateAddressStub, fakeUserId, fakeUser;
    beforeEach(() => {
      updateStub     = sandbox.stub(User, 'findByIdAndUpdate');
      fakeUserId     = ObjectId();
      validateAddressStub =sandbox.stub(Address.prototype, 'validate');
      addressDetails = {
        text: '123 fake street, fake town, fake country'/*,
        loc: {
          type: 'Point',
          coordinates: [10, 10]
        }*/
      };
      fakeUser       = {
        _id: fakeUserId,
        email: 'test@test.com',
        addresses: [addressDetails]
      }
    });
    it('should successfully add an address with just a name', async () => {
      //addressDetails.loc = null;
      updateStub.resolves(fakeUser);
      validateAddressStub.resolves(true);
      const response = await userService.addAddress(fakeUserId, addressDetails);
      expect(response).to.exist;
      expect(Array.isArray(response.addresses)).to.be.true;
      expect(response.addresses.length).to.equal(1);
      expect(updateStub).to.be.calledOnce;
    });
    afterEach(() => {
      sandbox.restore();
    })
  })
});
