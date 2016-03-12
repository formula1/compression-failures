'use strict';

var makePrimes, getPrimes;
var BigInt = require('big-integer');
var oldMakePrimes = function*(){
  var primes = [];
  var i = BigInt(1);
  while(true){
    i = i.add(1);
    if(!primes.some(function(prime){
      return i.mod(prime).eq(0);
    })){

      yield i;
      primes.push(i);
    }
  }
};

var binaryOps = require('./binary-ops');
module.exports.makePrimes = makePrimes = function*(){
  var stack = [];
  var i = BigInt(2);
  do{
    yield i;
    stack.push({ val: i.add(i), jump: i });
    console.log(stack);
    i = i.add(1);
    while(stack[0] && stack[0].val.eq(i)){
      var index = 0;
      var jump = stack.shift().jump;
      var newVal = i;
      var toInsert = { val: void 0, jump:  jump };
      do{
        newVal = newVal.add(jump);
        toInsert.val = newVal;
        index = binaryOps.findAny(stack, toInsert, function(a, b){
          return a.val.compare(b.val);
        }, index, Math.min(index + jump, stack.length - 1));
      }while(binaryOps.isFound(index));

      binaryOps.insertAtIndex(stack, index, toInsert);
      i = i.add(1);
    }
  }while(true);
};

var allPrimes = [];
var primeMaker = makePrimes();

function primeRunner(){
  var mkPrimes = getPrimes(allPrimes.length);
  var i = Math.pow(2,8);
  while(i--) mkPrimes.next();
  setImmediate(primeRunner);
}
//setImmediate(primeRunner);


module.exports.getPrimes = getPrimes = function*(i){
  var i = i || 0;
  while(true){
    if(i === allPrimes.length) allPrimes.push(primeMaker.next().value);
  //  console.log('getting prime', allPrimes[i]);
    yield allPrimes[i];
    i++;
  }
};

module.exports.getClosestPrime = function(number){
  var i = binaryOps.findAny(allPrimes, number, function(a, b){
    return a.subtract(b);
  });

  if(i < Number.POSITIVE_INFINITY) return allPrimes[-i];

  var makePrime = getPrimes(allPrimes.length);
  var currentPrime;
  var nextPrime;
  do{
    var nextPrime = makePrime.next().value;
    if(number.subtract(nextPrime).lt(0)) break;
    currentPrime = nextPrime;
  }while(true);
  return currentPrime;
};

module.exports.factorize = function(number){
  var factors = [];
  var makePrime = getPrimes();
  var newestPrime;
  var finished = false;
  do{
    newestPrime = makePrime.next().value;
    while(number.mod(newestPrime).eq(0)){
      factors.push(newestPrime);
      number = number.divide(newestPrime);
    }

    if(number.eq(0)) throw new Error('cannot factorize 0');
    if(number.eq(1)){
      finished = true;
      break;
    }

    if(newestPrime.gt(number.pow(1 / 2))){
      factors.push(number);
      finished = true;
      break;
    }
  }while(true);

  return finished ? factors : false;
};

module.exports.getPossiblePrimes = function(max){
  var primes = [];
  var nextPrime = getPrimes();
  while(primes.length < max){
    primes.push(nextPrime.next().value);
  }

  return primes;
};

module.exports.primeAtN = function(n){
  var i = allPrimes.length;
  var nextPrime = getPrimes(i);
  while(i < n){
    nextPrime.next().value;
  }

  return allPrimes[n];
};

module.exports.nthPrime = function(prime){

  var i = binaryOps.findAny(allPrimes, prime, function(a, b){
    return a.compare(b);
  });
  if(binaryOps.isFound(i)) return i;


  i = allPrimes.length;
  var nextPrime = getPrimes(i);
  var curPrime;
  var compare;
  do{
    curPrime = nextPrime.next().value;

    compare = prime.compare(curPrime);
    switch(compare){
      case 0:

        return i;
      case 1: i++; break;
      case -1: throw new Error('Passed Me');
    }
  }while(compare);
  return i;
};
