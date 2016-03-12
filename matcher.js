'use strict';

var matches, matchObj, matchArray, matchSequence,
matchString, matchNumber, curry, passesEnough, equal, not;

module.exports.matches = matches = function(obj, tester){

  var tt = typeof tester;
  if(tt !== 'object') return equal(obj, tester);
  if('is' in tester) return tester.is;
  if('not' in tester && matches(obj, tester.not)) return false;
  delete tester.not;

  // if any passes, we can continue cleanly
  if('or' in tester && !passesEnough(tester.or, curry(matches, obj))){
    return false;
  }

  delete tester.or;

  // if any passes, we can continue cleanly
  if('and' in tester && passesEnough(tester.and, not(curry(matches, obj)))){
    return false;
  }

  if('passes' in tester){
    var limit = tester.passes.limit;
    var queries = tester.passes.queries;
    if(!passesEnough(queries, curry(matches, obj), limit)){
      return false;
    }
  }

  delete tester.passes;

  delete tester.and;

  var to = typeof obj;
  if(to !== 'object'){
    switch(to){
      case 'string' : return matchString(obj, tester);
      case 'number' : return matchNumber(obj, tester);
      case 'undefined' : return !obj == !tester;
    }
  }

  if(obj === null){
    return equal(obj, tester);
  }

  if(obj instanceof 'array'){
    if(tt !== 'object') return false;
    return matchArray(obj, tester);
  }

  return matchObj(obj, tester);
};

module.exports.matchString = matchString = function(input, tester){
  if('regexp' in tester){
    var regexp = new RegExp(tester.regexp);
    if(!regexp.test(input)) return false;
  }

};

module.exports.matchString = matchNumber = function(input, tester){
  if('lt' in tester && input >= tester.lt) return false;
  if('gt' in tester && input <= tester.lt) return false;
  if('lte' in tester && input > tester.lt) return false;
  if('gte' in tester && input < tester.lt) return false;
  return true;
};

matchObj = function(obj, tester){
  return !Object.keys(tester).some(function(key){
    // if the filter passes, we exit early
    if(!(key in obj)) return true;
    return matches(obj[key], tester[key]);
  });
};

module.exports.matchArray = matchArray = function(obj, tester){
  if(tester instanceof Array) return matchSequence(obj, tester);

  if('any' in tester && !passesEnough(obj, curry(matches, void 0, tester.any))){
    return false;
  }

  delete tester.any;

  if('all' in tester && passesEnough(obj, not(curry(matches, void 0, tester.all)))){
    return false;
  }

  delete tester.all;

  if('enough' in tester){
    var limit = tester.enough.limit;
    var query = tester.enough.query;
    if(!passesEnough(obj, curry(matches, void 0, query), limit)){
      return false;
    }
  }

  if('ensure' in tester){
    if(passesEnough(obj, function(item){
      return passesEnough(curry(not(matches), item), tester.ensure);
    })) return false;
  }

  if('intersects' in tester){
    if(!passesEnough(obj, function(item){
      return passesEnough(curry(matches, item), tester.ensure);
    })) return false;
  }

  return true;
};

/*

Way it works is....

Starts with
- Makes first sequences failure a complete failure

Ends With (maybe possible to try and hit it from both ends)
- Makes final Sequences failure a complete failure

Run Rule(array, i)
- rules = Look ahead until you hit a breaking point
- Use these items to test a block of values
- When it doesn't match
- Run Rule (array i + rules.length);

RegExp rules
- StartsWith

- Maybe - 0 or 1 times (just repetiton)

- Repeats
  - can be a range, a number or a possible number
    - with possible number
  - 0 to infinite times



-EndsWith
*/

