const fs = require('fs');
const path = require('path');
const Logger = require('@util/Logger')('MAIN_ROUTER');
module.exports = (server) => {
  'use strict';
  getDirectories().forEach(componentPath =>{
    require(componentPath)(server);
  })
};
const isDir = source => fs.statSync(source).isDirectory();
const getDirectories = () => {
  'use strict';
  //return fs.readdirSync(componentDir).map(name => path.join(componentDir, name)).filter(isDir);
  Logger.info(`fetching route directories`);
  const componentDir = path.join(__dirname, '../components');
  Logger.verbose(`component directory: ${componentDir}`);
  const dirs = fs.readdirSync(componentDir);
  Logger.verbose(`dirs: ${JSON.stringify(dirs)}`);
  const mappedDirs = dirs.map(name => path.join(componentDir, name));
  Logger.verbose(`mapped dirs: ${JSON.stringify(mappedDirs)}`);
  const filteredDirs = mappedDirs.filter(isDir);
  Logger.verbose(`filtered dirs: ${JSON.stringify(filteredDirs)}`);
  return filteredDirs;
};
