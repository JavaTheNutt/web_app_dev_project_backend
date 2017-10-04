let logLevel, env;
if(!process.env.LOG_LEVEL){
  console.log('no logging level found');
  if(process.env.NODE_ENV && (process.env.NODE_ENV === 'test' || process.env.NODE_ENV === 'production')){
    console.log('log level assumed silent');
    logLevel = 'silent';
  }else{
    console.log('log level assumed dev');
    logLevel = 'verbose';
  }
}
module.exports = {
  port: process.env.PORT || 3000,
  env: process.env.NODE_ENV || 'development',
  logLevel: process.env.LOG_LEVEL || logLevel
};
