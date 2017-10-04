require('module-alias/register');
const expect = require('chai').expect;

const User = require('@root/models/User').model;

let userDetails = {};
describe('user model', function () {
  beforeEach(()=>{
    'use strict';
    userDetails = {
      email: 'test@test.com',
      firstName: 'test',
      surname: 'mcTester',
      addresses: [{
        text: '123 fake street',
        loc:{
          type: 'Point',
          coordinates: [10, 10]
        }
      }]
    }
  });
  it('should create a user with one address', function () {
    const user = new User(userDetails);
    expect(user.validateSync()).to.not.exist;
    expect(user.email).to.equal(userDetails.email);
    expect(user.firstName).to.equal(userDetails.firstName);
    expect(user.surname).to.equal(userDetails.surname);
    expect(Array.isArray(user.addresses)).to.be.true;
    expect(user.addresses.length).to.equal(1);
    expect(user.addresses[0].text).to.equal(userDetails.addresses[0].text);
    expect(user.addresses[0].loc.type).to.equal(userDetails.addresses[0].loc.type);
  });
  it('should create a user with two addresses', function () {
    userDetails.addresses.push({text: '234 fake street', loc:{
      type: 'Point',
      coordinates: [20, 20]
    }});
    const user = new User(userDetails);
    console.log(JSON.stringify(user));
    expect(user.validateSync()).to.not.exist;
    expect(user.email).to.equal(userDetails.email);
    expect(user.firstName).to.equal(userDetails.firstName);
    expect(user.surname).to.equal(userDetails.surname);
    expect(Array.isArray(user.addresses)).to.be.true;
    expect(user.addresses.length).to.equal(2);
    expect(user.addresses[0].text).to.equal(userDetails.addresses[0].text);
    expect(user.addresses[0].loc.type).to.equal(userDetails.addresses[0].loc.type);
    expect(Array.isArray(user.addresses[0].loc.coordinates)).to.be.true;
    expect(user.addresses[1].text).to.equal(userDetails.addresses[1].text);
    expect(user.addresses[1].loc.type).to.equal(userDetails.addresses[1].loc.type);
  });

});
