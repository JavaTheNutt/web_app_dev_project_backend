module.exports = server => {
  server.post('/user', (req, res, next)=>{
    'use strict';
    res.status(200);
    return res.send();
  })
};
