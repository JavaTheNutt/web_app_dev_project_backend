const Logger = require('@util/Logger')('DATA_UTILS');
module.exports = exports = {
  /**
   * standard data formatting
   * @param data {Object|*} the data to be captured
   * @returns {Object|void} the formatted data
   */
  formatData(data){
    'use strict';
    Logger.verbose(`request made to format data: ${JSON.stringify(data)}`);
    let dataToBeReturned;
    if(data === false || data === 0){
      Logger.verbose(`data is falsey, but should be preserved`);
      dataToBeReturned = {data};
      Logger.verbose(`data to be returned: ${JSON.stringify(dataToBeReturned)}`);
      return dataToBeReturned;
    }
    if(!data){
      Logger.warn(`data does not exist, returning undefined`);
      return;
    }
    if(data.error){
      Logger.verbose(`data contains an error, returning error`);
      return data;
    }
    if(data.data) {
      Logger.verbose(`data exists, stripping properties`);
      return {data: data.data};
    }
    return{data}
  }
};
