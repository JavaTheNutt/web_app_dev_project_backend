require('module-alias/register');
const chai   = require('chai');
const expect = chai.expect;
chai.use(require('sinon-chai'));
const sinon   = require('sinon');
const sandbox = sinon.sandbox.create();

const User           = require('@user/models/User').model;
const userController = require('@user/userController');
const UserAuth       = require('@Auth/models/UserAuth').model;
const admin          = require('firebase-admin');

describe('user controller', () => {
  'use strict';
  describe('add new user', () => {
    let saveUserStub, saveAuthStub, req, res, next, sendStub, sendStubContainer, statusStub, fetchAuthStub, authStub,
        setCustomUserClaimsStubContainer, setCustomUserClaimsStub;
    beforeEach(() => {
      saveUserStub                     = sandbox.stub(User.prototype, 'save');
      saveAuthStub                     = sandbox.stub(UserAuth.prototype, 'save');
      req                              = {
        body: {
          customAuthUser: {
            email: 'test@test.com',
            firebaseId: 'somefirebaseidhere'
          }
        }
      };
      sendStub                         = sandbox.stub();
      sendStubContainer                = {send: sendStub};
      statusStub                       = sandbox.stub().returns(sendStubContainer);
      res                              = {
        send: sendStub,
        status: statusStub
      };
      next                             = sandbox.stub();
      fetchAuthStub                    = sandbox.stub(UserAuth, 'findOne');
      setCustomUserClaimsStub          = sandbox.stub();
      setCustomUserClaimsStubContainer = {setCustomUserClaims: setCustomUserClaimsStub};
      authStub                         = sandbox.stub(admin, 'auth').returns(setCustomUserClaimsStubContainer);
    });
    it('should call res.send with a status of 200 when the operation is successful', async () => {
      await userController.createNewUser(req, res, next);
      expect(res.status).to.be.calledOnce;
      expect(res.status).to.be.calledWith(200);
      expect(res.send).to.be.calledOnce;
      expect(res.send).to.be.calledWith('user created');
    });
    it('should call res.send with a status of 400 when user save fails', async () => {
      saveUserStub.throws('an error has occurred');
      await userController.createNewUser(req, res, next);
      expect(res.status).to.be.calledOnce;
      expect(res.status).to.be.calledWith(400);
      expect(res.send).to.be.calledOnce;
      expect(res.send).to.be.calledWith('error creating user');
    });
    it('should call res.send with a status of 400 when auth save fails', async () => {
      saveAuthStub.throws('an error has occurred');
      await userController.createNewUser(req, res, next);
      expect(res.status).to.be.calledOnce;
      expect(res.status).to.be.calledWith(400);
      expect(res.send).to.be.calledOnce;
      expect(res.send).to.be.calledWith('error while saving auth object');
    });
    it('should call res.send with a status of 400 when addition of custom claims fails', async () => {
      setCustomUserClaimsStub.throws('an error has occurred');
      fetchAuthStub.resolves({
        _id: 'someidhere',
        email: 'test@test.com',
        user: 'someuseridhere',
        firebaseId: 'somefirebaseidhere'

      });
      await userController.createNewUser(req, res, next);
      expect(res.status).to.be.calledOnce;
      expect(res.status).to.be.calledWith(400);
      expect(res.send).to.be.calledOnce;
      expect(res.send).to.be.calledWith('error while adding custom claims to firebase');
    });
    afterEach(() => {
      sandbox.restore();
    });
  });
  describe('add new address', () => {
    let findOneAndUpdateStub, addressToBeAdded, req, res, next, sendStub, sendStubContainer, statusStub, amendedUser;
    beforeEach(() => {
      sendStub             = sandbox.stub();
      sendStubContainer    = {send: sendStub};
      statusStub           = sandbox.stub().returns(sendStubContainer);
      findOneAndUpdateStub = sandbox.stub(User, 'findOneAndUpdate');
      addressToBeAdded     = {
        text: '123, fake street',
        geo: {
          lat: 10,
          lng: 10
        }
      };
      amendedUser          = {
        _id: 'someidhere',
        email: 'test@test.com',
        addresses: [addressToBeAdded]
      };
      req                  = {
        body: {
          customAuthUser: {
            email: 'test@test.com',
            firebaseId: 'somefirebaseidhere',
            user: 'someidhere'
          },
          address: addressToBeAdded
        }
      };
      res                  = {
        status: statusStub,
        send: sendStub
      };
      next                 = sandbox.stub();
    });
    it('should successfully add an address', async () => {
      findOneAndUpdateStub.resolves(amendedUser);
      await userController.addAddress(req, res, next);
      expect(statusStub).to.be.calledOnce;
      expect(statusStub).to.be.calledWith(200);
      expect(sendStub).to.be.calledOnce;
      expect(sendStub).to.be.calledWith(amendedUser);
    });
    it('should return a 400 error when address addition fails', async () => {
      findOneAndUpdateStub.throws('an error has occurred');
      await userController.addAddress(req, res, next);
      expect(statusStub).to.be.calledOnce;
      expect(statusStub).to.be.calledWith(400);
      expect(sendStub).to.be.calledOnce;
      expect(sendStub).to.be.calledWith('there was an error while adding an address');
    });
    afterEach(() => {
      sandbox.restore();
    })
  })
});
