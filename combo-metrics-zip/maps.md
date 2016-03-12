# What is a slope map?

A slope map is a series of bits that represent if the slope is increasing or decreasing. The slope map does not evaluate nor equality only changes.

Example
- 0110001111 would be 111
- 00010001 would be 010
- 00110011 would not have a map

# What does the slope map let us know

- given map 0000
  - we now know
    - The first segment will be the greatest
    - The second will be the second greatest
    - The third will be the third gretest
    - The fourth will be the fourth gretest
    - The last will be the least
- given map 1001
  - we know
    - The first will be one of the top two
    - The second will be either second or third
    - The 3rd will be last
    - The forth will be first, second or third
- given map 0101
  - we know
    - the first will be second, third or fourth
    - The second will be first or second
    - The third will be second third or fourth
    - The fourth is first second or third

# What this doesn't tell us in absolute

- The value of a given raise or lower
  - 0000 - could mean 00000 0000 000 00 0 or 00000000000 0000000 000 00 0
- The positions when values
  - 0101 - could mean 000 0 0000 00 00000 or 00000 00 000 0 0000


# What could tell us absolute positioning?

- if we have multiple maps
  - tells us the the changes in patterns (derivative)
    - gives
      - 00000 1111 000 11 0 = 0000
      - 00000 0 1111 00 111 = 0101
      - 00000 0000 111111 0 111 00 = 01010
    - tells us
      - changes of the ups
        - 00000 0 1111 00 111 = 00 (5 > 4 > 3)
        - 00000 0000 111111 0 111 00 = 10
      - changes of the downs
        - 00000 0 1111 00 111 = 1 (1 < 2)
        - 00000 0000 111111 0 111 00 = 01
  - Hypothetically, I can make these maps until a final sort is found
  - tells us the sort of 1s
  - tells us the sort of 0s (this split might be unnecessary)
  - tells us the
