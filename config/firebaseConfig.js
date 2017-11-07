const Logger  = require('../dist/util/Logger')
let firebaseServiceKey, firebaseClientKey, firebaseOpts;
if (!process.env.FIREBASE_SERVICE_KEY_PRIVATE_KEY) {
  const privateConfig = require('./privateConfig');
  firebaseOpts =  privateConfig.firebaseOpts;
  firebaseClientKey  = privateConfig.firebaseTestClient;
} else {
  Logger.verbose(`private key: ${JSON.stringify(process.env.FIREBASE_SERVICE_KEY_PRIVATE_KEY)}`);
  firebaseServiceKey = {
    type: process.env.FIREBASE_SERVICE_KEY_TYPE,
    project_id: process.env.FIREBASE_SERVICE_KEY_PROJECT_ID,
    private_key_id: process.env.FIREBASE_SERVICE_KEY_PRIVATE_KEY_ID,
    private_key: JSON.parse(process.env.FIREBASE_SERVICE_KEY_PRIVATE_KEY),
    client_email: process.env.FIREBASE_SERVICE_KEY_CLIENT_EMAIL,
    client_id: process.env.FIREBASE_SERVICE_KEY_CLIENT_ID,
    auth_uri: process.env.FIREBASE_SERVICE_KEY_AUTH_URI,
    token_uri: process.env.FIREBASE_SERVICE_KEY_TOKEN_URI,
    auth_provider_x509_cert_url: process.env.FIREBASE_SERVICE_KEY_AUTH_PROVIDER_X509_CERT_URL,
    client_x509_cert_url: process.env.FIREBASE_SERVICE_KEY_CLIENT_X509_CERT_URL
  };
  firebaseOpts = {
    credential: firebaseServiceKey,
    databaseUrl: process.env.FIREBASE_SERVICE_DB_URL
  };
  firebaseClientKey  = {
    api_key: process.env.FIREBASE_CLIENT_API_KEY,
    authDomain: process.env.FIREBASE_CLIENT_AUTH_DOMAIN,
    databaseURL: process.env.FIREBASE_SERVICE_DB_URL,
    projectId: process.env.FIREBASE_CLIENT_PROJECT_ID,
    storageBucket: process.env.FIREBASE_CLIENT_STORAGE_BUCKET,
    messagingSenderId: process.env.FIREBASE_CLIENT_MESSAGING_SENDER_ID
  };
}
module.exports = {firebaseOpts, firebaseClientKey};
