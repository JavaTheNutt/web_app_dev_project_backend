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
  after(async () => {
    util.closeConnection();
    await util.firebaseTeardown();
  });
  describe('create new user', () => {
    it('should return 201 when a user creation is successful', async () => {
      const response = await supertest(app).post('/user/new').set('Authorization', `Bearer ${firebaseToken}`).expect(201);
      expect(response.body.error).to.not.exist;
      expect(response.body._id).to.exist;
    });
    it('should return 401 when no token is attached', async () => {
      const response = await supertest(app).post('/user/new').expect(401);
      expect(response.body.error.message).to.eql('authentication failed');
    });
  });
  describe('user exists', () => {
    let userId;
    beforeEach(async () => {
      userId = await util.userInit();
    });
    afterEach(() => {
      util.clearCollections(['user_auth', 'users']);
    });
    it('should fetch the current user', async () => {
      const response = await supertest(app).get('/user').set('Authorization', `Bearer ${firebaseToken}`).expect(200);
      expect(response.body.error).to.not.exist;
      expect(response.body).to.include.keys('_id', 'email', 'addresses');
    });
    it('should be able to add an address', async () => {
      const response = await supertest(app).post('/user/address').send({address: {text: '123, fake street'}}).
        set('Authorization', `Bearer ${firebaseToken}`).expect(200);
      expect(response.body.error).to.not.exist;
      expect(response.body.addresses).to.have.length.above(0);
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
    it('should return 400 when there is no address attached to the request', async () => {
      const response = await supertest(app).post('/user/address').send({foo: {bar: '123, fake street'}}).
        set('Authorization', `Bearer ${firebaseToken}`).expect(400);
      expect(response.body.error.message).to.equal('address validation failed: Cannot read property \'text\' of undefined');
    });
    it('should return 400 when the address does not contain a text field', async () => {
      const response = await supertest(app).post('/user/address').send({address: {foo: '123, fake street'}}).
        set('Authorization', `Bearer ${firebaseToken}`).expect(400);
      expect(response.body.error.message).to.equal('address text is required');
    });
    it('should be able to update the current user', async () => {
      const response = await supertest(app).put('/user').send({
        updateParams: {
          firstName: 'joe',
          surname: 'bloggs'
        }
      }).set('Authorization', `Bearer ${firebaseToken}`).expect(200);
      expect(response.body.error).to.not.exist;
      expect(response.body.firstName).to.equal('joe');
      expect(response.body.surname).to.equal('bloggs');
    });
    describe('user has an address', () => {
      let addressId;
      beforeEach(async () => {
        addressId = await util.addressInit(userId);
      });
      describe('fetch all addresses', () => {
        it('should be able to fetch all addresses', async () => {
          const response = await supertest(app).get('/user/address').set('Authorization', `Bearer ${firebaseToken}`).expect(200);
          expect(response.body.error).to.not.exist;
          expect(response.body).to.be.an('array');
          expect(response.body).to.have.length(1);
        });
      });
      describe('fetch one address by id', () => {
        it('should be able to fetch one address by id', async () => {
          const response = await supertest(app).get(`/user/address/${addressId}`).set('Authorization', `Bearer ${firebaseToken}`).
            expect(200);
          expect(response.body.error).to.not.exist;
          expect(response.body).to.include.keys('_id', 'text', 'loc');
        });
        it('should return 400 when the object id is invalid format', async () => {
          const response = await supertest(app).get('/user/address/aaaa').set('Authorization', `Bearer ${firebaseToken}`).expect(400);
          expect(response.body.error.message).to.equal('address id is invalid format');
        });
        it('should return 404 when the address is not found', async () => {
          const response = await supertest(app).get(`/user/address/${userId}`).set('Authorization', `Bearer ${firebaseToken}`).expect(404);
          expect(response.body.error.message).to.equal('address is not found');
        });
      });
      describe('delete one address by id', () => {
        it('should be able to delete an address by id', async () => {
          const response = await supertest(app).delete(`/user/address/${addressId}`).set('Authorization', `Bearer ${firebaseToken}`).
            expect(200);
          expect(response.body.error).to.not.exist;
          expect(response.body.addresses).to.be.an('array').and.be.empty;
        });
        it('should return 400 when the object id is invalid format', async () => {
          const response = await supertest(app).delete('/user/address/aaaa').set('Authorization', `Bearer ${firebaseToken}`).expect(400);
          expect(response.body.error.message).to.equal('address id is invalid format');
        });
      });
    });
  });
});
