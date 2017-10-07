require('module-alias/register');
const chai     = require('chai');
const expect = chai.expect;
chai.use(require('sinon-chai'));
const sinon    = require('sinon');

const sandbox = sinon.sandbox.create();

const userController = require('@user/userController');

describe('user controller', function () {
  describe('create new user', function () {
    let req, res, next;
    beforeEach(function(){
      'use strict';
      next = sandbox.spy();
      req = {body: {user:{email: 'test@test.com', firebaseId: 'uu0SMEK2itPcoQrvpfKXXOjZ5cL2'}}};
      res = {send: sandbox.spy(), status:sandbox.spy()};
    });
    it('should call res.send with a status of 200 when all details are present', function () {
      userController.createNewUser(req, res, next);
      expect(res.status).to.be.calledOnce;
      expect(res.status).to.be.calledWith(200);
      expect(res.send).to.be.calledOnce;
      expect(res.send).to.be.calledWith('user created');
    });
    it('should call res.send with a status of 400 when there is no user email', function () {
      req.body.user.email = null;
      userController.createNewUser(req, res, next);
      expect(res.status).to.be.calledOnce;
      expect(res.status).to.be.calledWith(400);
      expect(res.send).to.be.calledOnce;
      expect(res.send).to.be.calledWith('missing data');
    });
    it('should call res.send with a status of 400 when there is no firebase id', function () {
      req.body.user.firebaseId = null;
      userController.createNewUser(req, res, next);
      expect(res.status).to.be.calledOnce;
      expect(res.status).to.be.calledWith(400);
      expect(res.send).to.be.calledOnce;
      expect(res.send).to.be.calledWith('missing data');
    });
    afterEach(function(){
      'use strict';
      sandbox.restore();
    });
  })
});
