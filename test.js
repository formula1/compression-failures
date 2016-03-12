'use strict';

var fs = require('fs');
var PatternZip = require('./combo-metrics-zip');
var path = require('path');

var pz = new PatternZip();
var rs = fs.createReadStream(
  path.join(__dirname, './combo-metrics-zip/index.js')
);

rs.on('end', function(){
  console.log('readstream ended');
});

rs.pipe(pz).on('finish', function(){
  console.log(pz.totalBits);
  console.log(pz.totalOnes);

  var total = 0;

  //console.log(pz.patterns);
  var def = pz.patterns.reduce(function(map, pattern){
    var key = `${pattern.startsWith}:${pattern.segmentLength}:${pattern.totalLength}`;
    if(!map[key]) map[key] = 0;
    map[key] += 1;
    total++;
    return map;
  }, { One: {}, Zero: {} });

  console.log(def, total);

  var bn = require('big-number');
  var tFact = bn(1);
  while(total > 0) tFact = tFact.multiply(total--);

  Object.keys(def).forEach(function(key){
    var t = def[key];
    while(t > 0) tFact = tFact.divide(t--);
  });

  console.log(tFact + 0);

});
