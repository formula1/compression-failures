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

makePrimes = function*(){
  var stack = [];
  yield BigInt(2);
  var i = BigInt(3);
  do{
    yield i;
    stack.push({ val: i.add(i), jump: i });
    i = i.add(2);
    while(stack[0].exp.eq(i)){
      do{
        var jump = stack.shift().jump;

        // should be binary insert, resorting everytime seems unnecessary
        stack.push({
          exp: i.add(jump),
          jump: jump,
        });
      }while(stack[0].val.eq(i));
      stack.sort(function(a, b){
        return a.val - b.val;
      });

      i = i.add(2);
    }
  }while(true);
};

var allPrimes = [];
var primeMaker = makePrimes();
module.exports.getPrimes = getPrimes = function*(){
  var i = 0;
  while(true){
    if(i === allPrimes.length) allPrimes.push(primeMaker.next().value);
    yield allPrimes[i];
    i++;
  }
};

module.exports.getClosestPrime = function(number){
  var nextPrime = getPrimes();
  var currentPrime;
  do{
    var nextPrime = nextPrime.next().value;
    if(number.subtract(nextPrime).lt(0)) break;
    currentPrime = nextPrime;
  }while(true);
  return currentPrime;
};

module.exports.factorizeWhile = function(number, checker){
  var factors = [];
  var makePrime = getPrimes();
  var newestPrime;
  var finished = false;
  do{
    newestPrime = makePrime.next().value;
    if(!checker(newestPrime)) break;
    while(number.mod(newestPrime).eq(0)){
      factors.push(newestPrime);
      number = number.divide(newestPrime);
    }

    if(number.eq(0)) throw new Error('cannot factorize 0');
    if(number.eq(1)){
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
