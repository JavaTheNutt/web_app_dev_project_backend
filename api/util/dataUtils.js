module.exports = exports = {
  /**
   * standard data formatting
   * @param data {Object|*} the data to be captured
   * @returns {Object} the formatted data
   */
  formatData(data){
    'use strict';
    if(data.data) return {data:data.data}; //if data already exists, strip extra props
    return{data}
  }
};