var getRule, runRule;
module.exports.matchSequence = function(inputSequence, testSequence){

  var ruleMap = [];
  var start = getRule(testSequence, 0);
  testSequence = testSequence.slice(start.sequence.length);
  var validRules = [];
  if(!('startsWith' in testSequence[0])){
    ruleMap[1] = start;
    ruleMap.push({
      min: 0, max: 'infinity', sequence: [{ is: true }],
    });
    ruleMap.push(start);
    start.ruleIndex++;
    start = ruleMap[0];
  }

  function findOrMakeNextRule(rule){
    if(rule.isEnd) return false;
    if(ruleMap.length === rule.ruleIndex + 1){
      var nextRule = getRule(testSequence, rule.ruleIndex + 1);
      ruleMap.push(nextRule);
      testSequence = testSequence.slice(nextRule.sequence.length);
    }

    return JSON.parse(JSON.stringify(ruleMap[rule.ruleIndex + 1]));
  }

  start.isStarter = true;
  var validRules = [];
  var endFinishedHappy = false;
  try{
    inputSequence.reduce(function(currentValid, input){
      if(currentValid.length === 0) throw 'sequenceMatch: no more matchers';
      return currentValid.reduce(function(nextValid, rule){
        while(rule){
          var result = runRule(rule, input);
          if(result !== -1) break;
          if(result.isEnd) throw 'sequenceMatch: have inputs after end';

          // if we get a result of negative it means that we have been satisified but
          // we can no longer accept characters
          // as a result, the current input should be considered to be for the next test
          // this will happen so long as there is a rule
          rule = findOrMakeNextRule(rule);
        }

        if(!rule){
          throw 'ok';
        }

        switch(result){
          // If the result never made it to the minimum then the next rule can't trigger
          case -2:
            if(rule.isStarter) throw 'sequenceMatch: start cannot fail, only disappear';
            if(rule.isEnd) endFinishedHappy = false;
            return nextValid;
          case 0:
            if(rule.isEnd) endFinishedHappy = false;
            return nextValid.concat([rule]);
          case 1:
            if(rule.isEnd) endFinishedHappy = true;
            return nextValid.concat([rule, findOrMakeNextRule(rule)]);
        }
      }, [start]);
    }, validRules);
  }catch(e){
    if(typeof e !== 'string') throw e;
    if(!/^sequenceMatch: /.test(e)) throw e;
    console.error(e);
    return false;
  }

  return endFinishedHappy;
};

getRule = function(testSequence, ruleIndex){
  if(testSequence.length === 0){
    return {
      sequence: [{ is: true }],
      min: 0,
      max: 'infinity',
      offset: 0,
      repetition: 0,
      ruleIndex: ruleIndex,
      consumed: [],
      isEnd: true,
    };
  }

  var strip = [];
  var test;
  var limit;
  for(var i = 0; i < testSequence.length; i++){
    test = testSequence[i];
    if(typeof test !== 'object') strip.push(test);
    if('limit' in test){
      limit = test.limit;
      break;
    }

    strip.push(test);
  }

  var min = !limit ? 1 : typeof limit.min === 'number' ? limit.min : 1;
  var max = !limit ? min : limit.max === 'infinity' ? Number.POSITIVE_INFINITY : limit.max || min;

  return {
    sequence: strip,
    min: min,
    max: max,
    offset: 0,
    repetition: 0,
    ruleIndex: ruleIndex,
    consumed: [],
    isEnd: i === testSequence.length && test.end,
  };
};

runRule = function(rule, input){
  if(rule.offset === rule.strip.length){
    rule.repitions++;
    if(rule.repitions === rule.max) return -1;
    if(rule.repitions > rule.max) return -2;
    rule.offset = 0;
  }

  if(!matches(rule.sequence[rule.offset++], input)){
    return rule.repitions >= rule.min ? -1 : -2;
  }

  rule.consumed.push(input);
  return rule.repitions >= rule.min && rule.offset === rule.sequence.length ? 1 : 0;
};

module.exports.equal = equal = function(a, b){
  var atype = typeof a;
  if(atype !== typeof b) return false;
  if(atype !== 'object') return a === b;
  if(a === null || b === null) return a === b;
};

module.exports.not = not = function(evaluate){
  if(typeof evaluate === 'boolean') return !evaluate;
  return function(a, b){
    return !evaluate(a, b);
  };
};

module.exports.curry = curry = function(fn, a, b){
  return function(arg){
    fn(a == void 0 ? arg : a, a == void 0 ? b : arg);
  };
};

module.exports.passesEnough = passesEnough = function(list, evaluate, limit){
  var count = 0;
  if(limit === void 0) limit = 1;
  return list.some(function(item){
    if(evaluate(item)) count++;
    return !(count < limit);
  });
};
