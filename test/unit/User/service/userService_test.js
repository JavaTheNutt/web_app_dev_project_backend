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
const authService    = require('@Auth/service/authService');
const errorUtils     = require('@util/errorUtils');
describe('user service', () => {
    'use strict';

    /*describe('handle user creation', () => {
        let createUserStub, createAuthStub, setCustomUserClaim, sendStub, sendStubContainer, statusStub, deleteUserStub,
            deleteAuthStub, setCustomClaimsStub;
        beforeEach(() => {
            createUserStub = sandbox.stub(userService, 'createUser');
            createAuthStub = sandbox.stub(authService, 'createAuthUser');
        });
        it('should call create user, create auth, and create claims');
        it('should not call create auth or create claims if the user save fails');
        it('should not call create claims if auth save fails, but should call delete user');
        it('should call both delete user and delete auth if adding claims fails');
    });*/
    describe('user creation', () => {
        let userDetails, saveStub, fakeError, err;
        beforeEach(() => {
            userDetails = {email: 'test@test.com'};
            saveStub    = sandbox.stub(User.prototype, 'save');
            err         = new Error('this is a firebase error');
            fakeError   = errorUtils.formatError('an error occurred during the user save operation', err);
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
    describe('delete user', () => {
        let findByIdAndRemoveStub, userId;
        beforeEach(() => {
            findByIdAndRemoveStub = sandbox.stub(User, 'findByIdAndRemove');
            userId                = ObjectId();
        });
        afterEach(() => {
            sandbox.restore();
        });
        it('should return true when a user is successfully deleted', async () => {
            findByIdAndRemoveStub.resolves({
                _id: 'someidhere',
                email: 'test@test.com'
            });
            const result = await userService.deleteUser(userId);
            expect(result).to.be.true;
        });
        it('should return an error object to the user when the delete is unsuccessful', async () => {
            const err = new Error('this is an error');
            findByIdAndRemoveStub.throws(err);
            const result = await userService.deleteUser(userId);
            expect(result).to.eql(errorUtils.formatError('error while deleting user', err));
        });
    });
    describe('update user', () => {
        let updateStub, userId, updateParams;
        beforeEach(() => {
            updateStub   = sandbox.stub(User, 'findByIdAndUpdate');
            updateParams = {
                firstName: 'joe',
                surname: 'bloggs'
            };
            userId       = ObjectId();
        });
        afterEach(() => {
            sandbox.restore();
        });
        it('should update a user to the correct values', async () => {
            const updatedUser = {
                _id: userId,
                firstName: updateParams.firstName,
                surname: updateParams.surname,
                email: 'test@test.com'
            };
            updateStub.resolves(updatedUser);
            const result = await userService.updateUser(userId, updateParams);
            expect(result).to.eql(updatedUser);
        });
        it('should handle update errors gracefully', async () => {
            const err = new Error('i am an error');
            updateStub.throws(err);
            const result = await userService.updateUser(userId, updateParams);
            expect(result).to.eql(errorUtils.formatError('an error has occurred while updating user', err));
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
            updatedUser         = {
                data: {
                    email: 'test@test.com',
                    addresses: [validatedAddress]
                }
            };
            fakeError           = errorUtils.formatError('an error has occurred');
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
            };
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
            const response  = await userService.addAddress(fakeUserId, addressDetails);
            expect(response).to.eql(fakeError);
        });
        afterEach(() => {
            sandbox.restore();
        });
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
        });
    });
    describe('fetch by user id', () => {
        const userId = ObjectId();
        let findStub, returnedUser;
        beforeEach(() => {
            findStub     = sandbox.stub(User, 'findById');
            returnedUser = {
                _id: userId,
                email: 'test@test.com'
            };
        });
        afterEach(() => {
            sandbox.restore();
        });
        it('should return the user who made the request', async () => {
            findStub.resolves(returnedUser);
            const result = await userService.getUserById(userId);
            expect(result).to.eql(returnedUser);
        });
        it('should a properly formatted error in case of error', async () => {
            const err = new Error('find user by id failed');
            findStub.throws(err);
            const result = await userService.getUserById(userId);
            expect(result).to.eql(errorUtils.formatError('error occurred while fetching user', err));
        });
        it('should return a properly formatted error when returned user is undefined', async () => {
            findStub.resolves(undefined);
            const result = await userService.getUserById(userId);
            expect(result).to.eql(errorUtils.formatError('user returned is not valid'));
        });
        it('should return a properly formatted error when returned user is empty', async () => {
            findStub.resolves({});
            const result = await userService.getUserById(userId);
            expect(result).to.eql(errorUtils.formatError('user returned is not valid'));
        });
    });
    describe('delete address', () => {
        const addressId = ObjectId();
        const userId    = ObjectId();
        let returnedUser, deleteStub;
        beforeEach(() => {
            returnedUser = {
                _id: userId,
                email: 'test@test.com',
                addresses: [{
                    _id: addressId,
                    text: 'some text here',
                    loc: {
                        type: 'Point',
                        coordinates: [10, 10]
                    }
                }]
            };
            deleteStub   = sandbox.stub(userService, 'updateUser');
        });
        afterEach(() => {
            sandbox.restore();
        });
        it('should delete an address when passed a valid object id', async () => {
            deleteStub.resolves(returnedUser);
            const result = await userService.deleteAddressById(userId, addressId);
            expect(result).to.eql(returnedUser);
        });
        it('should handle errors in the delete process', async () => {
            const err = new Error('this is an error in the update process');
            deleteStub.resolves(errorUtils.formatError('an error occurred during update', err));
            const result = await userService.deleteAddressById(userId, addressId);
            expect(result).to.eql(errorUtils.formatError('error occurred during delete operation', err));
        });
    });
    describe('fetch addresses', () => {
        let fetchUserStub, returnedUser, userId;
        beforeEach(() => {
            userId        = ObjectId();
            returnedUser  = {
                _id: userId,
                email: 'test@test.com',
                addresses: [{
                    _id: 'someidhere',
                    loc: {}
                }, {
                    _id: 'someotheridhere',
                    loc: {}
                }]
            };
            fetchUserStub = sandbox.stub(userService, 'getUserById');
        });
        afterEach(() => {
            sandbox.restore();
        });
        it('should return a list of addresses when availible', async () => {
            fetchUserStub.resolves(returnedUser);
            const result = await userService.fetchAddresses(userId);
            expect(result).to.eql(returnedUser.addresses);
        });
        it('should alert the user if they have no address records', async () => {
            returnedUser.addresses = null;
            fetchUserStub.resolves(returnedUser);
            const result = await userService.fetchAddresses(userId);
            expect(result).to.eql(errorUtils.formatError('the user has no addresses'));
        });
        it('should deal with errors gracefully', async () => {
            const err = new Error('im an error');
            fetchUserStub.resolves(errorUtils.formatError('error occurred while fetching user', err));
            const result = await userService.fetchAddresses(userId);
            expect(result).to.eql(errorUtils.formatError('error occurred while fetching user', err));
        });
    });
    describe('fetch single address', () => {
        let fetchUserStub, returnedAddresses, userId, address1, address2;
        beforeEach(() => {
            userId            = ObjectId();
            address1          = {
                _id: ObjectId(),
                loc: {}
            };
            address2          = {
                _id: ObjectId(),
                loc: {}
            };
            returnedAddresses = [address1, address2];
            fetchUserStub     = sandbox.stub(userService, 'fetchAddresses');
        });
        afterEach(() => {
            sandbox.restore();
        });
        it('should return a list of addresses when availible', async () => {
            fetchUserStub.resolves(returnedAddresses);
            const result = await userService.fetchSingleAddress(userId, address1._id);
            expect(result).to.eql(address1);
        });
        it('should alert the user if they have no address records', async () => {
            fetchUserStub.resolves([]);
            const result = await userService.fetchSingleAddress(userId, address1._id);
            expect(result).to.eql(errorUtils.formatError('address is not found'));
        });
        it('should deal with errors gracefully', async () => {
            const err = new Error('im an error');
            fetchUserStub.resolves(errorUtils.formatError('error occurred while fetching user', err));
            const result = await userService.fetchSingleAddress(userId);
            expect(result).to.eql(errorUtils.formatError('error occurred while fetching user', err));
        });
    });
});
