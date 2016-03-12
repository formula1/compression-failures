'use strict';

var largestLessThan = require('./findLargestLessThan');
var pointOfEntry = require('./pointOfEntry');

var BigNum = require('bignum');

var normalizeBuffers;
process.once('message', function(message){
  message.arg = normalizeBuffers(message.arg);
  switch(message.type.toUpperCase()){
    case 'LESSTHAN' :
      return process.send(largestLessThan(message.data.arg[0], message.data.arg[1], message.data.arg[2]));
    case 'UNKNOWN' :

      var res = pointOfEntry(message.arg[0], message.arg[1].map(function(obj){
        return BigNum.fromBuffer(obj);
      }));

      return process.send(res);
  }
});

normalizeBuffers = function(array){
  return array.map(function(item){
    if(item instanceof Array) return normalizeBuffers(item);
    if(typeof item !== 'object') return item;
    if(item.type === 'Buffer') return new Buffer(item.data);
    return item;
  });
};
