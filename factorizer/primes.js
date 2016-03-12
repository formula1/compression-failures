'use strict';

var makePrimes, getPrimes;
var BigNum = require('bignum');
makePrimes = function*(){
  var primes = [];
  var i = BigNum(1);
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

var allPrimes = [];
var primeMaker = makePrimes();
module.exports.getPrimses = getPrimes = function*(){
  var i = 0;
  while(true){
    if(i === allPrimes.length) allPrimes.push(primeMaker.next().value);
    yield allPrimes[i];
    i++;
  }
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
      number = number.div(newestPrime);
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
