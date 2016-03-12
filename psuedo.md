'use strict';


  I need about 6 operators?
    - 2 - Open Block, close block
    - chunk - Specifies that the next equation represents an index out of a total
    - add - Species to do an add operation with all in their open/close block
      - ADD OPEN number Operator OPEN number number number CLOSE number CLOSE
    - multiply -
    - Exponent - Species that the first number should be raised to the power of the second
      - The first will always be a digit, the second may or may not be
      - EXPONENT number number
      - EXPONENT number

  format
    - chunk(length, index)

  num of 0s | number | num of 0s

  get 1st offset and last 1 offset

  could be...
  additive (0,1,factor Sequence)

chunk(
 add(multiply(byte^byte, byte^byte, byte^byte, byte^byte),  multiply(byte^byte, byte^byte, byte^byte, byte^byte)),
 add(multiply(byte^byte, byte^byte, byte^byte, byte^byte),  multiply(byte^byte, byte^byte, byte^byte, byte^byte)),
 add(multiply(byte^byte, byte^byte, byte^byte, byte^byte),  multiply(byte^byte, byte^byte, byte^byte, byte^byte)),
);


  We can do first 16 primes for this.
  So what the 4 bits represents is the 16 primes
  we get all the factors for the number
  if any of those powers are greater than the 16th prime, we do it again for them
  if any of those factors are greater than the 16th prime
