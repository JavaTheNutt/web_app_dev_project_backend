/**
 * This is the test suite for the UserAuth model
 */
require('module-alias/register');
const chai   = require('chai');
const expect = chai.expect;
chai.use(require('sinon-chai'));
const ObjectID = require('mongoose').Types.ObjectId;
const UserAuth = require('@Auth/models/UserAuth').model;

describe('UserAuth model', () => {
    let userAuthDetails = {};
    const userId        = ObjectID();
    beforeEach(() => {
        userAuthDetails = {
            email: 'test@test.com',
            user: userId,
            firebaseId: 'uu0SMEK2itPcoQrvpfKXXOjZ5cL2'
        };
    });
    it('should create a user auth model with all details', () => {
        const userAuth = new UserAuth(userAuthDetails);
        expect(userAuth.validateSync()).to.not.exist;
        expect(userAuth.user.toString()).to.equal(userId.toString());
        expect(userAuth.email).to.equal(userAuthDetails.email);
        expect(userAuth.firebaseId).to.equal(userAuthDetails.firebaseId);
    });
    it('should create a user auth model with no user id', () => {
        userAuthDetails.user = null;
        const userAuth       = new UserAuth(userAuthDetails);
        expect(userAuth.validateSync()).to.not.exist;
        expect(userAuth.user).to.not.exist;
        expect(userAuth.email).to.equal(userAuthDetails.email);
        expect(userAuth.firebaseId).to.equal(userAuthDetails.firebaseId);
    });
    it('should fail when there is no email passed', () => {
        userAuthDetails.email = '';
        const err             = new UserAuth(userAuthDetails).validateSync();
        expect(err).to.exist;
        expect(err.message).to.equal('UserAuth validation failed: email: Path `email` is required.');
    });
    it('should fail when there is no firebase id passed', () => {
        userAuthDetails.firebaseId = '';
        const err                  = new UserAuth(userAuthDetails).validateSync();
        expect(err).to.exist;
        expect(err.message).to.equal('UserAuth validation failed: firebaseId: Path `firebaseId` is required.');
    });
    it('should fail when email address is poorly formed', () => {
        userAuthDetails.email = 'joe';
        const err             = new UserAuth(userAuthDetails).validateSync();
        expect(err).to.exist;
        expect(err.message).to.equal('UserAuth validation failed: email: Email is poorly formatted');
    });
    it('should fail when user id is poorly formed', () => {
        userAuthDetails.user = 'wwwwwwwwwwww';
        const err            = new UserAuth(userAuthDetails).validateSync();
        expect(err).to.exist;
        expect(err.message).to.equal('UserAuth validation failed: user: Object Id is improperly formatted');
    });
});
