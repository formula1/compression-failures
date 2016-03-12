'use strict';

var Operation;

module.exports = Operation = function(op, values){
  this.op = op;
  this.values = values;
};

Operation.factory = function(BitLimit){
  var Ret = function(){ Operation.apply(this, arguments); };
  Ret.prototype = Object.create(Operation.prototype);
  Ret.prototype.constructor = Ret;
  Ret.BIT_LIMIT = BitLimit;
  Ret.MAX_PRIMES = BitLimit - 7; // two more for 0 and 1
  Ret.ADD = BitLimit - 4;
  Ret.MUL = BitLimit - 3;
  Ret.EXP = BitLimit - 2;
  Ret.NTH = BitLimit - 1;
  Ret.OPEN_CLOSE = BitLimit;

  Ret.READABLES = {};
  Ret.READABLES[Ret.ADD] = 'ADD';
  Ret.READABLES[Ret.MUL] = 'MUL';
  Ret.READABLES[Ret.EXP] = 'EXP';
  Ret.READABLES[Ret.NTH] = 'NTH';
  Ret.READABLES[Ret.OPEN_CLOSE] = '{}';

  return Ret;
};

Operation.prototype.isOperation = true;

Object.defineProperty(Operation.prototype, 'netLength', {
  get: function(){
    return this.values.reduce(function(len, curValue){
      if(!curValue.isOperation) return len + 1;
      return len + curValue.netLength;
    }, this.values.length > 2 ? 3 : 1);
  },
});

var BigInt = require('big-integer');
Object.defineProperty(Operation.prototype, 'arrayFormat', {
  get: function(){
    var CLASSVAR = this.constructor;
    var formatted = this.values.reduce(function(total, curValue){
      if(curValue.isOperation) return total.concat(curValue.arrayFormat);
      if(BigInt.isInstance(curValue)) return total.concat([curValue.toJSNumber()]);
      return total.concat([curValue]);

    }, []);

    if(this.values.length > 2){
      return [CLASSVAR.READABLES[this.op], CLASSVAR.READABLES[CLASSVAR.OPEN_CLOSE]]
        .concat(formatted)
        .concat([CLASSVAR.READABLES[CLASSVAR.OPEN_CLOSE]]);
    }

    return [CLASSVAR.READABLES[this.op]].concat(formatted);
  },
});
