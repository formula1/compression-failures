'use strict';
var BigInt = require('big-integer');
var findLargestMultipleOfLessThan = require('./findLargestLessThan');
module.exports = function(number, possiblePrimes){
  console.log('MAKE SUM');

  var currentValue = number;
  var sum = [];
  do{
    debugger;
    console.log('Sum Start', currentValue.toString(16));
    var largest = findLargestMultipleOfLessThan(possiblePrimes, currentValue);
    var percent = largest.value.multiply(100).divide(currentValue);
    var oldValue = currentValue;
    currentValue = currentValue.subtract(largest.value);

    if(typeof largest.factors == 'object') console.log('length: ', largest.factors.length);
    else console.error('LARGEST IS NOT an ARRAY', largest);

    largest.factors = largest.factors.reduce(function(array, num){
      var last = array[array.length - 1];
      if(last){
        if(num.eq(last.value)){
          last.exponent = last.exponent.add(1);
          return array;
        }

        if(last.exponent.eq(1)){
          array.pop();
          array.push(last.value);
        }else{
          last.exponent = require('./pointOfEntry')(last.exponent, possiblePrimes);
        }
      }

      array.push({
        operation: 'exponent',
        value: require('./pointOfEntry')(num, possiblePrimes),
        exponent: BigInt(1),
      });

      return array;
    }, []);

    var last = largest.factors[largest.factors.length - 1];
    if(last){
      if(last.exponent.eq(1)){
        largest.factors.pop();
        largest.factors.push(last.value);
      }else{
        last.exponent = require('./pointOfEntry')(last.exponent, possiblePrimes);
      }
    }

    if(largest.factors.length > 1){
      sum.push({
        operation: 'multiplication',
        values: largest.factors,
      });
    }else sum.push(largest.factors[0]);

    console.log(percent.toString(), '% Stripped off');
    console.log('Sum End');
  }while(currentValue.gt(1));

  if(currentValue.eq(1)) sum.push(1);

  // if theres more than one thing to add we need this operation
  if(sum.length > 1){

    return {
      operation: 'add',
      values: sum,
    };
  }

  if(sum.length == 0) throw new Error('should not be 0');

  return sum[0];
};
