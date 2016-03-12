'use strict';
var Op = require('./operation');
var BigInt = require('big-integer');
module.exports = require('./pointOfEntry');
var handleOp;
module.exports.decode = function(array, limit){
  var Operation = Op.factory(limit);
  var value = handleOp(array);
  if(array.length) console.log(array);
  return value;
};

var add, mul, exp, nth;
handleOp = function(array){
  var item = array.shift();
  if(typeof item === 'number') return BigInt(item);
  switch(item){
    case 'ADD': return add(array);
    case 'MUL': return mul(array);
    case 'EXP': return exp(array);
    case 'NTH': return nth(array);
  }
};

add = function(array){
  if(array[0] === '{}'){
    array.shift();
    var total = BigInt(0);
    while(array[0] !== '{}'){
      total = total.add(handleOp(array));
    }

    array.shift();
    return total;
  }

  var a = handleOp(array);
  var b = handleOp(array);
  return a.add(b);
};

mul = function(array){
  if(array[0] === '{}'){
    array.shift();
    var total = BigInt(1);
    while(array[0] !== '{}'){
      total = total.multiply(handleOp(array));
    }

    array.shift();
    return total;
  }

  var a = handleOp(array);
  var b = handleOp(array);
  return a.multiply(b);
};

exp = function(array){
  var a = handleOp(array);
  var b = handleOp(array);
  return a.pow(b);
};

var primes = require('./primes');
nth = function(array){
  return primes.primeAtN(handleOp(array));
};
