'use strict';

var BigNum = require('bignum');

var getPossiblePrimes = require('./primes').getPossiblePrimes;
module.exports = function(number, number_of_primes){
  var possiblePrimes;
  if(number_of_primes instanceof Array){
    possiblePrimes = number_of_primes;
  }else{
    possiblePrimes = getPossiblePrimes(number_of_primes || 16).slice(0).sort(function(a, b){
      return b.gt(a) ? 1 : b.eq(a) ? 0 : -1;
    });
  }

  if(!BigNum.isBigNum(number)){
    if(Buffer.isBuffer(number)){
      var max = possiblePrimes.length;
      console.log(max, number.length);
      if(max < number.length) return require('./chunkNumbers')(number, max, possiblePrimes);

      number = BigNum.fromBuffer(number);
    }else if(typeof number == 'number'){
      if(number < 4) return number;
      if(possiblePrimes.some(function(prime){
        if(number.eq(2)) console.log('equals', number, prime, number.eq(prime));

        return number.eq(prime);
      })) return number;
    }

    number = BigNum(number);
  }

  if(!number.gt(possiblePrimes[0])){
    if(number.lt(4)) return number.toNumber();
    if(possiblePrimes.some(function(prime){
      if(number.eq(2)) console.log('equals', number, prime, number.eq(prime));

      return number.eq(prime);
    })) return number.toNumber();
  }

  return require('./sumOfMaxFactors')(number, possiblePrimes);

};
