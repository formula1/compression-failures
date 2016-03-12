So... The way I want to build this is...

- specify length - limits the field
- specify number of 1s - limits the field
- specify number of unique patterns - technically there should be 8
  - 01, 0011, 000111, 00001111, 0000011111, 000000111111, 00000001111111, 0000000011111111
- number of patterns start with 1 and end with 1
  - if a pattern started from 1, the last ended in 0
  - if a pattern ended in 1, the next starts with 0
- specify number of total patterns found - should be equal to num of bytes, sometimes less, some more
  - Excludes repeates such as 010101 (counted as 1)

Can we infer anything?
- 1s approach max or 0, number of patterns should decrease
- The total number of starts and ends
  - The more starts and ends, the more scattered it should be
  - THe less, the more centralized they should be
- The total number of patterns
  - This gives away many symetric patterns
    - 1 start, 1 end, 1 pattern - 3 equal parts - FINISHED
    - 2 start, 2 end, 1 pattern - 5 equal parts - FINISHED
    - 2 start, 1 end, 1 pattern - 4 equal parts - Order Needed
    - 1 start, 1 end, 2 patterns - 2 equal parts, one big (or small) chunk of 1s in center
    - 2 start, 2 end, 3 patterns
      - both 1s have same amount, center has different and ends have same
      - But the portion spread between the center and ends is unknown
    - Not when the number of 1s and 0s are equal however

  - It may be possible that given a set of unique patterns and total 1s we can identify nothing
  - Given total 1s and total patterns found
    - We know that There only can be a certian subset of combonations

The problem with this form of zipping is...
- I will have to search for more properties to ensure that every combonation is found
  - symetric and even some asymetric ones I can find given 6 integers
    - And this goes to infinity
  - But this is not a one night project

Given a series of 1s and 0s. Find a way to reduce it to as few bytes as possible
- with a length, the number is finite
- with the number of 1s, the number is lessened
  - Some are found (all 1s or all 0s)
- with the number of patterns, the number is lessened
- with the number of repetitions, the number is lessened
  - some are found (single pattern, odd repetition, 1s > 0s or 0s > 1s)
  - some are found
- with the number of starts, the number is lessened
  - some are found (single pattern, even repetition)


I think the fact that there seems to be no end in sight is the bigger issue. With the primes,
the barrier right now is nth prime and in general huge numbers. This kind of defeats the
purpose since huge numbers is the goal. But even turning 24 bits in obj and consolidating
those objects may be enough. With the combo metrics, the goal is grey. Attaining it is a
maybe rather than a definitive no. Nearly completely based off 'my hardwork' to even find out if it even possible ot not.

- I reach the next goal, then find another case that is not unique
- I reach the next goal, then find another case that is not unique
- I reach the next goal, then find another case that is not unique

Its possible I could automate this... Or at the very least, automate the goals
