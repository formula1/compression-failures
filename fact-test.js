'use strict';

console.log('FACTORIZER');
var BigInt = require('big-integer');
var fs = require('fs');
var path = require('path');
var factorizer = require('./factorizer-int-bases');

var int = BigInt(2).pow(32);
var MAX = BigInt(2).pow(64);
(function runner(){
  if(int.gt(MAX)) return console.log('finished');
  process.stdout.write(int.toString(10));
  if(int.eq(4370)) debugger;
  var operations = factorizer(int, 16);
  var formatted = operations.arrayFormat;
  console.log('=', formatted);

  //  debugger;
  if(formatted.length > 16) console.log(' =', formatted);

  var decoded = factorizer.decode(formatted);
  if(decoded.compare(int) !== 0){
    console.log(decoded.toString(16), int.toString(16));
    throw new Error('In and out aren\'t equal');
  }

  int = int.add(1);
  setImmediate(runner);
})()

/*
debugger;

fs.readFile(path.join(__dirname, './pattern-zip.js'), function(err, buffer){
  var factorizer = require('./factorizer-int');
  factorizer(buffer, 256).then(function(netValue){
    console.log(netValue);
  });
});
*/
