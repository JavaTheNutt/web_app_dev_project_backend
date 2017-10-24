/**
 * This file acts as a config file to set up the environment.
 */
let logLevel;
const privateConfig = require('./privateConfig');
//set log level based on environment
if(!process.env.LOG_LEVEL){
    if(process.env.NODE_ENV && (process.env.NODE_ENV === 'test' || process.env.NODE_ENV === 'production')){
        logLevel = 'error';
    }else{
        logLevel = 'verbose';
    }
}
let connectionString;
//configure mongo connection strings
if(process.env.NODE_ENV === 'production'){
    connectionString = privateConfig.prodDb;
}else{
    connectionString = process.env.NODE_ENV === 'test' ? 'mongodb://localhost:27017/finance_tracker_v1_test' : 'mongodb://localhost:27017/finance_tracker_v1';
}
module.exports = {
    port: process.env.PORT || 3000,
    env: process.env.NODE_ENV || 'development',
    logLevel: process.env.LOG_LEVEL || logLevel || 'error',
    db:{
        uri: connectionString
    },
    firebase: privateConfig.firebaseOpts
};
