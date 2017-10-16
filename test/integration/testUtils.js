require('module-alias/register');
const mongoose = require('mongoose');
const config   = require('@config/config');

mongoose.Promise = Promise;

module.exports = {
  async initialSetup(collectionNames) {
    'use strict';
    try {
      await mongoose.connect(config.db.uri, {useMongoClient: true});
      for (let i = 0; i < collectionNames.length; i++) {
        if (mongoose.connection.collections[collectionNames[i]]) {
          try {
            await mongoose.connection.collections[collectionNames[i]].drop();
            if (i === collectionNames.length - 1) {
              return true;
            }
          } catch (err) {
            if (err.message !== 'ns not found') {
              throw err;
            }
          }
        }
      }
    } catch (e) {
      throw e;
    }
  },
  async clearCollection(collectionNames) {
    'use strict';
    for (let i = 0; i < collectionNames.length; i++) {
      if (mongoose.connection.collections[collectionNames[i]]) {
        try {
          await mongoose.connection.collections[collectionNames[i]].remove();
          if (i === collectionNames.length - 1) {
            return true;
          }
        } catch (e) {
          throw e
        }
      }
    }
  },
  closeConnection(done) {
    'use strict';
    mongoose.connection.close();
    return done();
  }
};
