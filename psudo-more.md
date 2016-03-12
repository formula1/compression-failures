# Right now

- 1, 2, 4, 8, 16, 32, 64, 128

A series of these denotes higher and higher values
- 256, 512, 1024, 2048, 4096, 8192, 16384, 32768

And this is for 2 bytes. Aka : `1111 1111 - 1111 1111` A stupidly small amount. If I want to talk data compression, the original scientists did a fantastic job doing it.


Me doing math for arbitrarilly large numbers isn't as simple as once thought
Now, my Thought process is simple
- Take a gigantic number, then spread it out ove prime factors
- Arguably this is a great idea because I can make much bigger swipes

The operations necessary are
- addition - needs an open and close
- multiplication - needs an open and close
- exponents - second variable is expected to be exponent
- Open
- Close

Each Action will be stored in 8 bytes a peice.
- I now have 251 numbers available to me after taking out the operations
  - 249 since we need to take out 0 and 1
- This turns a 3 byte integer into `[ADD, OPEN, MUL, OPEN, 1579, 19, CLOSE, 1579, 1187, 2, CLOSE]`
- 3 -> 11 bytes is hardly romantic compression
- Lets try out something more realistic... like... 1000 bytes 2^(8 * 1000)
- This caused my algorithm to slow down significantly
- Lets try 64 bytes? - keep in mind this is 2 ^ (8 * 64)
- A little bit bigger than our last
- Ok, so this took us from 64 bytes to 296...
  - Not 296 bits, 296 bytes
  - We are definitely not compressing
  - And that is after I ripped out OPEN and CLOSE tags for ADD / MUL for 2 parameters
- WAIT! made a mistake... 573
  - yes! 64 bytes can now be 573 bytes!




You ever think your trying to put something in a box?
I think I'm trying to stuff primes into the Compression concept
And they really deserve to be in their own
I say that because each prime is like its own living being with its own motion
To find a next prime, you must find what hasn't been and what won't be.
Pattern detection generally
