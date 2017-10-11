require('module-alias/register');
const chai = require('chai');
const expect = chai.expect;
chai.use(require('sinon-chai'));
const sinon = require('sinon');

const sandbox = sinon.sandbox.create();
const userService = require('@user/service/userService');
const User = require('@user/models/User').model;
describe('user service', ()=>{
  'use strict';
  let userDetails, saveStub, savedResponse;
  beforeEach(()=>{
    userDetails = {email: 'test@test.com'};
    savedResponse = {_id: 'someidhere', email: 'test@test.com'};
    saveStub = sandbox.stub(User.prototype, 'save');
  });
  afterEach(()=>{
    sandbox.restore();
  });
  it('should successfully return a newly created user when passed correct details', async ()=>{
    const res = await userService.createUser(userDetails);
    expect(saveStub).to.be.calledOnce;
    expect(res._doc).to.have.own.keys('_id', 'email', 'addresses');
    expect(res._doc._id.toString().length).to.equal(24);
    expect(Array.isArray(res._doc.addresses)).to.be.true;
    expect(res._doc.addresses.length).to.equal(0);
    expect(res._doc.email).to.equal(userDetails.email);
  })
});
