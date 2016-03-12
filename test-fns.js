'use strict';

module.exports.isUnique = function(current, availableValues){
  return !availableValues.some(function(available){
    return available.some(function(int, i){
      return current[i] === available[i];
    });
  });
};

module.exports.allCombos = function(){
  var longDivision = require('./long-division');
  var values = [];
  var isUnique = this.isUnique;
  var notUnique = 0;
  var numTooShort = 0;
  for(var n = 0; n < 256; n++){
    for(var d = 0; d < 256; d++){
      for(var o = 0; o < 256; o++){
        var current = [];
        var div = longDivision(n, d);
        var i = 0;
        var currentDigit;
        while(!(currentDigit = div.next()).done){
          if(i++ < 0) continue;
          current.push(currentDigit.value);
        }

        if(current.length < 256){
          numTooShort++;
        }else if(!isUnique(current, values)){
          notUnique++;
        }else{
          values.push(current);
        }
      }
    }
  }
  console.log(values, Z)
};
