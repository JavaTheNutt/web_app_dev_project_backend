require('module-alias/register');
const chai   = require('chai');
const expect = chai.expect;
chai.use(require('sinon-chai'));
const sinon       = require('sinon');
const ObjectID    = require('mongoose').Types.ObjectId;
const admin       = require('firebase-admin');
const sandbox     = sinon.sandbox.create();
const authService = require('@Auth/authService');
const userAuth    = require('@Auth/models/UserAuth').model;
describe('auth service', function () {
  'use strict';
  describe('app authentication', () => {
    let req, res, next, statusStub, sendStub, verifyTokenStub, fetchUserStub;
    beforeEach(() => {
      req             = {
        headers: {
          token: 'testtoken'
        }
      };
      sendStub        = {send: sandbox.stub()};
      statusStub      = sandbox.stub().returns(sendStub);
      res             = {
        status: statusStub
      };
      next            = sandbox.stub();
      verifyTokenStub = sandbox.stub(authService, 'validateToken');
      fetchUserStub   = sandbox.stub(authService, 'fetchAuthByFirebaseId');
    });
    afterEach(() => {
      sandbox.restore();
    });
    it('should call next with no params when details are valid and token is not custom', async () => {
      verifyTokenStub.resolves({
        sub: 'somefirebaseidhere',
        email: 'test@test.com'
      });
      fetchUserStub.resolves({
        _id: 'somemongoidhere',
        firebaseId: 'somefirebaseidhere',
        user: 'someothermongoidhere'
      });
      await authService.authenticate(req, res, next);
      expect(verifyTokenStub).to.be.calledOnce;
      expect(verifyTokenStub).to.be.calledWith(req.headers.token);
      expect(fetchUserStub).to.be.calledOnce;
      expect(fetchUserStub).to.be.calledWith('somefirebaseidhere');
      expect(next).to.be.calledOnce;

    });
    it('should fail when no token is present', async function () {
      req.headers.token = null;
      await authService.authenticate(req, res, next);
      expect(statusStub).to.be.calledOnce;
      expect(statusStub).to.be.calledWith(401);
      expect(sendStub.send).to.be.calledOnce;
      expect(sendStub.send).to.be.calledWith('authentication failed');
    });
    it('should fail when no headers are present', async function () {
      req.headers = null;
      await authService.authenticate(req, res, next);
      expect(statusStub).to.be.calledOnce;
      expect(statusStub).to.be.calledWith(401);
      expect(sendStub.send).to.be.calledOnce;
      expect(sendStub.send).to.be.calledWith('authentication failed');
    });
    it('should return 401 when token is deemed invalid', async function () {
      verifyTokenStub.resolves(false);
      await authService.authenticate(req, res, next);
      expect(statusStub).to.be.calledOnce;
      expect(statusStub).to.be.calledWith(401);
      expect(sendStub.send).to.be.calledOnce;
      expect(sendStub.send).to.be.calledWith('authentication failed');
    })
  });
  describe('jwt validation', () => {
    let decodeStub;
    let decodedToken = {email: 'test@test.com', firebaseId: 'somefirebaseid', user: 'someuser'};

    beforeEach(()=>{
      decodeStub = sandbox.stub(authService, 'decodeToken');
    });
    afterEach(function () {
      sandbox.restore();
    });
    it('should return true when it recieves a jwt to validate', async function () {
      decodeStub.resolves(decodedToken);
      const result = await authService.validateToken('testtoken');
      expect(result).to.exist;
      expect(decodeStub).to.be.calledWith('testtoken');
      expect(decodeStub).to.be.calledOnce;
      expect(result.sub).to.equal(decodedToken.sub)
    });
    it('should handle errors gracefully', async function () {
      decodeStub.resolves(false);
      const result = await authService.validateToken('testtoken');
      expect(result).to.be.false;
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
    beforeEach(()=>{
      verifyStub = sandbox.stub();
      verifyStubContainer = {verifyIdToken: verifyStub};
      authStub = sandbox.stub(admin, 'auth').returns(verifyStubContainer);
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
    afterEach(() => {
      sandbox.restore();
    })
  });
  describe('check custom claims', ()=>{
    it('should return true when user claim is present', ()=>{
      const result = authService.checkCustomClaims({sub: 'somefirebaseid', email: 'test@test.com', user: 'someobjectid'});
      expect(result).to.be.true;
    });
    it('should return false when user claim is not present', ()=>{
      const result = authService.checkCustomClaims({sub: 'somefirebaseid', email: 'test@test.com'});
      expect(result).to.be.false;
    })
  })
});
