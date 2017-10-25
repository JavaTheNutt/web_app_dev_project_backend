require('module-alias/register');
const chai      = require('chai');
const expect    = chai.expect;
const supertest = require('supertest');
const app       = require('@root');
const util      = require('./util');
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

        });
    });
});
