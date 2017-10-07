require('module-alias/register');
const chai     = require('chai');
const expect = chai.expect;
chai.use(require('sinon-chai'));
const sinon    = require('sinon');

const sandbox = sinon.sandbox.create();

const userController = require('@root/controllers/userController');

describe('user controller', function () {
  describe('create new user', function () {
    let req, res, next, sendSpy;
    before(function(){
      'use strict';
      sendSpy = sandbox.spy();
      next = sandbox.spy();
    });
    beforeEach(function(){
      'use strict';
      req = {};
      res = {send: sendSpy};
    });
    it('should call res.send', function () {
      userController.createNewUser(req, res, next);
      expect(res.send).to.be.calledOnce;
    });
    afterEach(function(){
      'use strict';
      sandbox.restore();
    });
  })
});
