/*
  TODO:
    patterns = 2
      - 0011111 -
    unique = 2

    Unknown


*/

var sameBits, samePattern;
module.exports = function(patternZip){
  var length = patternZip.bitCount;
  var ones = patternZip.oneBitCount;

  // A pattern is a sequence of ones and zeroes that are symetric
  // 00110011, 0101010, 1111000011110000 all considered patterns
  var patterns = patternZip.patternCount;

  // patterns can be of any length and anywhere. But there are only a certian amount of unique patterns
  // 011110 -> 2 uniques (1 count and 4 count), 0101000 -> 2 uniques (1 count and 4 count)
  var uniques = patternZip.uniqueCount;

  // The number of repetitions of all patterns
  // 010101 is considered one pattern but 6 repetitions
  var repetitions = patternZip.repetitiionCount;

  // Finding out how many starts / ends is helpful to understanding positioning
  // 0101010000 has 0 one starts, 10101111 has 2 one starts
  // 110011110000 has 2 one starts, 001100001111 has 0 one starts (same amount of 1s)
  var starts = patternZip.oneStartCount;

  var startsWithOne = patternZip.startsWithOne;

  if(ones === 0 || ones === length){
    return sameBits(length, ones, patterns, starts, repetitions);
  }

  if(patterns === 1){
    samePattern(length, ones, patterns, starts, repetitions);
  }

  /*
    when patterns > 1 we can have situations like this
    2 = 11111100
  */
  if(patterns === 2){
    if(repetitions == 2){
      // we know its one of two options
      // 00111111
      // 11111100
      // We need to know who went first
      var current = startsWithOne ? 1 : 0;
      var current, firstSeg;
      if(starts === 0){
        current = 0;
        firstSeg = length - ones;
      }else{
        current = 1;
        firstSeg = ones;
      }

      var ari = [];
      for(var i = 0; i < firstSeg; i++) ari.push(current);
      current = current ? 0 : 1;
      for(var i = 0; i < length - firstSeg; i++) ari.push(current);
      return ari;
    }

    // we know it can be any of the following
    // 0101010111

    if(repetitions === 3){
      // this cannot be 10001 because patterns = 2
      // can only be 010000 or 00110000 or 0001110000
      // can only be 101111 or 11001111 or 1110001111

      var current, patterned;
      if(starts === 0){
        current = 0;
        patterned = ones;
      }else{
        current = 1;
        patterned = length - ones;
      }

      // can only be 010000 or 00110000 or 0001110000
      // regardless, the number of ones will indicate how much one of the patterns is
      var ari = [];
      var i;
      for(i = 0; i < patterned; i++) ari.push(current);
      current = current ? 0 : 1;
      for(i = 0; i < patterned; i++) ari.push(current);
      current = current ? 0 : 1;
      for(i = 0; i < length - patterned * 2; i++) ari.push(current);
      return ari;
    }
    if(repetitions === 4){
      // 010011
      // 101100
      // 101000
      if(starts === 0 || starts === 2){
        // only 110010 or 101100 or 001101 or 010011
        // we dont know the count per pattern so we can't tell the difference between
        // 001101 and 010011
        // I could include a 'change map' 1 for up, 0 for down and no changes are ignored
        // this map could be pretty big tbh, also it doesn't define too much since...
        // - We don't know how much
        // 00001111010011 is treated the same as 00011101000111
        // IF the map was as so
        // 1110 (how much to raise and raise end) 001 (how much to lower and lower end)
        // then we would be able to find out more
        // but this is pretty useless in causes such as 0000 1000 0010 0010 0100 01
        // since that would equate to 11110 0001 11110 00001 110 001 10 01 110 001
        // which is longer than the first 22 < 22 + 13
        // This is a derivative for the most part which depends on
        // - Repeating patterns, gradual changes between patterns
        // just the map itself tells us alot about what happens (as 1 up, 0 down)
        // - it will always be smaller than the original file
        //    - all 0101 will give us 1 as a map and thats it
        //    - 001001001 will give us 01010 cutting out a 3rd of the original
        //    - so unless if 6 * 8 > original / 3 - we are losing size

        if(uniques)
      }
    }
  }


  if(repetition === uniques){
    // each pattern is unique and repeats once
    var uniquesMin = 0;
    var copyUniques = uniques;
    while(copyUniques++ < uniques) uniquesMin += copyUniques;
    if(uniquesMin === length){
      // we know that it must be 0110001111 etc
      // we do not know the order of these however
      // 1111011100 is the same as 1110011110
      // I could do zero order and 1 order
      // would only consider starts of patterns not repetitions
      //
    }
  }

  if(uniques )

  if(patterns == 3){
    // Otherwise it can be
    // 00111100, 01111110, 00011000
  }


  return false;
};

sameBits = function(length, ones){
  var ari = [];
  var toPush = ones === length ? 1 : 0;
  for(var i = 0; i < length; i++) ari.push(toPush);
  return ari;
};

samePattern = function(length, ones, patterns, startsWith, repetitions){

  if(startsWith > 1){
    throw new Error('cannot have more than one start with single patterns');
  }

  // Important to note, starts with enables even repetition counts
  // 010101 === 101010 in length, ones, patterns and repetitions
  // but startswith tells us if its 0 or 1 at the beginning
  // Odds don't need it since
  // 110011 !== 001100 in ones
  var start = startsWith ? 1 : 0;
  if(length % 2 === 1 && repetitions % 2 === 0){
    throw new Error('Can not have an odd count and an even amount of repetitions');
  }

  if(length % repetitions > 0){
    throw new Error('segments should be evenly divided through the length');
  }

  var numberPerSegment = length / repetitions;
  if(repetitions % 2 === 1){
    if(start && length - ones > ones){
      throw new Error('odd repetition counts and 1 starts mean 1 count > 0 count');
    }

    if(!start && length - ones < ones){
      throw new Error('odd repetition counts and 0 starts mean 0 count > 1 count');
    }
  }

  var current = start;
  var ari = [];
  for(var r = 0; r < repetitions; r++){
    for(var n = 0; n < numberPerSegment; n++) ari.push(current);
    current = current ? 0 : 1;
  }

  return ari;
};
