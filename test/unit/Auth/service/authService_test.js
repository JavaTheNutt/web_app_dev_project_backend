require('module-alias/register');
const chai   = require('chai');
const expect = chai.expect;
chai.use(require('sinon-chai'));
const sinon       = require('sinon');
const ObjectID    = require('mongoose').Types.ObjectId;
const admin       = require('firebase-admin');
const sandbox     = sinon.sandbox.create();
const authService = require('@Auth/service/authService');
const userAuth    = require('@Auth/models/UserAuth').model;
describe('auth service', () => {
  'use strict';
  describe('handle claim validation', () => {
    let token = {
      sub: 'somefirebaseid',
      email: 'test@test.com'
    };
    let fetchedAuth;
    let checkCustomClaimsSpy, fetchUserIdFromFirebaseIdStub;
    beforeEach(() => {
      fetchedAuth                   = {
        _id: 'someidhere',
        email: 'test@test.com',
        user: 'someuseridhere',
        firebaseId: 'somefirebaseidhere'

      };
      checkCustomClaimsSpy          = sandbox.spy(authService, 'checkCustomClaims');
      fetchUserIdFromFirebaseIdStub = sandbox.stub(authService, 'fetchUserIdFromFirebaseId');

    });
    afterEach(() => {
      sandbox.restore();
    });
    it('should return the standard claims for new users', async () => {
      const result = await authService.handleClaimValidation(token, true);
      expect(result).to.eql({
        firebaseId: token.sub,
        email: token.email
      });
      expect(checkCustomClaimsSpy).to.not.be.called;
    });
    it('should add the custom claims to claims that are not for new users, but do not have custom claims', async () => {
      fetchUserIdFromFirebaseIdStub.resolves(fetchedAuth.user);
      const result = await authService.handleClaimValidation(token, false);
      expect(result).to.eql({
        firebaseId: token.sub,
        email: token.email,
        user: fetchedAuth.user
      });
      expect(fetchUserIdFromFirebaseIdStub).to.be.calledOnce;
    });
    it('should return the custom auth object to be appended to the request', async () => {
      let token  = {
        sub: 'somefirebaseid',
        email: 'test@test.com',
        user: fetchedAuth.user
      };
      let claims = {
        firebaseId: token.sub,
        email: token.email,
        user: token.user
      };
      fetchUserIdFromFirebaseIdStub.resolves(fetchedAuth.user);
      const result = await authService.handleClaimValidation(token, false);
      expect(result).to.eql(claims);
      expect(fetchUserIdFromFirebaseIdStub).to.not.be.called;
    });
    it('should handle no user being returned gracefully', async () => {
      let token  = {
        sub: 'somefirebaseid',
        email: 'test@test.com'
      };
      let claims = {
        firebaseId: token.sub,
        email: token.email
      };
      fetchUserIdFromFirebaseIdStub.resolves(null);
      const result = await authService.handleClaimValidation(token, false);
      expect(result).to.eql(claims);
      expect(fetchUserIdFromFirebaseIdStub).to.be.calledOnce;
    });
  });
  describe('jwt validation', () => {
    let decodeStub;
    let decodedToken = {
      email: 'test@test.com',
      firebaseId: 'somefirebaseid',
      user: 'someuser'
    };

    beforeEach(() => {
      decodeStub = sandbox.stub(authService, 'decodeToken');
    });
    afterEach(function () {
      sandbox.restore();
    });
    it('should return false when an invalid object is passed', async () => {
      const result = await authService.validateToken({token:'sometoken'});
      expect(result).to.eql({error: {message: 'token is not valid format'}});
    });
    it('should return false a single chracter is passed', async () => {
      const result = await authService.validateToken('s');
      expect(result).to.eql({error: {message: 'token is not valid format'}});
    });
    it('should return false when nothing is passed', async () => {
      const result = await authService.validateToken();
      expect(result).to.eql({error: {message: 'token is not valid format'}});
    });
    it('should return true when it recieves a jwt to validate', async function () {
      decodeStub.resolves({data:decodedToken});
      const result = await authService.validateToken('testtoken');
      expect(result).to.exist;
      expect(decodeStub).to.be.calledWith('testtoken');
      expect(decodeStub).to.be.calledOnce;
      expect(result).to.eql({data:decodedToken})
    });
    it('should handle thrown errors gracefully', async function () {
      const err = new Error('this is an error');
      decodeStub.resolves({error: {message: 'this is an error wrapper', err}});
      const result = await authService.validateToken('testtoken');
      expect(result).to.eql({error: {message: 'this is an error wrapper', err}});
      expect(decodeStub).to.be.calledOnce;
    });
    it('should handle unthrown errors gracefully', async function () {
      decodeStub.resolves({error: {message: 'this is an error wrapper'}});
      const result = await authService.validateToken('testtoken');
      expect(result).to.eql({error: {message: 'this is an error wrapper'}});
      expect(decodeStub).to.be.calledOnce;
    })
  });
  describe('user auth creation', () => {
    let saveStub, authDetails;
    beforeEach(() => {
      saveStub    = sandbox.stub(userAuth.prototype, 'save');
      authDetails = {
        foo: 'bar',
        email: 'test@test.com',
        user: ObjectID().toString(),
        firebaseId: 'somefirebaseidhere'
      }
    });
    afterEach(() => {
      sandbox.restore();
    });
    it('should create a new user when provided with correct details', async () => {
      const res = await authService.createAuthUser(authDetails);
      expect(res).to.exist;
      expect(res.foo).to.not.exist;
      expect(res.email).to.equal(authDetails.email);
      expect(res.user.toString()).to.equal(authDetails.user.toString());
      expect(res.firebaseId).to.equal(authDetails.firebaseId);
    });
    it('should handle errors gracefully', async () => {
      saveStub.throws(Error('an error has occurred'));
      const res = await authService.createAuthUser(authDetails);
      expect(res).to.not.exist;
    })
  });
  describe('fetch user auth by firebase id', () => {
    let findOneStub, authObject;
    let firebaseId = 'somefirebaseid';
    beforeEach(() => {
      findOneStub = sandbox.stub(userAuth, 'findOne');
      authObject  = {
        firebaseId,
        user: ObjectID(),
        email: 'test@test.com'
      }
    });
    it('should handle a successful save', async () => {
      findOneStub.resolves(authObject);
      const result = await authService.fetchAuthByFirebaseId(firebaseId);
      expect(result).to.exist;
      expect(result).to.eql(authObject);
    });
    it('should handle errors while querying', async () => {
      findOneStub.throws(new Error('an error has occurred'));
      const result = await authService.fetchAuthByFirebaseId(firebaseId);
      expect(result).to.be.false;
    });
    it('should handle empty responses gracefully', async () => {
      findOneStub.resolves({});
      const result = await authService.fetchAuthByFirebaseId(firebaseId);
      expect(result).to.be.false;
    });
    afterEach(() => {
      sandbox.restore();
    })
  });
  describe('decode token', () => {
    let verifyStub, verifyStubContainer, authStub, checkCustomClaimsStub;
    let decodedToken = {
      email: 'test@test.com',
      sub: 'somefirebaseidhere'
    };
    beforeEach(() => {
      verifyStub          = sandbox.stub();
      verifyStubContainer = {verifyIdToken: verifyStub};
      authStub            = sandbox.stub(admin, 'auth').returns(verifyStubContainer);
    });
    afterEach(function () {
      sandbox.restore();
    });
    it('should return true when it recieves a jwt to validate', async function () {
      verifyStub.resolves(decodedToken);
      const result = await authService.decodeToken('testtoken');
      expect(result).to.exist;
      expect(verifyStub).to.be.calledWith('testtoken');
      expect(verifyStub).to.be.calledOnce;
      expect(result.sub).to.equal(decodedToken.sub);
      expect(result.email).to.equal(decodedToken.email);
    });
    it('should handle errors gracefully', async function () {
      verifyStub.throws('a firebase error has occured');
      const result = await authService.decodeToken('testtoken');
      expect(result).to.be.false;
      expect(verifyStub).to.be.calledOnce;
    })
  });
  describe('set custom claims', () => {
    let setCustomClaimsStub, claimsStubContainer, authStub, claims;
    beforeEach(() => {
      setCustomClaimsStub = sandbox.stub();
      claimsStubContainer = {setCustomUserClaims: setCustomClaimsStub};
      authStub            = sandbox.stub(admin, 'auth').returns(claimsStubContainer);
      claims              = {
        user: ObjectID()
      }
    });
    it('should call set custom claims', async () => {
      await authService.setCustomClaims('thisisafirebaseid', claims);
      expect(setCustomClaimsStub).to.be.calledOnce;
      expect(setCustomClaimsStub).to.be.calledWith('thisisafirebaseid', claims);
    });
    it('should handle errors gracefully', async () => {
      setCustomClaimsStub.throws('an error has occurred');
      await authService.setCustomClaims('thisisafirebaseid', claims);
      expect(setCustomClaimsStub).to.be.calledOnce;

    });
    afterEach(() => {
      sandbox.restore();
    })
  });
  describe('create user claim', () => {
    let fetchAuthByFirebaseIdStub, returnedAuth, userId, returnedClaims, setCustomClaimsStub;
    beforeEach(() => {
      fetchAuthByFirebaseIdStub = sandbox.stub(authService, 'fetchAuthByFirebaseId');
      setCustomClaimsStub       = sandbox.stub(authService, 'setCustomClaims');
      userId                    = ObjectID();
      returnedAuth              = {
        _id: '59e3e63ef17c602994629669',
        email: 'test@test.com',
        firebaseId: 'somefirebaseid',
        user: userId.toString()
      };
      returnedClaims            = {
        user: userId.toString()
      }
    });
    it('returns a valid claim object', async () => {
      fetchAuthByFirebaseIdStub.resolves(returnedAuth);
      const result = await authService.createUserClaim(returnedAuth.firebaseId);
      expect(result).to.exist;
      expect(fetchAuthByFirebaseIdStub).to.be.calledOnce;
      expect(fetchAuthByFirebaseIdStub).to.be.calledWith(returnedAuth.firebaseId);
      expect(setCustomClaimsStub).to.be.calledOnce;
      expect(setCustomClaimsStub).to.be.calledWith(returnedAuth.firebaseId, returnedClaims);
      expect(result).to.eql(returnedClaims);
    });
    it('handles empty responses gracefully', async () => {
      fetchAuthByFirebaseIdStub.resolves(false);
      const result = await authService.createUserClaim(returnedAuth.firebaseId);
      expect(result).to.be.false;
      expect(fetchAuthByFirebaseIdStub).to.be.calledOnce;
      expect(fetchAuthByFirebaseIdStub).to.be.calledWith(returnedAuth.firebaseId);
      expect(setCustomClaimsStub).to.not.be.called;
    });
    it('handles responses with no user field gracefully', async () => {
      returnedAuth.user = null;
      fetchAuthByFirebaseIdStub.resolves(returnedAuth);
      const result = await authService.createUserClaim(returnedAuth.firebaseId);
      expect(result).to.not.exist;
    });
    afterEach(() => {
      sandbox.restore();
    })
  });
  describe('check custom claims', () => {
    it('should return true when user claim is present', () => {
      const result = authService.checkCustomClaims({
        sub: 'somefirebaseid',
        email: 'test@test.com',
        user: 'someobjectid'
      });
      expect(result).to.be.true;
    });
    it('should return false when user claim is not present', () => {
      const result = authService.checkCustomClaims({
        sub: 'somefirebaseid',
        email: 'test@test.com'
      });
      expect(result).to.be.false;
    })
  });
  describe('fetch user id from firebase id', () => {
    let fetchAuthByFirebaseIdStub, returnedAuth;
    beforeEach(() => {
      fetchAuthByFirebaseIdStub = sandbox.stub(authService, 'fetchAuthByFirebaseId');
      returnedAuth              = {
        _id: 'someidhere',
        email: 'test@test.com',
        user: 'someuseridhere',
        firebaseId: 'somefirebaseidhere'

      };
    });
    afterEach(() => {
      sandbox.restore();
    });
    it('should recieve a firebase id and return a user id', async () => {
      fetchAuthByFirebaseIdStub.resolves(returnedAuth);
      const result = await authService.fetchUserIdFromFirebaseId(returnedAuth.firebaseId);
      expect(result).to.equal(returnedAuth.user);
    });
    it('should handle errors non existant records', async () => {
      fetchAuthByFirebaseIdStub.resolves(false);
      const result = await authService.fetchUserIdFromFirebaseId(returnedAuth.firebaseId);
      expect(result).to.equal(null);
    });
    it('should handle records with no user field', async () => {
      returnedAuth.user = null;
      fetchAuthByFirebaseIdStub.resolves(returnedAuth);
      const result = await authService.fetchUserIdFromFirebaseId(returnedAuth.firebaseId);
      expect(result).to.equal(null);
    });
  })
});

