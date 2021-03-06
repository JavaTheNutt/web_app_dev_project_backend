/**
 * This is the test suite for the Address model
 */
require('module-alias/register');
const expect = require('chai').expect;

const AddressModel = require('@Address/models/Address.js').model;

describe('AddressModel', () => {
  describe('creation', () => {
    it('should create a valid Address model with no geospatial coordinates', () => {
      const address = new AddressModel({
        text: 'home'
      });
      expect(address.validateSync()).to.not.exist;
      expect(address.text).to.equal('home');
    });
    it('should create a valid Address model with geospatial coordinates', () => {
      const address = new AddressModel({
        text: 'home',
        loc: {
          type: 'Point',
          coordinates: [10, 10]
        }
      });
      expect(address.validateSync()).to.not.exist;
      expect(address.text).to.equal('home');
      expect(address.loc.type).to.equal('Point');
      expect(address.loc.coordinates).to.have.members([10, 10]);
    });
    it('should create a valid Address model with geospatial coordinates, but no type specified', () => {
      const address = new AddressModel({
        text: 'home',
        loc: {coordinates: [10, 10]}
      });
      expect(address.validateSync()).to.not.exist;
      expect(address.text).to.equal('home');
    });
    it('should throw an error when there is no text specified', () => {
      const address = new AddressModel({
        loc: {coordinates: [10, 10]}
      });
      const err     = address.validateSync();
      expect(err).to.exist;
      expect(err.message).to.equal('Address validation failed: text: Path `text` is required.');
    });
  });
});
