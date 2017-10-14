require('module-alias/register');
const mongoose = require('mongoose');
const config   = require('@config/config');

mongoose.Promise = Promise;

module.exports = {
  initialSetup(collectionName, done) {
    'use strict';
    mongoose.connect(config.db.uri, {useMongoClient: true}, (err) => {
      if (err) {
        return done(err);
      }
      if (Array.isArray(collectionName)) {
        collectionName.forEach((name, i) => {
          if (mongoose.connection.collections[name]) {
            mongoose.connection.collections[name].drop((err) => {
              if (err && err.message !== 'ns not found') {
                return done(err);
              }
              if (i === collectionName.length - 1) {
                return done(null);
              }
            })
          }
        });
      } else {
        if (mongoose.connection.collections[collectionName]) {
          mongoose.connection.collections[collectionName].drop((err) => {
            if (err && err.message !== 'ns not found') {
              return done(err);
            }
            return done(null);
          })
        }
      }
    })
  },
  clearCollection(collectionName, done) {
    'use strict';
    if (Array.isArray(collectionName)) {
      collectionName.forEach((name, i) => {
        if (mongoose.connection.collections[name]) {
          mongoose.connection.collections[name].remove((err) => {
            if (err) {
              return done(err);
            }
            if (i === collectionName.length - 1) {
              return done();
            }
          });
        }
      });
    } else {
      if (mongoose.connection.collections[collectionName]) {
        mongoose.connection.collections[collectionName].remove((err) => {
          if (err) {
            return done(err);
          }
          return done();
        });
      }
      return done();
    }
  },
  closeConnection(done) {
    'use strict';
    mongoose.connection.close();
    return done();
  }
};
