'use strict';

var BigInt = require('big-integer');
var primes = require('./primes');
var getPossiblePrimes = primes.getPossiblePrimes;
var Op = require('./operation');
var pointOfEntry, makeNth, makeWorkers;

var MAX_FACTOR_LENGTH = 32;

module.exports = pointOfEntry = function(number, bitLimit, Operation){
  var possiblePrimes;
  if(bitLimit instanceof Array){
    possiblePrimes = bitLimit;
  }else{
    Operation = Op.factory(bitLimit || 16);
    possiblePrimes = getPossiblePrimes(Operation.MAX_PRIMES).slice(0).sort(function(a, b){
      return b.gt(a) ? 1 : b.eq(a) ? 0 : -1;
    });
  }

  if(!BigInt.isInstance(number)){
    if(Buffer.isBuffer(number)){
      var max = possiblePrimes.length;

      if(max < number.length) return makeWorkers(number, max, possiblePrimes);

      number = BigInt(require('binstring')(number, { out: 'hex' }), 16);
    }else if(typeof number == 'number'){
      number = BigInt(number);
    }else{

      throw new Error('what happened?');
    }

  }

  if(!number.gt(possiblePrimes[0])){
    if(number.lt(4)) return number;
    if(possiblePrimes.some(function(prime){

      return number.eq(prime);
    })) return number;
  }


  var primeFactors = primes.factorize(number);

  primeFactors = primeFactors.reduce(function(array, num){
    var last = array[array.length - 1];
    if(last && num.eq(last.value)){
      last.exponent = last.exponent.add(1);
      return array;
    }

    array.push({
      value: num,
      exponent: BigInt(1),
    });

    return array;
  }, []);

  primeFactors = primeFactors.map(function(factored){

    if(factored.exponent.eq(1)){
      return makeNth(factored.value, possiblePrimes, Operation);
    }

    return new Operation(Operation.EXP, [
      makeNth(factored.value, possiblePrimes, Operation),
      pointOfEntry(factored.exponent, possiblePrimes, Operation),
    ]);
  });




  if(primeFactors.length === 1) return primeFactors[0];



  if(0 < MAX_FACTOR_LENGTH){
    return new Operation(Operation.MUL, primeFactors);
  }

  var adds = [];
  do{
    var val = primes.getClosestPrime(number);
    number = number.subtract(val);
    adds.push(makeNth(val, possiblePrimes, Operation));
  }while(number.gt(1));
  if(number.eq(1)) adds.push(1);

  return new Operation(Operation.ADD, adds);
};

var MAX_VALUE = BigInt(2).pow(24);
makeNth = function(prime, possible, Operation){
  if(possible[0].compare(prime) > -1) return prime;
  if(MAX_VALUE.compare(prime) < 0){
    var mul = prime.div(possible[0]);
    return new Operation(Operation.ADD, [
      Operation(Operation.MUL, possible[0], pointOfEntry(mul)),
      pointOfEntry(prime.mod(possible[0])),
    ]);
  }

  return new Operation(Operation.NTH, [
    pointOfEntry(primes.nthPrime(prime), possible, Operation),
  ]);
};
