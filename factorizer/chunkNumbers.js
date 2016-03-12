'use strict';
var cp = require('child_process');

module.exports = function(number, max, possiblePrimes){
  var chunks = [];
  for(var i = 0; i < number.length; i += max){
    chunks.push(number.slice(i, Math.min(i + max, number.length)));
  }

  var mappedPrimes = possiblePrimes.map(function(b){
    return b.toBuffer();
  });

  return Promise.all(chunks.map(function(slice){
    return new Promise(function(res, rej){
      console.log('starting workers', slice.length);
      var worker = cp.fork(`${__dirname}/worker.js`);
      worker.on('error', rej);
      worker.once('message', function(data){
        res(data.data);
      });

      worker.send({
        type: 'UNKNOWN',
        arg: [slice, mappedPrimes],
      });
    });
  })).then(function(transformed){
    return {
      operation: 'chunked',
      values: transformed,
    };
  });
};
