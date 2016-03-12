# RULES
- WINCON - You must be able to construct a segment equivilent without having more than one choice


pattern
  - INT - Segment length
  - INT - Repetition length
  - BOO - starts with 1
  - GETTER <Boo> - starts with 0
    - `return (!repetition.length%2) ? BOO : BOO ? 0 : 1`
  - `Map<Pattern, Int>` - size differences between it and other 'previouses'

# Given
- the sum of all (pattern.segment * pattern.repetition)
- the sort of the pattern segment lengths - repeat lengths are not told to you
- the sort of the pattern repetition lengths - repeat lengths are not told to you
- the sort of the change in segment lengths - repeat changes are not told to you
- the sort of the change in repetition lengths - repeat changes are not told to you
- The total number of unique pattern segment lengths
- The total number of unique repetitions
- The total number of patterns
- The total number of repetitions


What we don't know is how far apart each segment is
-given three unique segments
  - we know the order
  - we know they have the same repetitions
  - we know the totals for each 1 and 0
  - we do not know how much will be in the first or last, only that one will have more
  - Even with size differences, only when they are equal will we be able to do something
