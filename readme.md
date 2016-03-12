Here are a bunch of failed compression ideas I had

# "Combo Metrics"

the first one inside combo metrics was meant to do the following
- Collect statistics that every single file has but causes uniqueness
  - File length (in bits)
  - Checksum - number of 1s in the file
  - Number of patterns
    - segment length - 01010 has a segment length of 1, 00110011 has a segment length of 2
    - repetitions - 0101 repeats 4 times 001100 repeats 3 times
    - starts with 1 - boolean
  - Number of unique pattern segment lengths
  - number of unique pattern repetitions
  - number of odd repetitions
  - number of 1 starts

And possibly some statistics that Will not get included
  - Order of pattern attributes
    - represented as 1001101 where the first digit is the difference between the second and the first number, second digit is the third and second, 3rd digit is the fourth number and the third number. Where 1 shows its going up and 0 going down.
    - does not contain the size of the attribute
    - does not contain repetitions
    - musted be done recursively

Essentially, with the hypothesis/goal is with the right information, you can turn any file into a bunch of 32 bit integers. This works great with some of them (particularly when they are symmetric or follow a pattern of some kind) but it doens't take much to bring up glaring issues.

Consider the following (if we can even find a way to get order without basically repeating the file)
- A file has 3 segments with no repetition
- We know the order of the segment lengths (biggest, smallest, middle)
- We know which are 1s and which are zeros (1, 0, 1)
- We know the total number of 1s and length.
  - We know the number of 0s and thus the length of the middle segment
  - We don't know is how big the biggest segment is and how small the smallest
    - Fact: length - ones + 1 < largest < (ones - (length - ones + 1))
    - Fact: smallest < middle < largest
    - But that tells us nothing unless (ones - (length - ones + 1) === 1)

For this particular case the number of possiblities are < 2^32 which is great! But what about (biggest, lowset, biggest - 1, lowest + 1, biggest - 2, lowest + 2...)? given a total number of 1s equal to 1000 over 10 possible, the number of combonations would equate to something like this
- There are 990 possibilities for the largest
- There are (991 - largest amount) for the second number
- There are (992 - second largest amount) for the thrid number
- etc

Each possibility would have to be multiplied out then added all togethor. I have little interest doing the math at this current point in time But I am quite confident it would lead to alot. Maybe less than a 32 bit integer... Ok... I should at least try to do the Math

```javascript

function countPossibilities(total, segments){
  if(segments === 1) return total;
  var possibilities = 0;
  for(var i = 1; i < total-segments; i++){
    possibilities += countPossibilities(total-i, segments-1);
  }
  return possibilities;
}

```

For reference a 32 bit unsigned integer is 2^32-1 or 4,294,967,295. Given this function I was able to predict that
- 20 distributed over 10 gives us 92,378
- 20 distributed over 15 gives us 2,176
- 30 distributed over 10 gives 22,496,760 possibilities (less than 32 bit integer)
- 30 distributed across 15 gives us 7,755,850 (less than 32 bit integer)
- 40 distributed across 10 gives us 721,540,996
- 40 distributed accross 15 gives us 27,685,460,160

For reference 8 bytes all having 5 1s can get us 20 40. If the goal was to reduce 8 bytes to 1 byte, then this algorithm is great. But that was not my intended goal nor would that be entirely accurate since I have to account for all the meta information included as well as the order (which is at max 1/3 of the entire document)

# Prime Numbers

The second idea was to have a 'baseless' number system. What would happen is...

- Take a document
- turn it into a gigantic number 2^(8 * byte length)
- Find all the prime factors of it
  - Factors that were too big would be turned into 'nth primes' which would basically just represent which prime it was
  - If the factor list was too long, I could find the biggest prime less than the number. Subtract it from the total, then move on from there with the rest
- ??
- Profit

Issue here is 'nth prime' and 'biggest prime less than'
- with a 24 bit prime number, it can be doable in about a minute (which is pretty bad)
- with a 32 bit prime, didnt even finish

The problem is finding these takes a long time. There is no equation such as f(x) = nthPrime. What I have to do is iterate through all the numbers until I find a valid one. Once that one is found I can do binary searches for all future primes. But that initial one is absolutely terrible and I would have to save the list of primes for later so I didn't recalculate each time. Another issue is I cannot distribute the load. All of it must be single threaded because I'm using all previous results inorder to find future results. Well thats not entirely true. It may be possible to leap frog results such as

```javascript

if(PREVIOUS_THREAD){
  maybeDone(PREVIOUS_THREAD);
}else{
  this.emit('startPriming', {
    start : 0,
    stop : Math.pow(2, 32),
    primes : this.maybeprimes,
  });
  maybeDone();
}

this.on('listenerThread', (nextThread)=>{
  this.nextThread = nextThread;
  this.nextThread.emit('startPriming', {
    start : this.start + this.stop + 1,
    stop : this.stop * 2,
    primes : this.maybeprimes,
  });
});

var isdone = 0;
function maybeDone(newPrev){
  if(!isdone && !newPrev) return isdone++;
  var newPrev = ;
  if(!newPrev){
    if(!this.nextThread) return this.emit('listenerThread', this);
    while(newPrev.nextThread) newPrev = newPrev.nextThread;
  }
  isdone = 0;
  newPrev.emit('listenerThread', this);
}

this.on('startPriming', (config)=>{
  var i = this.start = config.start;
  this.stop = config.stop;
  var l = i + config.stop;
  this.maybeprimes = config.primes;

  lazy(iterator(i,l)).iterateImmediate().filter(function(num){
    return isPrime(num, maybeprimes);
  }).each(function(num){
    maybeprimes.push(num);
    this.nextThread.emit('newPrime', num);
  }).then(function(){
    maybeDone();
  });
})

// when a new prime is found by a previous thread
this.on('newPrime', function(newPrime){
  // let your next know
  this.nextThread.emit('newPrime', newPrime);
  // filter out all primes that are divisible by the new prime
  // we can start from new prime * 2
  var i = binaryOps.getAny(this.maybeprimes, newPrime*2, orderingFn);
  if(i < Number.POSITIVE_INFINITY){
    var primes = this.maybeprimes;
    this.maybeprimes = primes.slice(0,i).concat(primes.slice(i).filter(function(num){
      return num%newPrime === 0;
    }));
  }
  insert our new prime
  binaryOps.insert(this.prevPrimes, newPrime, orderingFn);
});


```

Something like this may work but the fact remains that we have to iterate infinitely to find prime at X or why rather than have an equation to find it easily. Not as easy/simple



# Next Steps

I'll probably ignore compression for a while. Compression was done not so I can make a new zip file (though I realized soon while I was doing it what I was doing) but rather because I want to make unique hashes for any length of file that all can boil down to 16 hex characters. Therer are a couple problems with this goal

- Any file length wil result in the same 16 hex chars - arguably not that bad if the number of possibilities isn't that many
- all the permutations possible at that length will result in the same 16 hex chars - This is much worse in my opinion. The first is uncountable (though technically a length) since 1000 1s can be represented in the same amount of bytes as 10 1s. But possibilities are not as clean to work with

In some ways I believe that I can reuse one of these algorithms until I reach a satisfactory state. Where the first 8 bits will be used to represent how many times the algorithm has been used and as such, must be unwound. I also believe that this may be a fools journey however I'd rather be a fool chasing after a crush than intelligently looking for my one true love. Often times I'll run into a problem like this where I get to fool around with primes and try and do the seemingly impossible and it wil make me feel good.
