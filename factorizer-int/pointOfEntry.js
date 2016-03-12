'use strict';

var BigInt = require('big-integer');

var getPossiblePrimes = require('./primes').getPossiblePrimes, enforceUniqueness,
enforceUniqueMultiplication, enforceUniqueAddition, enforceExponent;
module.exports = function(number, number_of_primes){
  var possiblePrimes;
  if(number_of_primes instanceof Array){
    possiblePrimes = number_of_primes;
  }else{
    possiblePrimes = getPossiblePrimes(number_of_primes || 16).slice(0).sort(function(a, b){
      return b.gt(a) ? 1 : b.eq(a) ? 0 : -1;
    });
  }

  if(!BigInt.isInstance(number)){
    if(Buffer.isBuffer(number)){
      var max = possiblePrimes.length;
      console.log(max, number.length);
      if(max < number.length) return require('./chunkNumbers')(number, max, possiblePrimes);

      number = BigInt(require('binstring')(number, { out: 'hex' }), 16);
    }else if(typeof number == 'number'){
      if(number < 4) return number;
      if(possiblePrimes.some(function(prime){
        return prime.eq(number);
      })) return number;

      number = BigInt(number);
    }else{
      console.log(number);
      throw new Error('what happened?');
    }

  }

  if(!number.gt(possiblePrimes[0])){
    if(number.lt(4)) return number.toJSNumber();
    if(possiblePrimes.some(function(prime){
      if(number.eq(2)) console.log('equals', number, prime, number.eq(prime));

      return number.eq(prime);
    })) return number.toJSNumber();
  }

  return enforceUniqueness(require('./sumOfMaxFactors')(number, possiblePrimes));

};


enforceUniqueness = function(item){
  if(typeof item === 'number') return item;
  switch(item.operation){
    case 'multiplication' :
      if(item.values.length < 3) return item;
      return enforceUniqueMultiplication(item.values);
    case 'add':
      if(item.values.length < 3) return item;
      return enforceUniqueAddition(item.values);
    case 'exponent':
      return enforceExponent(item);
  }
};

/*
(x * y * z * 4 * 3 ^ 4)
(x * y * z * 4 *)
(x * * 4 * 3 ^ 4)
(z * 4 )
4 ( z + x * 3 ^ 4 + z * x * y + z * x * y * 3^ 4)
4 ( x * 3 ^ 4 + z ( 1 + x * y + x * y * 3^ 4))
4 ( x * 3 ^ 4 + z ( 1 + x * y ( 1 + 3^ 4)))
*/
var stringifyObj;
enforceUniqueAddition = function(items){
  var keyMapping = new Map();
  var multiples = new Map();
  items.forEach(function(item){
    if(typeof item === 'number'){
      var numkey = stringifyObj(item);
      if(!keyMapping.has(numkey)) keyMapping.set(numkey, item);
      if(!multiples.has(numkey)) multiples.set(numkey, []);
      return multiples.get(numkey).push(1);
    }

    switch(item.operation){
      case 'add' : throw new Error('should never add in an add');
      case 'multiplication' :
        item = enforceUniqueMultiplication(item.values);
        var mulItems = item.values.slice();
        mulItems = mulItems.map(stringifyObj);
        return item.values.forEach(function(value){
          var key = stringifyObj(value);
          if(!keyMapping.has(key)) keyMapping.set(key, value);
          if(!multiples.has(key)) multiples.set(key, []);
          multiples.get(key).push(mulItems);
        });

      case 'exponent' :
        var key = stringifyObj(item);
        if(!keyMapping.has(key)) keyMapping.set(key, item);
        if(!multiples.has(key)) multiples.set(key, []);
        multiples.get(key).push(1);
        break;

      default : throw new Error(`invalid operation ${item.operation}`);
    }
  });

  var retItems = Array.from(multiples.keys());
  retItems.sort(function(a, b){
    return multiples.get(b).length - multiples.get(a).length;
  });

  if(retItems.length < 2) return retItems[0];
  retItems = retItems.reduce(function(newArray, key){
    var multipliers = multiples.get(key);
    if(multipliers.length === 0) return newArray;
    if(multipliers.length === 1){
      if(multipliers[0] === 1) return newArray.concat([key]);
      var oArray = multiples.get(multipliers[0]);
      if(oArray) oArray.splice(oArray.indexOf(key), 1);
      return newArray.concat([{
        operation: 'multiplication',
        values: [keyMapping.get(key), keyMapping.get(multipliers[0])],
      }]);
    }

    multipliers = multipliers.map(function(mul){
      if(typeof mul === 'number') return mul;
      if(mul instanceof Array){
        return {
          operation: 'multiplication',
          values: mul.reduce(function(mulAri, mulItem){
            if(mulItem === key) return mulAri;
            mulAri.push(keyMapping.get(mulItem));
            var oArray = multiples.get(mulItem);
            oArray.splice(oArray.indexOf(mul), 1);
            return mulAri;
          }, []),
        };
      }
    });

    newArray.push({
      operation: 'multiplication',
      values: [keyMapping.get(key), enforceUniqueAddition(multipliers)],
    });
    return newArray;
  }, []);

  if(retItems.length < 2) return retItems[0];
  return {
    operation: 'add',
    values: retItems,
  };
};

stringifyObj = function(obj){
  if(typeof obj === 'number') return obj;

  if(obj.operation === 'add'){
    return `+(${obj.values.map(stringifyObj).join(',')})`;
  }

  if(obj.operation === 'multiplication'){
    return `*(${obj.values.map(stringifyObj).join(',')})`;
  }

  if(obj.operation === 'exponent'){
    return `${obj.value}^${stringifyObj(obj.exponent)}`;
  }
};

enforceUniqueMultiplication = function(items){
  var scope = new Map();
  items.forEach(function(item){
    if(typeof item === 'object'){
      switch(item.operation){
        case 'multiplication' : throw new Error('should never multiply in a multiply');
        case 'add' : throw new Error('should never add in a multiplication');
        case 'exponent' :
          if(!scope.has(item.value)) scope.set(item.value, []);
          scope.get(item.value).push(item.exponent);
          break;
        default : throw new Error(`invalid operation ${item.operation}`);
      }

    }else if(typeof item === 'number'){
      if(!scope.has(item)) scope.set(item, []);
      scope.get(item).push(1);
    }
  });

  return {
    operation: 'multiplication',
    values: Array.from(scope.keys()).map(function(key){
      var exponents = scope.get(key);
      if(exponents.length === 1 && exponents[0] === 1){
        return key;
      }

      if(exponents.length < 3){
        return {
          operation: 'exponent',
          value: key,
          exponent: {
            operation: 'add',
            values: exponents,
          },
        };
      }

      return {
        operation: 'exponent',
        value: key,
        exponent: enforceUniqueAddition(exponents),
      };
    }),
  };
};

enforceExponent = function(obj){
  var exponent = obj.exponent;
  if(typeof exponent === 'number'){
    if(exponent === 1) return obj.value;
    return obj;
  }

  return {
    value: obj.value,
    exponent: enforceUniqueness(exponent),
  };
};
