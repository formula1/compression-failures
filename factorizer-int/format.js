'use strict';

var toCommandArray, commandReducer;
module.exports.toCommandArray = toCommandArray = function(obj){
  var t = typeof obj;
  if(t === 'object'){
    switch(obj.operation){
      case 'add' :
        console.log('ADDING');
        if(obj.values.length < 2){
          throw new Error('Cannot add values when there are less than 2 of them');
        }

        if(obj.values.length === 2){
          return ['ADD'].concat(obj.values.reduce(commandReducer, []));
        }

        return ['ADD', 'OPEN']
        .concat(obj.values.reduce(commandReducer, []))
        .concat(['CLOSE']);
      case 'multiplication' :
        if(obj.values.length < 2){
          throw new Error('Cannot multiply values when there are less than 2 of them');
        }
        console.log('MULTIPLYING');
        if(obj.values.length === 2){
          return ['MUL'].concat(obj.values.reduce(commandReducer, []));
        }

        return ['MUL', 'OPEN']
        .concat(obj.values.reduce(commandReducer, []))
        .concat(['CLOSE']);
      case 'exponent' :
        console.log('POWER');
        return commandReducer(['EXP', obj.value], obj.exponent);
      default:
        throw new Error('Invalid Operation ' + obj.operation);
    }
  }else if(t === 'number'){
    console.log('NUMBER');
    return obj;
  }else{
    throw new Error('Can\'t handle invalid type ' + t);
  }
};

commandReducer = function(ari, value){
  var val = toCommandArray(value);
  if(!(val instanceof Array)) val = [val];
  return ari.concat(val);
};
