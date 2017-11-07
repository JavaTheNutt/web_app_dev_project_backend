let connectionString;
if(!process.env.DB_URL){
  const privateConfig = require('./privateConfig');
  if (process.env.NODE_ENV === 'production') {
    connectionString = privateConfig.prodDb;
  } else {
    connectionString = process.env.NODE_ENV === 'test' ? 'mongodb://localhost:27017/finance_tracker_v1_test' :
      'mongodb://localhost:27017/finance_tracker_v1';
  }
}else{
  connectionString = process.env.DB_URL;
}
module.exports = {connectionString};
