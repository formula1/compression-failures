'use strict';

var BigInt = require('big-integer');
var primes = require('./primes');

module.exports.newnewOld = function(possible, num){
  return possible.map(function(prime){
    var i = 0;
    var temp = num.add(0);
    var currentValues = [];
    while(temp.gt(1)){
      temp = temp.divide(prime);
      currentValues.push(prime);
      i++;
    }

    return {
      value: prime.pow(i - 1),
      factors: currentValues,
    };
  }, BigInt(1)).reduce(function(max, current){
    return current.value.gt(max.value) ? current : max;
  }, { value: 0 });

};

module.exports.newOld = function(possible, num){
  var max = possible[0];
  var factors;
  do{
    factors = primes.factorizeWhile(num, function(prime){
      return !prime.gt(max);
    });

    num = num.sub(1);
  }while(!factors);
  return {
    value: factors.reduce(function(total, prime){
      return total.mul(prime);
    }, BigInt(1)),

    factors: factors,
  };
};

var binaryOps = require('./binary-ops');
var meomizedMath;
module.exports = function(max, possible){
  var currentI = 0;
  var currentMax = BigInt(1);
  var maxFactors;
  var currentNumbers = [];
  var currentValues = [];
  var currentValue = BigInt(1);
  while(true){
    var possibleCurrent = meomizedMath(currentValues.concat([possible[currentI]]));

    if(possibleCurrent.eq(max)){
      return {
        value: possibleCurrent,
        factors: currentValues.concat([possible[currentI]]),
      };
    }

    if(possibleCurrent.lt(max)){
      currentValue = possibleCurrent;
      currentNumbers.push(currentI);
      currentValues.push(possible[currentI]);
      continue;
    }

    if(currentValue.gt(currentMax)){
      maxFactors = currentValues.slice(0);
      currentMax = currentValue;
    }

    if(currentI < possible.length - 1){
      // if the smallest number hasn't been reached
      currentI += 1;
      continue;
    }

    // we have no numbers
    if(currentNumbers.length === 0) break;

    // we've hit a max
    // remove all the smallest numbers from the end
    var lastPossible;
    while((lastPossible = currentNumbers.pop()) == possible.length - 1){
      currentValues.pop();
      if(!currentNumbers.length) break;
    }

    if(!currentNumbers.length){
      if(lastPossible == possible.length - 1) break;
    }

    currentI = lastPossible + 1;
  }

  return {
    value: currentMax,
    factors: maxFactors,
  };
};

var map = new Map();

meomizedMath = function(args){
  return args.reduce(function(num, factor){
    return num.multiply(factor);
  }, BigInt(1));
};

var oldMeomizedMath = function(args){
  if(args.length === 0) throw new Error('cannot meomize this math');
  var curArg = 0;
  var curMap = map;
  var currentValue = BigInt(1);

  while(curArg < args.length < curMap.has(args[curArg].toJSNumber())){
    curMap = curMap.get(args[curArg].toJSNumber());
    curArg++;
  }

  if(curArg > 0) currentValue = curMap.get(null);

  while(curArg < args.length){
    var nMap = new Map();
    curMap.set(args[curArg].toJSNumber(), nMap);
    currentValue = currentValue.multiply(args[curArg]);
    nMap.set(null, currentValue);
    curMap = nMap;
    curArg++;
  }

  return currentValue;
};
