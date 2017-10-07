/**
 * This module returns a function which configures the router
 *
 * @module router
 */
const fs     = require('fs');
const path   = require('path');
const Logger = require('@util/Logger')('MAIN_ROUTER');
/**
 * Configure router
 *
 * @param server {Object} the server instance
 * @memberOf module:router
 */
module.exports = (server) => {
  'use strict';
  getDirectories().forEach(componentPath => {
    require(componentPath)(server);
  })
};
/**
 * Filter to determine if entry is a directory
 * @param source {String} the path plus the name
 * @return true if directory, false otherwise
 * @memberOf module:router
 */
const isDir          = source => fs.statSync(source).isDirectory();
/**
 * Fetch the full list of route files to be required. This assumes that all of the route files are exported from an
 * index file in each component directory
 * @memberOf module:router
 * @return {Array} list of directories in the 'components' directory
 */
const getDirectories = () => {
  'use strict';
  const componentDir = path.join(__dirname, '/components');
  Logger.verbose(`component directory: ${componentDir}`);
  return fs.readdirSync(componentDir).map(name => path.join(componentDir, name)).filter(isDir);
  /*Logger.info(`fetching route directories`);
  const componentDir = path.join(__dirname, '../components');
  Logger.verbose(`component directory: ${componentDir}`);
  const dirs = fs.readdirSync(componentDir);
  Logger.verbose(`dirs: ${JSON.stringify(dirs)}`);
  const mappedDirs = dirs.map(name => path.join(componentDir, name));
  Logger.verbose(`mapped dirs: ${JSON.stringify(mappedDirs)}`);
  const filteredDirs = mappedDirs.filter(isDir);
  Logger.verbose(`filtered dirs: ${JSON.stringify(filteredDirs)}`);
  return filteredDirs;*/
};
