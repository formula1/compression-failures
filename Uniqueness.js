
// this is similar to sudoku
// attempting to have unique pairings between both input and matches
// the problem starts arrising when
// [abc, d, e, f], [a, b, c, d]
// technically this worked since
// - a is only satisified by 1, b is only satisfied by 1 and c is only satisfied by 1
// if we do the reverse we now run into an issue where e and f are unsatsified all
// have the same satisfaction
// [ab, ab, abc, de, ef, fab], [ab, bc, cd, ef, dbe]
// How many ways can this be satisfied?
// - 6 must be e because db are satsified and neither a nor b are matching
// - a, b, c, f, e
// - 2 must be be because 3 doesn't have a d to be capable of satisfying
//
// [a, b, c, d, e, f, g], [abc, bcd, dab, cef, gef, gae];
// [1, 2, 3], [2, 3, 4], [1, 2, 4], [3, 5, 6], [5, 6, 7][1, 5, 7]
// 1, ?, [2, 4], ?, ?, [5, 7] -> branch
// 1, [2, 3, 4], [2, 4], [3, 6], [6, 7], 5 ->
// 1, [2, 3, 4], [2, 4], [3, 6], [6, 7], 5
// matches are unique
module.exports.allUniquePossible = allUniquePossible = function(evaluate, limit, inputs, matches){
  var notUniqueMatches = new Set(matches);
  var notUniqueInputs = new Set(inputs);
  var inputsToMatches = new Map();
  var matchesToInputs = new Map();
  var uniqueInputToMatches = new Map();

  var setAToB, setSingleMatch;

  setSingleMatch = function(input, match){
    notUniqueMatches.remove(match);
    notUniqueInputs.remove(input);
    uniqueInputToMatches.set(input, match);
    var others = matchesToInputs.get(match);
    matchesToInputs.remove(match);
    if(others.size() === 1) return;
    for(var other of others){
      var otherMatches = inputsToMatches.get(other);
      otherMatches.remove(match);
      if(otherMatches.size() === 0){
        throw new Error('no possibilities for this input');
      }
      if(otherMatches.size() === 1){
        setSingleMatch(other, otherMatches.get(0));
      }
    }
  };

  inputs.forEach(function(input){
    var s = new Set();
    for(var match of notUniqueMatches){
      if(evaluate(input, match)){
        s.add(match);
        if(!matchesToInputs.has(match)){
          matchesToInputs.set(match, new Set());
        }
        matchesToInputs.get(match).add(input);
      }
    }
    if(s.size() === 0){
      throw new Error('no possibilities available for this input');
    }
    if(s.size() === 1){
      var match = s.get(0);
      setSingleMatch(input, match);
    }
  });

  function setSingleInput(input, match){
    notUniqueMatches.remove(match);
    notUniqueInputs.remove(input);
    uniqueInputToMatches.set(input, match);
    var matches = inputsToMatches.get(input);
    inputsToMatches.remove(input);
    if(matches.size() === 1) return;
    for(var other of matches){
      var otherInputs = matchesToInputs.get(other);
      otherInputs.remove(input);
      if(otherInputs.size() === 0){
        throw new Error('no possibilities for this input');
      }
      if(otherInputs.size() === 1){
        setSingleInput(otherInputs.get(0), other);
      }
    }
  }

  function tryToTriggerChain(A, listA, listB, sequence, all){
    var Bs = listA.get(A);
    for(var B of Bs){
      var queued = new Map();
      var tempA = new Set(listA);
      var tempB = new Set(listB);
      var localSequence = sequence.slice(0);
      try{
        setAToB(A, B, tempA, tempB, localSequence, queued, all);
      }catch(e){
        console.log('found an impossibility', e);
      }
      for(var item of queued.values()){
        tryToTriggerChain(item[0], item[1], item[2], localSequence, all);
      }
    }
  }

  setAToB = function(A, B, listA, listB, sequence, queued, all){
    queued.remove(A);
    var Bs = listA.get(A);
    if(Bs.size() === 1) throw sequence;
    if(Bs.size() === 1){
      if(Bs.get(0) !== A) throw sequence;
      return;
    }else{
      var As = listB.get(B);
      if(As.size() > 1){
        sequence.push([A, B]);
      }
      Bs.remove(B);
      listA.set(A, new Set([B]));
      setAToB(B, A, listB, listA, sequence, queued, all);
    }
    var queued = new Set();
    for(var oB of Bs){
      var oAs = listB.get(oB);
      oAs.remove(A);
      if(oAs.size() === 0) throw sequence;
      if(oAs.size() === 1){
        setAToB(oAs.get(0), oB, listA, listB, sequence, queued, all);
        continue;
      }
      queued.set(oB, [oB, listB, listA]);
    }

    if(queued.size() === 0){
      return all.push(sequence);
    }
  };

  Array.form(notUniqueMatches.values()).forEach(function(match){
    var inputs = matchesToInputs.get(match);
    if(inputs.size() === 1){
      var input = inputs.get(0);
      setSingleInput(input, match);
    }
  });
  if(notUniqueMatches.size() === 0){
    return [inputs.map(function(input){
      return { input : input, match : inputsToMatches.get(input).get(0) };
    })];
  }
  var all = [];
  tryToTriggerChain(inputs[0], notUniqueInputs, notUniqueMatches, [], all);
  return all.map(function(sequence){

    return sequence.map(function(ab){
      return notUniqueInputs.has(ab[0]) ?
        { input : ab[0], match : ab[1] } :
        { input : ab[1], match : ab[0] };
    }).concat(Array.from(uniqueInputToMatches.keys()).map(function(input){
      return { input : input, match : uniqueInputToMatches.get(input).get(0) };
    }));
  });
};

  /*

    They have many matches, but it isn't circular
    [123], [13], [12]
    [123], [13], [12]
    - [1, 3, 2], [1, 3, 2]
      - [1--], [1--]
      - remove 1s ffrom the second list
      - [1--], [13-]
      - sets off a chain
      - [1-2], [13-]
      - remove 2s from the first list (does nothing)
      - remove 3s from the first second (does nothing)
      - [1-2], [13-]
      - continue removing 1s
      - [1-2], [132]
      - sets off chain
      - [132], [132]
      - remove 3s from the first list (does nothing)
      - remove 2s from the second list (does nothing)
      - remove 1s from the first list (does nothing)

    - [2, 3, 1], [3, 1, 2]
      - I see a pattern here
      - I assume that since
        - there is only three distinct values for the first item
        - This is a closed loop
        - the last form of '2' caused a chain and set the other array to 3
        - Both arrays have nearly identical structures
        - I can assume that 3 will also cause a chain
    -
      - Set first item to 2
      [2, -, -], [-, -, -]
      -sets off chain
      [2, -, -], [-, 1, -]
      - Remove 1s from second list
      [2, -, -], [-, 1, 2]
      - sets off chain
      [2, 3, -], [-, 1, 2]
      - Remove 3 from first list (does nothing)
      - Remove 2s from second list
      [2, 3, -], [3, 1, 2]
      - sets off chain
      [2, 3, 1], [3, 1, 2]
      - Remove 1s from first list (does nothing)
      - Remove 3s from second list (does nothing)

  */

/*

  Issue, there is usually a definitive weakest link that reduces the total amount of guesses
  There are generally strongest links that don't reduce it as much
  Then there are circular patterns that don't seem to matter
*/

/*

- We find one that is unique
  - We add that to the isUnique Array
- Each one after is removed
  - We chec

*/
