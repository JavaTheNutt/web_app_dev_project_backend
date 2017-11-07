/**
 * This file acts as a config file to set up the environment.
 */
let logLevel;
const firebaseConfig = require('./firebaseConfig');
const dbConfig = require('./dbConfig');

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
