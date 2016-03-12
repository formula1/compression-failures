'use strict';

var Writable = require('stream').Writable;
var BigNumber = require('big-number');
var BitPattern;

module.exports = BitPattern = function(){
  Writable.call(this);
  this.totalBits = BigNumber(0);
  this.totalOnes = BigNumber(0);

  this.currentSegment = [];
  this.patterns = [];
  this.currentPattern = {
    startsWith: 0,
    totalLength: 0,
    segmentLength: 0,
  };
};

BitPattern.prototype = Object.create(Writable.prototype);
BitPattern.prototype.constructor = BitPattern;
var oneCounter, patternChecker;
BitPattern.prototype._write = function(bytes, encoding, next){
  var l = bytes.length;
  this.totalBits = this.totalBits.plus(l * 8);
  for(var i = 0; i < l; i++){
    var currentNum = bytes.readInt8(i);
    if(currentNum > 0){
      for(var p = 0; p < 8; p++){
        var bit = Math.min(currentNum & Math.pow(2, p), 1);
        oneCounter.call(this, bit);
        patternChecker.call(this, bit);
      }
    }
  }

  next();
};

BitPattern.prototype._flush = function(){
  var curSegment = this.currentSegment;
  if(!this.currentPattern && !curSegment) return;
  this.patterns.push(this.currentPattern);
  if(this.currentPattern.segmentLength === curSegment.length){
    this.currentPattern.totalLength++;
  }else if(curSegment.length){
    this.patterns.push({
      startsWith: curSegment[0],
      totalLength: 1,
      segmentLength: curSegment.length,
    });
  }
};

oneCounter = function(bit){
  if(bit) this.totalOnes = this.totalOnes.plus(1);
};

var passesPattern;
patternChecker = function(bit){
  var currentPattern = this.currentPattern;
  var currentSegment = this.currentSegment;

  // is brandnew
  if(currentPattern.segmentLength === 0){
    this.currentPattern = {
      startsWith: bit,
      totalLength: 0,
      segmentLength: -1,
    };
    this.currentSegment = [bit];
    return;
  }

  // if fresh segment
  var matchesSegment = bit === this.currentSegment[0];
  if(currentPattern.segmentLength === -1){
    if(matchesSegment){
      currentSegment.push(bit);
    }else{
      currentPattern.segmentLength = currentSegment.length;
      currentPattern.totalLength += 1;
      this.currentSegment = [bit];
    }

    return;
  }

  // if the current Segment has met its max length
  if(currentSegment.length === currentPattern.segmentLength){
    // check what the bit should be
    // when beginning second segment it should be !startsWith
    // when beginning third segment it should be startsWith
    // etc
    var startsWith = currentPattern.startsWith;
    if(!!bit === (currentPattern.totalLength % 2 ? !!startsWith : !startsWith)){
      currentPattern.totalLength++;
      this.currentSegment = [bit];
      return;
    }

    // If this isn't true, we have a segment that is about to be too long
  }else if(matchesSegment && currentSegment.length < currentPattern.segmentLength){
    // since we aren't at the end, so long as its just another bit, no issue
    currentSegment.push(bit);
    return;
  }

  this.patterns.push(currentPattern);

  var startsWith = currentSegment[0];

  var totalLength, segmentLength;
  if(matchesSegment){
    totalLength = 0;
    segmentLength = -1;
    currentSegment.push(bit);
  }else{
    totalLength = 1;
    segmentLength = currentSegment.length;
    this.currentSegment = [bit];
  }

  this.currentPattern = {
    startsWith: startsWith,
    totalLength: totalLength,
    segmentLength: segmentLength,
  };
};

passesPattern = function(pattern, bit){
  if(pattern.segmentLength === 1) debugger;
  var boo;
  if(pattern.totalLength % 2 == 0){
    // we are in initial area
    boo = pattern.startsWith;
  }else{
    // then we are in opposite area
    boo = !pattern.startsWith;
  }

  if(!bit !== !boo) return false;
  return true;
};
