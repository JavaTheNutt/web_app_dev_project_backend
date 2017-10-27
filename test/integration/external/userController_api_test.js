require('module-alias/register');
const chai      = require('chai');
const expect    = chai.expect;
const supertest = require('supertest');
const app       = require('@root');
const util      = require('./util');
chai.use(require('chai-things'));
describe('user controller', () => {
  'use strict';
  let firebaseToken;
  before(async () => {
    firebaseToken = await util.firebaseInit();
  });
  afterEach(() => {
    util.clearCollections(['user_auth', 'users']);
  });
  after(async () => {
    util.closeConnection();
    await util.firebaseTeardown();
  });
  describe('create new user', () => {
    it('should return 201 when a user creation is successful', async () => {
      const response = await supertest(app).post('/user/new').set('token', firebaseToken).expect(201);
      expect(response.body.error).to.not.exist;
      expect(response.body._id).to.exist;
    });
    it('should return 401 when no token is attached', async () => {
      const response = await supertest(app).post('/user/new').expect(401);
      expect(response.body.error.message).to.eql('authentication failed');
    });
  });
  describe('user exists', () => {
    beforeEach(async () => {
      await util.userInit();
    });
    it('should fetch the current user', async () => {
      const response = await supertest(app).get('/user').set('token', firebaseToken).expect(200);
      expect(response.body.error).to.not.exist;
      expect(response.body).to.include.keys('_id', 'email', 'addresses');
    });
    it('should be able to add an address', async () => {
      const response = await supertest(app).post('/user/address').send({address: {text: '123, fake street'}}).
        set('token', firebaseToken).expect(200);
      expect(response.body.error).to.not.exist;
      expect(response.body.addresses).to.have.length.above(0);
      /* expect(response.body.addresses).to.deep.include({
                 text: '123, fake street',
                 loc: {
                     type: 'Point',
                     coordinates: [0, 0]
                 }
             });*/
      /* expect(response.body.addresses).to.have.members({
                 text: '123, fake street',
                 loc: {
                     type: 'Point',
                     coordinates: [0, 0]
                 }
             });*/

      /*expect(response.body.addresses).to.contain.something.that.deep.has.members({
                text: '123, fake street',
                loc: {
                    type: 'Point',
                    coordinates: [0, 0]
                }
            });*/
      /*expect(response.body.addresses).to.contain.something.that.deep.contains.members({
                text: '123, fake street',
                loc: {
                    type: 'Point',
                    coordinates: [0, 0]
                }
            });*/
      //This comes closest to what I want to achieve
      /*expect(response.body.addresses).to.contain.something.that.deep.includes({
                text: '123, fake street',
                loc: {
                    type: 'Point',
                    coordinates: [0, 0]
                }
            });*/
      //this works, but I dont want to know that the element is in position 0
      expect(response.body.addresses[0]).to.deep.include({
        text: '123, fake street',
        loc: {
          type: 'Point',
          coordinates: [0, 0]
        }
      });
    });
    it('should be able to update the current user', async () => {
      const response = await supertest(app).put('/user').send({
        updateParams: {
          firstName: 'joe',
          surname: 'bloggs'
        }
      }).set('token', firebaseToken).expect(200);
      expect(response.body.error).to.not.exist;
      expect(response.body.firstName).to.equal('joe');
      expect(response.body.surname).to.equal('bloggs');
    });
    describe('user has an address', () => {
      it('should be able to fetch all addresses');
      it('should be able to fetch one address by id');
      it('should be able to delete an address by id');
    });


  });
});
