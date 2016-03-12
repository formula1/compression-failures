20 distributed across 10 segments

function countPossibilities(total, segments){
  if(segments === 1) return total;
  var possibilities = 0;
  for(var i = 1; i < total-segments; i++){
    possibilities += countPossibilities(total-i, segments-1);
  }
  return possibilities;
}

largest = 20
largest-1 = 19
largest-2 = 18
largest-3 = 17
largest-4 = 16
largest-5 = 15
largest-6 = 14
largest-7 = 13
largest-8 = 12
largest-9 = 11-1 = 10

10 Possibilities

largest = 20
largest-1 = 19
largest-2 = 18
largest-3 = 17
largest-4 = 16
largest-5 = 15
largest-6 = 14
largest-7 = 13
largest-8 = 11
largest-9 = 10-1 = 9

9 possibilities

largest = 20
largest-1 = 19
largest-2 = 18
largest-3 = 17
largest-4 = 16
largest-5 = 15
largest-6 = 14
largest-7 = 13
largest-8 = 10
largest-9 = 9-1 = 8

8 possibilities


largest = 20
largest-1 = 19
largest-2 = 18
largest-3 = 17
largest-4 = 16
largest-5 = 15
largest-6 = 14
largest-7 = 13
largest-8 = 10
largest-9 = 9-1 = 7

8 possibilities
