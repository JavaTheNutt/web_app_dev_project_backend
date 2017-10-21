const Logger     = require('@util/Logger')('DATA_UTILS');
const errorUtils = require('@util/errorUtils');
const _          = require('lodash');
module.exports   = exports = {
  /**
   * standard data formatting
   * @param data {Object|*} the data to be captured
   * @returns {Object|void} the formatted data
   */
  formatData(data) {
    'use strict';
    Logger.verbose(`request made to format data: ${JSON.stringify(data)}`);
    let dataToBeReturned;
    if (data === false || data === 0) {
      Logger.verbose(`data is falsey, but should be preserved`);
      dataToBeReturned = {data};
      Logger.verbose(`data to be returned: ${JSON.stringify(dataToBeReturned)}`);
      return dataToBeReturned;
    }
    if (!data) {
      Logger.warn(`data does not exist, returning undefined`);
      return;
    }
    if (data instanceof Error) {
      Logger.warn(`data formatter passed error, returning wrapped error`);
      return errorUtils.formatError('data service was passed a raw error', data);
    }
    if (data.data instanceof Error) {
      Logger.warn(`data formatter passed error, returning wrapped error`);
      return errorUtils.formatError('data service was passed a raw error', data.data);
    }
    if (data.error) {
      Logger.verbose(`data contains an error, returning error`);
      return Object.assign({}, errorUtils.formatError(data.error.message, data.error.err));
    }
    if (data.data) {
      Logger.verbose(`data exists, merging properties`);
      return exports.mergeData(data);
    }
    return {data}
  },
  mergeData(data){
    'use strict';
    //Logger.verbose(`current data: ${JSON.stringify(data)}`);
    const mergedData = Object.assign(data.data, exports.getNonDataProperties(data));
    Logger.verbose(`merged data: ${JSON.stringify(mergedData)}`);
    return {data:mergedData}
  },
  getNonDataProperties(data) {
    'use strict';
    if (!data.data) {
      return data;
    }
    /* This function will remove the data property from the object and return all other properties.
    The function below is adapted from this stack overflow answer: https://stackoverflow.com/a/38829074/4108556
    This works by useing the spread operator to pass an array like structure as an object, which filters out the
    data property and then uses computed key name syntax and pass return a key value pair to be passed to Object.assign()
     */
    const newObj = Object.assign({}, ...Object.keys(data).filter(key => key !== 'data').
    map(key => ({[key]: data[key]})));
    Logger.verbose(`new Obj: ${JSON.stringify(newObj)}`);
    return newObj;
  }
};
