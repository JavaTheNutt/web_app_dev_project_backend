require('module-alias/register');
const chai   = require('chai');
const expect = chai.expect;
chai.use(require('sinon-chai'));
const sinon    = require('sinon');
const ObjectId = require('mongoose').Types.ObjectId;

const sandbox        = sinon.sandbox.create();
const userService    = require('@user/service/userService');
const User           = require('@user/models/User').model;
const Address        = require('@Address/models/Address').model;
const addressService = require('@Address/service/addressService');
const errorUtils = require('@util/errorUtils');
describe('user service', () => {
  'use strict';
  describe('user creation', () => {
    let userDetails, saveStub, savedResponse, fakeError, err;
    beforeEach(() => {
      userDetails   = {email: 'test@test.com'};
      savedResponse = {
        _id: 'someidhere',
        email: 'test@test.com'
      };
      saveStub      = sandbox.stub(User.prototype, 'save');
      err = new Error('this is a firebase error');
      fakeError = errorUtils.formatError('an error occurred during the user save operation', err);
    });
    afterEach(() => {
      sandbox.restore();
    });
    it('should successfully return a newly created user when passed correct details', async () => {
      const res = await userService.createUser(userDetails);
      expect(saveStub).to.be.calledOnce;
      expect(res).to.have.own.keys('_id', 'email', 'addresses');
      expect(res._id.toString().length).to.equal(24);
      expect(Array.isArray(res.addresses)).to.be.true;
      expect(res.addresses.length).to.equal(0);
      expect(res.email).to.equal(userDetails.email);
    });
    it('should handle errors gracefully', async () => {
      saveStub.throws(err);
      const res = await userService.createUser(userDetails);
      expect(res).to.eql(fakeError);
    });
  });
  describe('delete user', ()=>{
    let findByIdAndRemoveStub, userId;
    beforeEach(()=>{
      findByIdAndRemoveStub = sandbox.stub(User, 'findByIdAndRemove');
      userId = ObjectId();
    });
    afterEach(()=>{
      sandbox.restore();
    });
    it('should return true when a user is successfully deleted', async ()=>{
      findByIdAndRemoveStub.resolves({_id: 'someidhere', email: 'test@test.com'});
      const result = await userService.deleteUser(userId);
      expect(result).to.be.true;
    });
    it('should return an error object to the user when the delete is unsuccessful', async()=>{
      const err = new Error('this is an error');
      findByIdAndRemoveStub.throws(err);
      const result = await userService.deleteUser(userId);
      expect(result).to.eql(errorUtils.formatError('error while deleting user', err));
    });
  });
  describe('handle add address', () => {
    let validateAddressStub, addAddressStub, fakeUserId, fakeAddress, validatedAddress, updatedUser, fakeError;
    beforeEach(() => {
      validateAddressStub = sandbox.stub(userService, 'validateAddress');
      addAddressStub      = sandbox.stub(userService, 'addAddress');
      fakeUserId          = ObjectId();
      fakeAddress         = {text: '123 fake street'};
      validatedAddress    = {data: fakeAddress};
      updatedUser         = {data:{email: 'test@test.com', addresses: [validatedAddress]}};
      fakeError = errorUtils.formatError('an error has occurred');
    });
    it('should handle address validation errors gracefully', async () => {
      validateAddressStub.resolves(fakeError);
      const result = await userService.handleAddAddress(fakeUserId, fakeAddress);
      expect(result).to.eql(fakeError);
    });
    it('should handle user update errors gracefully', async () => {
      validateAddressStub.resolves(validatedAddress);
      addAddressStub.resolves(fakeError);
      const result = await userService.handleAddAddress(fakeUserId, fakeAddress);
      expect(result).to.equal(fakeError);
    });
    it('should return an saved user object when passed correct details', async () => {
      validateAddressStub.resolves(validatedAddress);
      addAddressStub.resolves(updatedUser);
      const result = await userService.handleAddAddress(fakeUserId, fakeAddress);
      expect(result).to.eql(updatedUser);
    });
    afterEach(() => {
      sandbox.restore();
    });
  });
  describe('add address', () => {
    let addressDetails, updateStub, fakeUserId, fakeUser;
    beforeEach(() => {
      updateStub     = sandbox.stub(User, 'findByIdAndUpdate');
      fakeUserId     = ObjectId();
      addressDetails = {
        text: '123 fake street, fake town, fake country'
      };
      fakeUser       = {
        _id: fakeUserId,
        email: 'test@test.com',
        addresses: [addressDetails]
      }
    });
    it('should successfully add an address with just a name', async () => {
      updateStub.resolves(fakeUser);
      const response = await userService.addAddress(fakeUserId, addressDetails);
      expect(response).to.exist;
      expect(Array.isArray(response.addresses)).to.be.true;
      expect(response.addresses.length).to.equal(1);
      expect(updateStub).to.be.calledOnce;
    });
    it('should gracefully handle errors', async () => {
      const err = new Error('this is an error');
      updateStub.throws(err);
      const fakeError = errorUtils.formatError('an error occurred while updating the user', err);
      const response = await userService.addAddress(fakeUserId, addressDetails);
      expect(response).to.eql(fakeError);
    });
    afterEach(() => {
      sandbox.restore();
    })
  });
  describe('validate address', () => {
    let validateStub, addressDetails, validAddress;
    beforeEach(() => {
      validateStub   = sandbox.stub(addressService, 'validateAddress');
      addressDetails = {
        text: '123 fake street, fake town, fake country'
      };
      validAddress   = new Address(addressDetails);

    });
    it('should handle a correct validation', async () => {
      validateStub.resolves(validAddress);
      const res = await userService.validateAddress(addressDetails);
      expect(res).to.exist;
      expect(res._id).to.exist;
    });
    it('should handle invalid responses gracefully', async () => {
      const fakeErr = errorUtils.formatError('an error occurred while updating the user');
      validateStub.resolves(fakeErr);
      const res = await userService.validateAddress(addressDetails);
      expect(res).to.eql(fakeErr);
    });
    afterEach(() => {
      sandbox.restore();
    })
  })

});
