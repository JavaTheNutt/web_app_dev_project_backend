/**
 * This file acts as a config file to set up the environment.
 */
let logLevel;
const firebaseConfig = require('./firebaseConfig');
const dbConfig = require('./dbConfig');
/*if (!process.env.DB_URL || !process.env.FIREBASE_SERVICE_KEY || !process.env.FIREBASE_CLIENT_KEY) {
  const privateConfig = require('./privateConfig');
  if (process.env.NODE_ENV === 'production') {
    connectionString = process.env.DB_URL || privateConfig.prodDb;
  } else {
    connectionString = process.env.NODE_ENV === 'test' ? 'mongodb://localhost:27017/finance_tracker_v1_test' :
      'mongodb://localhost:27017/finance_tracker_v1';
  }
  firebaseServiceKey = process.env.FIREBASE_SERVICE_KEY || privateConfig.firebaseOpts;
  firebaseClientKey  = process.env.FIREBASE_CLIENT_KEY || privateConfig.firebaseTestClient;
} else {
  connectionString   = process.env.DB_URL;
  firebaseServiceKey = process.env.FIREBASE_SERVICE_KEY;
  firebaseClientKey  = process.env.FIREBASE_CLIENT_KEY;
}*/

//set log level based on environment
if (!process.env.LOG_LEVEL) {
  if (process.env.NODE_ENV && (process.env.NODE_ENV === 'test' || process.env.NODE_ENV === 'production')) {
    logLevel = 'error';
  } else {
    logLevel = 'verbose';
  }

}

module.exports = {
  port: process.env.PORT || 3000,
  env: process.env.NODE_ENV || 'development',
  logLevel: process.env.LOG_LEVEL || logLevel || 'error',
  db: {
    uri: dbConfig.connectionString
  },
  firebase: firebaseConfig.firebaseOpts,
  firebaseClient: firebaseConfig.firebaseClientKey
};
