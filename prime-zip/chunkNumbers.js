'use strict';
var cp = require('child_process');
var pointOfEntry = require('./pointOfEntry');
var BigInt = require('big-integer');
var Op = require('./operation');

var applyOffset, normalizeBuffers;
module.exports =  function(number, max, possiblePrimes, Operation){
  var chunks = [];
  for(var i = 0; i < number.length; i += max){
    chunks.push(number.slice(i, Math.min(i + max, number.length)));
  }

  var mappedPrimes = possiblePrimes.map(function(b){
    return b.toString(16);
  });

  return Promise.all(chunks.map(function(slice){
    return new Promise(function(res, rej){
      console.log('starting workers', slice.length);
      var worker = cp.fork(`${__dirname}/chunkNumbers.js`);
      worker.on('error', rej);
      worker.once('message', function(data){
        res(normalizeBuffers(data.data));
      });

      worker.send({
        type: 'UNKNOWN',
        arg: [slice, mappedPrimes, Operation.BIT_LIMIT],
      });
    });
  })).then(function(transformed){
    return new Operation(Operation.ADD,
      transformed.map(applyOffset.bind(void 0, Operation, max, possiblePrimes))
    );
  });
};

if(!module.parent){
  process.once('message', function(message){
    message.arg = normalizeBuffers(message.arg);
    var Operation = Op.factory(message.arg[2]);
    normalizeBuffers(message.arg[1], Operation);

    var res = pointOfEntry(message.arg[0], message.arg[1], Operation);
    return process.send(res);
  });
}

normalizeBuffers = function(array, Operation){
  return array.map(function(item){
    if(item instanceof Array) return normalizeBuffers(item, Operation);
    if(typeof item !== 'object') return BigInt(item, 16);
    if(item.type === 'Operation'){
      return new Operation(item.op, normalizeBuffers(item.values, Operation));
    }

    throw new Error('unexpected type: ' + item.type);
  });
};

applyOffset = function(Operation, max, possiblePrimes, item, i){
  if(i === 0) return item;
  if(BigInt.isInstance(item)){
    if(item.eq(2)) return pointOfEntry(BigInt(2).pow(8 * max * i + 1), possiblePrimes, Operation);
    return Operation(Operation.MUL, [
      pointOfEntry(BigInt(2).pow(8 * max * i), possiblePrimes, Operation), item,
    ]);
  }

  if(!item.isOperation){
    return Operation(Operation.MUL, [
      pointOfEntry(BigInt(2).pow(8 * max * i), possiblePrimes, Operation), item,
    ]);
  }

  if(!(item.op !== Operation.MUL && item.op !== Operation.EXP)){
    return Operation(Operation.MUL, [
      pointOfEntry(BigInt(2).pow(8 * max * i), possiblePrimes, Operation), item,
    ]);
  }

  if(item.op === Operation.EXP){
    if(!BigInt.isInstance(item.values[0])){
      return Operation(Operation.MUL, [
        pointOfEntry(BigInt(2).pow(8 * max * i), possiblePrimes, Operation), item,
      ]);
    };

    if(!item.values[0].eq(2)){
      return Operation(Operation.MUL, [
        pointOfEntry(BigInt(2).pow(8 * max * i), possiblePrimes, Operation), item,
      ]);
    }

    if(BigInt.isInstance(item.values[1])){
      item.values[1] = Operation(Operation.ADD, [
        pointOfEntry(8 * max * i, possiblePrimes, Operation), item.values[1],
      ]);
      return item;
    }else if(item.values[1].op === Operation.ADD){
      item.values[1].unshift(pointOfEntry(8 * max * i, possiblePrimes, Operation));
      return item;
    }else{
      item.values[1] = Operation(Operation.ADD, [
        pointOfEntry(8 * max * i, possiblePrimes, Operation), item.values[1],
      ]);
      return item;
    }
  }

  var Exp2;
  var index;
  if(!item.values.some(function(value, ii){
    if(value.op !== Operation.EXP) return false;
    if(BigInt.isInstance(value)){
      if(!value.eq(2)) return false;
      Exp2 = item;
      index = ii;
      return true;
    }

    if(!BigInt.isInstance(value.values[0])){
      return false;
    }

    if(value.values[0].eq(BigInt(2))) return false;
    Exp2 = value;
    index = i;
    return true;
  })){

    item.values.unshift(
      pointOfEntry(BigInt(2).pow(8 * max * i), possiblePrimes, Operation)
    );
    return item;
  }

  if(BigInt.isInstance(Exp2)){
    item.values.splice(index, 1);
    item.values.unshift(
      pointOfEntry(BigInt(2).pow(8 * max * i + 1), possiblePrimes, Operation)
    );
    return item;
  }

  if(BigInt.isInstance(Exp2.values[1])){
    item.values[1] = Operation(Operation.ADD, [
      pointOfEntry(8 * max * i, possiblePrimes, Operation), item.values[1],
    ]);
    return item;
  }else if(Exp2.values[1].op === Operation.ADD){
    item.values[1].unshift(
      pointOfEntry(8 * max * i, possiblePrimes, Operation)
    );
    return item;
  }else{
    item.values[1] = Operation(Operation.ADD, [
      pointOfEntry(8 * max * i, possiblePrimes, Operation), item.values[1],
    ]);
    return item;
  }
};
