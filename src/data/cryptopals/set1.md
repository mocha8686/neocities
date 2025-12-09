---
title: Basics
number: 1
description: The qualifying set—do you have what it takes?
---

This set is mainly about getting basic functionality working, like manipulating byte arrays and parsing hex/base64.

These challenges will involve a lot of bit manipulation, so the first thing I did was to define a newtype, `Data`, to hold bytes.

```rust
// src/data.rs
#[derive(Debug, Clone)]
pub struct Data(pub(crate) Box<[u8]>);

impl<T: Into<Box<[u8]>>> From<T> for Data {
    fn from(value: T) -> Self {
        Self(value.into())
    }
}

impl AsRef<[u8]> for Data {
    fn as_ref(&self) -> &[u8] {
        &self.0
    }
}

impl<T: AsRef<[u8]>> PartialEq<T> for Data {
    fn eq(&self, other: &T) -> bool {
        &*self.0 == other.as_ref()
    }
}

impl PartialEq<Data> for &str {
    fn eq(&self, other: &Data) -> bool {
        &*other.0 == self.as_bytes()
    }
}

impl Display for Data {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        write!(f, "{}", String::from_utf8_lossy(self))
    }
}

impl Deref for Data {
    type Target = Box<[u8]>;

    fn deref(&self) -> &Self::Target {
        &self.0
    }
}
```

The most important parts here are the `Deref` and `From<T>` impls, which allow `Data` to be constructed from anything that can turn into an array of bytes, and can allow `Data` to be used and passed around functions as a `&[u8]`, meaning we can call `.len()` or `.iter()` on it.

I'll be omitting the module declarations, but you can take a look at the full source code in [the repository](https://github.com/mocha8686/cryptopals).

Now, we can move on to the real challenges.

## Convert hex to base64

> The string:
>
> `49276d206b696c6c696e6720796f757220627261696e206c696b65206120706f69736f6e6f7573206d757368726f6f6d`
>
> Should produce:
>
> `SSdtIGtpbGxpbmcgeW91ciBicmFpbiBsaWtlIGEgcG9pc29ub3VzIG11c2hyb29t`
>
> So go ahead and make that happen. You'll need to use this code for the rest of the exercises.

I started with decoding and encoding hex, using a `from_hex()` and a `hex` method on `Data`.

For decoding hex, we can use the `hex` crate and its `hex::decode()` method, which takes input buffer and returns the decoded bytes. Note that the output buffer will be at least half the size of the input buffer, since each byte is represented by two characters in hex (e.g. `169` = `0b11001001` = `0xa9`).

Similarly, for encoding hex, we can just use `hex::encode()`, which takes an input `AsRef<[u8]>`, and because we implemented `AsRef<[u8]>` for `Data`, we can just pass in our `Data` object.

Also note, I wrote my own `Error` and single-generic `Result` types, but those details will be omitted since they're out of scope for this writeup. Again, you can see [the error-handling details](https://github.com/mocha8686/cryptopals/blob/main/src/error.rs) in [the repository](https://github.com/mocha8686/cryptopals).

```rust
// src/data/hex.rs
impl Data {
    pub fn from_hex(input: impl AsRef<[u8]>) -> Result<Self> {
        let bytes = hex::decode(input).map_err(ParseError::from)?;
        let res = Self(bytes.into_boxed_slice());
        Ok(res)
    }

    pub fn hex(&self) -> String {
        hex::encode(self)
    }
}
```

As for base64, the process is a tiny bit more complex. We'll again be using a crate, this time `base64`, but we have to specify which `base64::Engine` we want to decode/encode with. In our case, we just want the standard settings, so we can specify the `base64::engine::general_purpose::STANDARD` engine.

Then, we simply have to call the `encode()` and `decode()` methods on our engine.

```rust
// src/data/base64.rs
use base64::{
    Engine,
    engine::{GeneralPurpose, general_purpose::STANDARD},
};

// ...other imports...

const ENGINE: GeneralPurpose = STANDARD;

impl Data {
    pub fn from_base64(input: impl AsRef<[u8]>) -> Result<Self> {
        let bytes = ENGINE.decode(input).map_err(ParseError::from)?;
        let res = Self(bytes.into_boxed_slice());
        Ok(res)
    }

    pub fn base64(&self) -> String {
        ENGINE.encode(self)
    }
}
```

Now, we can finally complete the first challenge. I decided to make each challenge its own test, so here's the first challenge:

```rust
// src/lib.rs
#[test]
fn s1c1_convert_hex_to_base64() -> Result<()> {
    let res = Data::from_hex("49276d206b696c6c696e6720796f757220627261696e206c696b65206120706f69736f6e6f7573206d757368726f6f6d")?
        .base64();

    assert_eq!(
        "SSdtIGtpbGxpbmcgeW91ciBicmFpbiBsaWtlIGEgcG9pc29ub3VzIG11c2hyb29t",
        res
    );

    Ok(())
}
```

## Fixed XOR

> Write a function that takes two equal-length buffers and produces their XOR combination.
>
> If your function works properly, then when you feed it the string:
>
> `1c0111001f010100061a024b53535009181c`
>
> ... after hex decoding, and when XOR'd against:
>
> `686974207468652062756c6c277320657965`
>
> ... should produce:
>
> `746865206b696420646f6e277420706c6179`

The process for fixed XOR is fairly simple. We first check that both buffers are of equal length, then we iterate over both buffers, performing an XOR on each pair of bytes. We finally collect the bytes into a `Box<[u8]>`, then construct and return a new piece of `Data`.

```rust
// src/data/xor.rs
impl Data {
    pub fn xor(&self, other: &Self) -> Self {
        if self.len() != other.len {
            todo!("XOR not implemented for `Data` of unequal lengths");
        }

        let len = self.len();
        let bytes = self
            .iter()
            .zip(other.iter())
            .map(|(a, b)| a ^ b)
            .collect();
        Self(bytes)
    }
}
```

We will come back to this code later to implement XOR for `Data` of differing lengths.

I also created `BitXor` impls for `Data`, which allows you to use the `^` operator to XOR data. Though, the implementation is a bit annoying, since you have to implement `BitXor` for each permutation of reference pairs (i.e. `Data ^ Data, Data ^ &Data, &Data ^ Data, &Data ^ &Data`).

```rust
// src/data/xor.rs
impl BitXor for &Data { // &Data ^ &Data
    type Output = Data;

    fn bitxor(self, rhs: Self) -> Self::Output {
        self.xor(rhs)
    }
}

impl BitXor for Data { // Data ^ Data
    type Output = Data;

    fn bitxor(self, rhs: Self) -> Self::Output {
        self.xor(&rhs)
    }
}

impl BitXor<Data> for &Data { // &Data ^ Data
    type Output = Data;

    fn bitxor(self, rhs: Data) -> Self::Output {
        self.xor(&rhs)
    }
}

impl BitXor<&Data> for Data { // Data ^ &Data
    type Output = Data;

    fn bitxor(self, rhs: &Data) -> Self::Output {
        self.xor(rhs)
    }
}
```

Again, here's the test for challenge 2.

```rust
// src/data/xor.rs
#[test]
fn s1c2_fixed_xor() -> Result<()> {
    let lhs = Data::from_hex("1c0111001f010100061a024b53535009181c")?;
    let rhs = Data::from_hex("686974207468652062756c6c277320657965")?;

    let res = lhs ^ rhs;
    assert_eq!("746865206b696420646f6e277420706c6179", res.hex());

    Ok(())
}
```

## Single-byte XOR cipher

> The hex encoded string:
>
> `1b37373331363f78151b7f2b783431333d78397828372d363c78373e783a393b3736`
>
> ... has been XOR'd against a single character. Find the key, decrypt the message.
>
> You can do this by hand. But don't: write code to do it for you.
>
> How? Devise some method for "scoring" a piece of English plaintext. Character frequency is a good metric. Evaluate each output and choose the one with the best score.

In preparation for this challenge and future challenges, I decided to first implement repeating-key XOR, which is essentially an XOR, but with wrapping back around to the first character once the end of the shorter string is reached.

To do this, we first get the length of the longer string, which we'll call `len`. We can use the `Iterator::cycle()` method to make an iterator infintely cycle, so we can cycle both iterators and zip them up together to create an infinite iterator.

Then, we simply call `Iterator::take()` to take the first `n` bytes, or in our case, the first `len` bytes, operate our XOR on those bytes, and collect them all up into a `Data`.

```
lhs = abcd
rhs = vxt

len = max(lhs.len(), rhs.len()) == 4

                        01234567890123456789...
          lhs.cycle() │ abcdabcdabcdabcdabcd...
          rhs.cycle() │ vxtvxtvxtvxtvxtvxtvx...
                      │
                      │ 0123
lhs.cycle().take(len) │ abcd
rhs.cycle().take(len) │ vxtv
```

And here's the implementation:

```rust
// src/data/xor.rs
impl Data {
    pub fn xor(&self, other: &Self) -> Self {
        let len = self.len().max(other.len());
        let bytes = self
            .iter()
            .cycle()
            .zip(other.iter().cycle())
            .take(len)
            .map(|(a, b)| a ^ b)
            .collect();
        Self(bytes)
    }
}
```

I also implemented `BitXor<u8>` for `Data` and `&Data` to be able to easily XOR a piece of `Data` against a single byte, which we'll be doing lots of later.

```rust
// src/data/xor.rs
impl BitXor<u8> for &Data {
    type Output = Data;

    fn bitxor(self, rhs: u8) -> Self::Output {
        let bytes = self.iter().map(|b| b ^ rhs).collect();
        Data(bytes)
    }
}

impl BitXor<u8> for Data {
    type Output = Data;

    fn bitxor(self, rhs: u8) -> Self::Output {
        (&self).bitxor(rhs)
    }
}
```

Now, to "score" a piece of plaintext. Like the problem text suggests, we'll use [English character frequency](https://en.wikipedia.org/wiki/Letter_frequency) (i.e. [ETAOIN SHRDLU](https://en.wikipedia.org/wiki/Etaoin_shrdlu)) to cryptanalyze a best-choice for the key.

The code is fairly simple; we simply loop over each byte, look it up in a frequency dictionary, then sum the scores. If we don't find a byte in the letter dictionary, we apply a small penalty. Another neat little trick is giving spaces a very high score, since they are by far the most common "character" in English texts.

In Rust, we can use the `phf` crate to generate a static frequency map at compile time. `phf` actually stands for "perfect hash function," which is a hashing function specialized for a certain set of data to never generate collisions. You can read more about them [in the crate docs](https://docs.rs/phf/latest/phf/) and [on Wikipedia](https://en.wikipedia.org/wiki/Perfect_hash_function).

The numbers simply come from [the Wikipedia page on Character frequency](https://en.wikipedia.org/wiki/Letter_frequency), after normalizing the percents to integers by multiplying by `10_000`.

```rust
// src/attack/score.rs
use phf::phf_map;

static FREQUENCIES: phf::Map<u8, i32> = phf_map! {
    b' ' => 20000,
    b'e' => 12700,
    b't' =>  9100,
    b'a' =>  8200,
    b'o' =>  7500,
    b'i' =>  7000,
    b'n' =>  6700,
    b's' =>  6300,
    b'h' =>  6100,
    b'r' =>  6000,
    b'd' =>  4300,
    b'l' =>  4000,
    b'c' =>  2800,
    b'u' =>  2800,
    b'm' =>  2400,
    b'w' =>  2400,
    b'f' =>  2200,
    b'g' =>  2000,
    b'y' =>  2000,
    b'p' =>  1900,
    b'b' =>  1500,
    b'v' =>   980,
    b'k' =>   770,
    b'j' =>   160,
    b'x' =>   150,
    b'q' =>   120,
    b'z' =>    74,
};
```

Now, we just have to write a function that loops over the input `bytes` and tells us its score. We also want to make sure that our lookup is case-insensitive.

```rust
// src/attack/score.rs
pub fn score(bytes: &[u8]) -> i32 {
    bytes
        .iter()
        .map(u8::to_ascii_lowercase)
        .map(|b| FREQUENCIES.get(&b).unwrap_or(&-1000))
        .sum()
}
```

Note that if `score()` doesn't find the byte in our dictionary, it returns a default of `-1000` to penalize bad plaintexts; yet it's not so much that other less common but still prevalent characters such as punctuation get the correct plaintext marked as bad.

Now, we can start guessing our single-byte key. We loop over each `(0u8..=255)` as our target byte, perform an XOR on it with our data, and get the resulting score. Whichever data yields the highest plaintext score is the one we return, along with its associated key byte.

```rust
// src/attack/xor.rs
pub fn single_byte_xor(data: &Data) -> (u8, Data) {
    let Some(res) = (u8::MIN..=u8::MAX)
        .map(|b| (b, data ^ b))
        .max_by_key(|(_, data)| score(data))
    else {
        unreachable!()
    };

    res
}
```

Finally, it's time to test our function. We'll load our encrypted text into a `Data`, then we'll run `singleCharacterXOR` on it.

```rust
// src/attack/xor.zig
#[test]
fn s1c3_single_byte_xor_cipher() -> Result<()> {
    let data =
        Data::from_hex("1b37373331363f78151b7f2b783431333d78397828372d363c78373e783a393b3736")?;
    let (key, res) = single_byte_xor(&data);

    assert_eq!('<KEY>', key.into());
    assert_eq!("<PLAINTEXT>", res.to_string());

    Ok(())
}
```

<details>
<summary>Answers</summary>

- `<KEY>` – `'X'`
- `<PLAINTEXT>` – `"Cooking MC's like a pound of bacon"`
</details>

## Detect single-character XOR

> One of the 60-character strings in [this file](https://cryptopals.com/static/challenge-data/4.txt) has been encrypted by single-character XOR.
>
> Find it.
>
> (Your code from #3 should help.)

This one's more of a "pure" coding challenge than the others, in the sense that the goal is to solve a problem by building an algorithm out of the tools that you've already made. Thus, we'll be doing all of our work on this challenge inside of a test.

This challenge is pretty simple. We have to iterate over the lines of a text file, parse them as hex strings, and perform single-character XOR on them to decrypt them as best we can. Then, we have to find the one line that's actually encrypted via single-character XOR, and output that.

We can use the builtin macro `include_str!()` to load the contents of the file into memory as a string, then we can split the string into lines with `String::split_ascii_whitespace()`.

This algorithm is going to be pretty similar to `singleCharacterXOR`; we iterate over each line, convert it into a `Data` struct, try to decrypt it, then find the one with the max score, just like we did inside our brute forcer.

Here's the code:

```rust
// src/attack/xor.rs
fn s1c4_detect_single_character_xor() -> Result<()> {
    let text = include_str!("../../data/4.txt");
    let (key, data) = text
        .split_ascii_whitespace()
        .map(Data::from_hex)
        .collect::<crate::Result<Vec<_>>>()?
        .into_iter()
        .map(|data| single_byte_xor(&data))
        .max_by_key(|(_, data)| score(data))
        .unwrap();

    assert_eq!('<KEY>', key.into());
    assert_eq!("<PLAINTEXT>", data);

    Ok(())
}
```

<details>
<summary>Answers</summary>

- `<KEY>` – `'5'`
- `<PLAINTEXT>` – `"Now that the party is jumping\n"`
</details>

## Implement repeating-key XOR

> Here is the opening stanza of an important work of the English language:
>
> `Burning 'em, if you ain't quick and nimble`<br>
> `I go crazy when I hear a cymbal`
>
> Encrypt it, under the key "ICE", using repeating-key XOR.
>
> In repeating-key XOR, you'll sequentially apply each byte of the key; the first byte of plaintext will be XOR'd against I, the next C, the next E, then I again for the 4th byte, and so on.
>
> It should come out to:
>
> `0b3637272a2b2e63622c2e69692a23693a2a3c6324202d623d63343c2a26226324272765272a282b2f20430a652e2c652a3124333a653e2b2027630c692b20283165286326302e27282f`
>
> Encrypt a bunch of stuff using your repeating-key XOR function. Encrypt your mail. Encrypt your password file. Your .sig file. Get a feel for it. I promise, we aren't wasting your time with this.

Luckily (definitely not planned), we've already implemented repeating-key XOR, so all we have to do is write the test.

```rust
// src/data/xor.rs
fn s1c5_implement_repeating_key_xor() {
    let data = Data::from(
        "Burning 'em, if you ain't quick and nimble\nI go crazy when I hear a cymbal"
            .as_bytes(),
    );
    let key = Data::from("ICE".as_bytes());

    let res = data ^ key;
    assert_eq!(
        "0b3637272a2b2e63622c2e69692a23693a2a3c6324202d623d63343c2a26226324272765272a282b2f20430a652e2c652a3124333a653e2b2027630c692b20283165286326302e27282f",
        res.hex()
    );
}
```

## Break repeating-key XOR

> There's a file here. It's been base64'd after being encrypted with repeating-key XOR.
>
> Decrypt it.
>
> Here's how:
>
> 1. Let KEYSIZE be the guessed length of the key; try values from 2 to (say) 40.
> 2. Write a function to compute the edit distance/Hamming distance between two strings. The Hamming distance is just the number of differing bits. The distance between `this is a test` and `wokka wokka!!!` is 37. Make sure your code agrees before you proceed.
> 3. For each KEYSIZE, take the first KEYSIZE worth of bytes, and the second KEYSIZE worth of bytes, and find the edit distance between them. Normalize this result by dividing by KEYSIZE.
> 4. The KEYSIZE with the smallest normalized edit distance is probably the key. You could proceed perhaps with the smallest 2-3 KEYSIZE values. Or take 4 KEYSIZE blocks instead of 2 and average the distances.
> 5. Now that you probably know the KEYSIZE: break the ciphertext into blocks of KEYSIZE length.
> 6. Now transpose the blocks: make a block that is the first byte of every block, and a block that is the second byte of every block, and so on.
> 7. Solve each block as if it was single-character XOR. You already have code to do this.
> 8. For each block, the single-byte XOR key that produces the best looking histogram is the repeating-key XOR key byte for that block. Put them together and you have the key.
>
> This code is going to turn out to be surprisingly useful later on. Breaking repeating-key XOR ("Vigenere") statistically is obviously an academic exercise, a "Crypto 101" thing. But more people "know how" to break it than can actually break it, and a similar technique breaks something much more important.

This challenge is massive. At a high level, we want to guess the keysize, then partition the data to do our single-character brute forcing, before unpartitioning it to get our plaintext.

Let's begin.

### Hamming distance

To guess the keysize, we're going to look for patterns in the data. If we assume our encrypted text comes from a repeating-key XOR of length `n`, we can intuit that there might be patterns between chunks of length `n`, and in fact, there are. If we take the Hamming distance between two blocks that match the key length, it will tend to be smaller.

The phrase "number of differing bits" may seem familiar. In fact, this is one way to intuit the XOR function, the number of differing bits.

```
       !!  !!!
    a 01001011
    b 00101100
a ^ b 01100111
```

We can count the number of `1`'s in the binary representation of the resulting XOR between two bytes to get the Hamming distance between two bytes. Rust has a function `u8::count_ones()` that does exactly this. For example,

```rust
0b01101000.count_ones() == 3
```

We can repeat this procedure for an entire block, summing all of the counts, to get our Hamming distance.

```rust
// src/data/hamming_distance.rs
impl Data {
    pub fn hamming_distance(&self, other: &Self) -> Option<u32> {
        if self.len() == other.len() {
            let res = (self ^ other).iter().map(|b| b.count_ones()).sum();
            Some(res)
        } else {
            None
        }
    }
}
```

This function assumes that both of the inputs are of equal lengths; otherwise, the calculation would make no sense.

I also wrote a test, taken from the problem statement.

```rust
// src/data/hamming_distance.rs
#[test]
fn hamming_distance_works() {
    let lhs = Data::from(b"this is a test".as_slice());
    let rhs = Data::from(b"wokka wokka!!!".as_slice());
    let res = lhs.hamming_distance(&rhs);
    assert_eq!(Some(37), res);
}
```

### Guessing the keysize

#### Explanation

In order to guess the keysize, we have to first note that XOR is an associative, commutative involution. What that means is:

- Associativity — `(a ^ b) ^ c == a ^ (b ^ c)`
- Commutativity — `a ^ b == b ^ a`
- Involution — `a ^ b ^ b == a`

Associativity and commutativity mean we can order a long chain of XOR's however we want, and we don't need to worry about parentheses. An involution is simply a function where applying it onto an input twice will yield the input back.

Now, the problem statement suggests we divide the ciphertext into chunks to find our keysize. Let's investigate how this works first.

Say we have a ciphertext encrypted under the key `meow`. We know that for the `i`th byte of the ciphertext, it's equal to `plaintext[i] ^ key[i % 4]`.

If we take the first two 4-byte blocks and XOR them together, we'll see something interesting happen:

```
 plaintext: ..........................
       key: meowmeowmeowmeowmeowmeowme
ciphertext: qwertyuiopasdfghjklzxcvbnm

ciphertext[0..4] == plaintext[0..4] ^ "meow"
ciphertext[4..8] == plaintext[4..8] ^ "meow"

ciphertext[0..4] ^ ciphertext[4..8]
== plaintext[0..4] ^ "meow" ^ plaintext[4..8] ^ "meow"
== plaintext[0..4] ^ plaintext[4..8] ^ "meow" ^ "meow"  (commutation and association)
== plaintext[0..4] ^ plaintext[4..8]                    (involution)


```

Notice how the key cancels out. If we were to try this using a blocksize one too big or one too small, this canceling wouldn't happen.

```
blocksize == 3
ciphertext[0..3] = plaintext[0..3] ^ "meo"
ciphertext[4..6] = plaintext[4..6] ^ "wme"

ciphertext[0..3] ^ ciphertext[4..6]
== plaintext[0..3] ^ "meo" ^ plaintext[3..6] ^ "wme"
== plaintext[0..3] ^ plaintext[3..6] ^ "meo" ^ "wme"

───────────────────────────────────────────────────────

blocksize == 5
ciphertext[0..5] = plaintext[0..5] ^ "meowm"
ciphertext[5..10] = plaintext[5..10] ^ "eowme"

ciphertext[0..5] ^ ciphertext[5..10]
== plaintext[0..5] ^ "meowm" ^ plaintext[5..10] ^ "eowme"
== plaintext[0..5] ^ plaintext[5..10] ^ "meowm" ^ "eowme"
```

If we were to count the ones for each of these ciphertext XOR's (i.e. the second step of Hamming distance), we'd find that the Hamming distance would be minimized when the `blocksize` equals the `keysize`. This is because when the keys cancel each other out, their contribution to the total number of ones becomes `0`; whereas with the `blocksize == 3` and `blocksize == 5` cases, the keys still contribute ones to the total since they didn't cancel out.

Thus, we can use the Hamming distance to guess the length of the key.

#### Implementation

We'll again use a score-maximizing function similar to `single_byte_xor`, but instead of maximizing plaintext score, we'll be trying to minimize Hamming distance.

First, like the prompt suggests, we'll try `keysize`s from 2 to 40. We can modify this later, but more values means more computation time. We want to minimize a certain function this time, so we'll use a `min_by_key()`.

```rust
const MAX_KEYSIZE: u32 = 40;
let Some(res) = (2u32..=MAX_KEYSIZE).min_by_key(|keysize| {
    // ...
}) else {
    unreachable!()
};
```

Now, we want to divide our input into equal-sized blocks, one size for each `keysize` we're trying to guess. We'll loop over `(2..=40)`, taking each integer as our `keysize`. We can divide our data into blocks using `&[u8]::chunks_exact()`, which will create an iterator over each of our blocks.

```rust
data.chunks_exact(*keysize as usize);
```

Now, we'll use `Iterator::fold()` to combine all our blocks into a `score` (and a `count` to track the number of blocks; we'll see why later). We'll store the `previous` block per iteration to compare to our current block, and use the two to add to a running score. Here's a little snippet from the code:

```rust
let (score, count, _) = data.chunks_exact(*keysize as usize)
    //     ┌──────── initial score
    //     │  ┌───── initial count
    //     │  │  ┌── initial data        ┌─ current chunk
    //     ▼  ▼  ▼                       ▼
    .fold((0, 0, None), |(acc, n, prev), chunk| {
        //                    ┌── default, if `prev` is None
        //                    ▼
        let res = prev.map_or(0, |prev: &[u8]| {
            let prev = Data::from(prev);
            let chunk = Data::from(chunk);
            prev.hamming_distance(&chunk)
                .expect("chunks should be equally sized")
        });
    //       ┌───────────────── add this block's distance to running score
    //       │        ┌──────── increment number of blocks
    //       │        │     ┌── use this chunk for the next iterations's `prev`
    //       ▼        ▼     ▼
        (acc + res, n + 1, Some(chunk))
    });
```

At the end, we'll multiply `score` by `100`, since we're going to divide it by `count` and `keysize` to average it out over the number of blocks. Essentially, we're calculating the average Hamming distance per byte (since each of our `count` blocks has `keysize` bytes).

```rust
let Some(res) = (2u32..=MAX_KEYSIZE).min_by_key(|keysize| {
    let (score, count, _) = // ...
    score * 100 / count / *keysize
}) else {
    unreachable!()
};
```

Here's the full code for the process:

```rust
// src/attack/xor.rs
fn guess_keysize(data: &Data) -> u32 {
    const MAX_KEYSIZE: u32 = 40;
    let Some(res) = (2u32..=MAX_KEYSIZE).min_by_key(|keysize| {
        let (score, count, _) =
            data.chunks_exact(*keysize as usize)
                .fold((0, 0, None), |(acc, n, prev), chunk| {
                    let res = prev.map_or(0, |prev: &[u8]| {
                        let prev = Data::from(prev);
                        let chunk = Data::from(chunk);
                        prev.hamming_distance(&chunk)
                            .expect("chunks should be equally sized")
                    });
                    (acc + res, n + 1, Some(chunk))
                });
        score * 100 / count / *keysize
    }) else {
        unreachable!()
    };

    res
}
```

### Partitioning

Now that we have a good guess for our `keysize`, we want to prepare the data for performing single-byte XOR. If we assume the key is `keysize` long, we know that every `keysize`th byte has been XOR'd with the same byte.

```
            ┌ keysize = 4
            ├───┬───┬───┬───┬───┬───┬───┐
     i % 4: 01230123012301230123012301
       key: meowmeowmeowmeowmeowmeowme
ciphertext: qwertyuiopasdfghjklzxcvbnm
            │   │   │   │   │   │   │
       key: m   m   m   m   m   m   m ─► mmmmmmm
ciphertext: q   t   o   d   j   x   n ─► qtodjxn
     i    : 0   4   8  12  16  20  24
     i % 4: 0   0   0   0   0   0   0
```

Now, we just need to decrypt this block of ciphertext, and we know that the key is a single byte. Fortunately, we've already made a function to do just this, so we can take those bytes and perform our `single_byte_xor()` on them.

We can similarly group every `(keysize + 1)`th byte, every `(keysize + 2)`th byte, and so on, until we've made `keysize` groups. We're essentially creating a partition over our ciphertext using the integers mod `keysize` as indices to group our blocks.

Now, to implement this algorithm in Rust. We first start by getting the indices of each input byte. Then, we can use the `itertools` crate to create a grouping map by a certain key, which will be our indices mod `keysize`.

```rust
data.iter()
    .copied()
    .zip(0u32..)
    .into_group_map_by(|(_, i)| i % keysize) // ignore the bytes for now
```

Now, we iterate over the entries of this map. The iterator will yield pairs `(n, vec)`, where `n` is our groups and `vec` is a subset of our original bytes. We first sort the groups by `n` to make sure they're ordered correctly from `0..keysize`, then we simply create a `Data` struct out of each group and return a vector of them.

```rust
prev.into_group_map_by(|(_, i)| i % keysize)
    .into_iter()
    .sorted_by_key(|(n, _)| *n) // ignore `vec` for now

    // each entry is actually (b, i), where `i` is our original index
    // so, we clean that up
    .map(|(_, vec)| vec.into_iter().map(|(b, _)| b).collect_vec()) // discard `n` and `i`

    .map(Data::from)
    .collect_vec()
```

Here's the `partition` function in full.

```rust
// src/attack/xor.rs
fn partition(data: &Data, keysize: u32) -> Vec<Data> {
    data.iter()
        .copied()
        .zip(0u32..)
        .into_group_map_by(|(_, i)| i % keysize)
        .into_iter()
        .sorted_by_key(|(n, _)| *n)
        .map(|(_, vec)| vec.into_iter().map(|(b, _)| b).collect_vec())
        .map(Data::from)
        .collect_vec()
}
```

### Decrypting

Now that we have our data partitioned, the decryption is simple. We simply have to call `single_byte_xor` on each of our blocks. We'll also keep track of the key bytes returned to construct the full key.

```rust
let (key_bytes, partitions): (Vec<u8>, Vec<Data>) = partitions
    .into_iter()
    .map(|data| single_byte_xor(&data))
    .collect();
```

### Unpartitioning

Finally, we want to reverse our partitioning to reconstruct the original plaintext. We'll reconstruct our original indices using a bit of math.

First, we recover the original `keysize` by getting the number of partitions. Then, for each of our partitions, we'll get their index `i`, which will be our offset, and then for each byte in our data, we'll get its index within the data `n`. Finally, we can reconstruct its original position using `n * keysize + i`.

We can then sort each of the bytes by the original index to reconstruct our data.

```rust
// src/attack/xor.rs
fn unpartition(partitions: Vec<Data>) -> Data {
    let keysize = partitions.len(); // get the keysize
    let bytes = partitions
        .into_iter()
        .enumerate() // get partition index `i`
        .flat_map(|(i, data)| {
            data.iter()
                .copied()
                .enumerate() // get byte index `n`
                .map(|(n, b)| (n * keysize + i, b)) // calculate original index
                .collect_vec()
        })
        .sorted_by_key(|(i, _)| *i) // sort by original index
        .map(|(_, b)| b) // discard index
        .collect_vec();
    Data::from(bytes)
}
```

### The full picture

Now that we have all the components of our `repeating_key_xor()` function, we can finally construct it in full. Here it is:

```rust
// src/attack/xor.zig
pub fn repeating_key_xor(data: &Data) -> (Data, Data) {
    let keysize = guess_keysize(data);
    let partitions = partition(data, keysize);

    let (key_bytes, partitions): (Vec<u8>, Vec<Data>) = partitions
        .into_iter()
        .map(|data| single_byte_xor(&data))
        .collect();

    let key = Data::from(key_bytes);
    let data = unpartition(partitions);

    (key, data)
}
```

And here's the test:

```rust
// src/attack/xor.rust
#[test]
fn s1c6_break_repeating_key_xor() -> Result<()> {
    let text = include_str!("../../data/6.txt").replace('\n', "");
    let data = Data::from_base64(&text)?;
    let (key, res) = repeating_key_xor(&data);

    assert_eq!("<KEY>", key.to_string());
    assert_eq!(include_str!("../../data/funky.txt"), res.to_string());

    Ok(())
}
```

<details>
<summary>Answers</summary>

- `<KEY>` – `Terminator X: Bring the noise`
- [`funky.txt`](/funky.txt)
</details>

## AES in ECB mode

> The Base64-encoded content in [this file](https://cryptopals.com/static/challenge-data/7.txt) has been encrypted via AES-128 in ECB mode under the key
> 
> "YELLOW SUBMARINE".
> (case-sensitive, without the quotes; exactly 16 characters; I like "YELLOW SUBMARINE" because it's exactly 16 bytes long, and now you do too).
> 
> Decrypt it. You know the key, after all.
> 
> Easiest way: use OpenSSL::Cipher and give it AES-128-ECB as the cipher.

[AES](https://en.wikipedia.org/wiki/Advanced_Encryption_Standard), or Advanced Encryption Standard, is a symmetric-key block cipher, which essentially means one key is used to both encrypt and decrypt a fixed-size block of data. In our case, AES-128 will encrypt a 128-bit (or 16-byte) block.

[ECB mode](https://en.wikipedia.org/wiki/Block_cipher_mode_of_operation#ECB), or electronic codebook, is a method of encrypting an arbitrary-length block of data (although, probably the most insecure—you'll see why in the next set). It simply splits our data into 16-byte blocks, encodes them using AES-128, then concatenates them together.

The AES algorithm itself is quite complicated, involving abstract algebra and Galois fields, so like the problem statement suggests, we're just going to use a library. (Though, I do plan on studying abstract algebra in the near future, so keep an eye out for that!)

In our case, we'll use the `aes` crate, which provides the `Aes128` struct. First, I decided to create a `Cipher` trait to abstract the interface, since we'll be creating more ciphers in the future.

```rust
// src/cipher.rs
pub trait Cipher {
    fn decode(&mut self, data: &Data) -> Result<Data>;
    fn encode(&mut self, data: &Data) -> Result<Data>;
}
```

Now, we'll create a wrapper around `Aes128`. We'll have to implement ECB mode ourselves, since `Aes128` only operates on 16-byte blocks.

```rust
// src/cipher/aes_ecb.rs
pub struct AesEcb {
    cipher: Aes128,
}

impl AesEcb {
    pub fn new(key: impl AsRef<[u8]>) -> Result<Self> {
        let key = key.as_ref();
        let cipher = Aes128::new_from_slice(key)?;

        Ok(Self::init(cipher))
    }

    #[must_use]
    pub fn init(cipher: Aes128) -> Self {
        Self { cipher }
    }
}
```

We'll focus on decoding, since the process for encoding is pretty much the same. We'll want to first check that our data can be split into 16-byte blocks. We'll learn how to handle an uneven length in Set 2, but for now, we'll just panic if not.

```rust
// src/cipher/aes_ecb.rs
fn decode(&mut self, data: &Data) -> Result<Data> {
    if (data.len() % 16 != 0) {
        todo!("AES-ECB not implemented for `Data` of non-16-multiple lengths");
    }

    // ...
}
```

We'll see how we can encode arbitrary-length `Data` in the next set.

First, we split our data into 16-byte chunks. Then, we collect each chunk into a fixed-size array using `Itertools::collect_array()`. We do also have to conver that array into a `GenericArray`, since that's what the `aes` crate uses—specifically, `aes` is part of the [RustCrypto ecosystem](https://github.com/RustCrypto/).

After we create our `GenericArray`s, we can `flat_map` over them, decrypting each one sequentially. Here's the code.

```rust
// src/cipher/aes_ecb.rs
fn decode(&mut self, data: &Data) -> Result<Data> {
    if (data.len() % 16 != 0) {
        todo!("AES-ECB not implemented for `Data` of non-16-multiple lengths");
    }

    let bytes = data
        .chunks(16)
        .filter_map(itertools::Itertools::collect_array::<16>)
        .map(GenericArray::from)
        .flat_map(|mut block| {
            self.cipher.decrypt_block_mut(&mut block);
            block
        })
        .collect_vec();

    Ok(Data::from(bytes))
}
```

(Note that the code in the repository has additional error handling; the premise is the same as above, though.)

Encoding uses the same algorithm, except with `encrypt_block_mut` instead of `decrypt_block_mut`.

Now for the test.

```rust
// src/cipher/aes_ecb.rs
#[test]
fn s1c7_aes_in_ecb_mode() -> Result<()> {
    let text = include_str!("../../data/7.txt").replace('\n', "");
    let data = Data::from_base64(&text)?;
    let mut cipher = AesEcb::new("YELLOW SUBMARINE")?;
    let res = cipher.decode(&data)?;

    // note: this plaintext has additional padding at the end
    // we'll learn how it works in S2C9
    assert_eq!(include_str!("../../data/funky.txt"), res.to_string());

    Ok(())
}
```

## Detect AES in ECB mode

> [In this file](https://cryptopals.com/static/challenge-data/8.txt) are a bunch of hex-encoded ciphertexts.
> 
> One of them has been encrypted with ECB.
> 
> Detect it.
> 
> Remember that the problem with ECB is that it is stateless and deterministic; the same 16 byte plaintext block will always produce the same 16 byte ciphertext.

This is another pure challenge, though I will put some of the functionality into a library function to use in later challenges.

This challenge is hinting for us to take a look at 16-byte blocks again. Basically, given a long enough plaintext, there will eventually be two blocks that have the same plaintext. Even though we may not be able to directly break AES-ECB on a single block (yet), we can look at the relationship between blocks and extract information from there.

```
blocksize = 4
           1234---4---4---4---4---4
plaintext: abcabcabcabcabcabcabcabc
           └┬─┘└┬─┘└┬─┘└┬─┘└┬─┘└┬─┘
            │   │   │   │   │   └──────────────┐
            │   │   │   │   └───────────┐      │
            │   │   │   └────────┐      │      │
            │   │   └─────┐      │      │      │
            │   └──┐      │      │      │      │
            ▼      ▼      ▼      ▼      ▼      ▼
           ┌──────┬──────┬──────┬──────┬──────┬──────┐
plaintext  │ abca │ bcab │ cabc │ abca │ bcab │ cabc │
           ├──────┼──────┼──────┼──────┼──────┼──────┤
ciphertext │ tjkh │ zbvx │ dfgk │ tjkh │ zbvx │ dfgk │ 
           └───┬──┴───┬──┴───┬──┴──┬───┴──┬───┴──┬───┘ 
               └──────┼──────┼─────┘      │      │
                      └──────┼────────────┘      │
                             └───────────────────┘
```

So, we're going to find the line in the input file with the maximum number of repeated blocks.

For each line, we'll split it into 16-byte chunks and group them up into a count map. We'll subtract one from each count, and if there's any duplicates, those counts will be nonzero. We can then simply sum up our counts to get an ECB score.

Here's the code.

```rust
// src/cipher/aes_ecb.rs
pub fn score(bytes: &[u8]) -> u32 {
    bytes
        .chunks_exact(16)
        .counts()
        .into_values()
        .map(|v| v.saturating_sub(1) as u32)
        .sum()
}
```

Now, to get an ECB score, we can simply use `aes_ecb::score()`.

We can look for the line with the largest score, and we'll know that's the one that was encryped with AES-128-ECB.

```rust
// src/cipher/aes_ecb.rs
fn s1c8_detect_aes_in_ecb_mode() -> Result<()> {
    let text = include_str!("../../data/8.txt");
    let res = text
        .split('\n')
        .map(Data::from_hex)
        .collect::<crate::Result<Vec<_>>>()?
        .into_iter()
        .max_by_key(|d| score(d))
        .unwrap();

    assert_eq!(
        "<ANSWER>",
        res.hex()
    );

    Ok(())
}
```

<details>
<summary>Answer</summary>

- `<ANSWER>` – `d880619740a8a19b7840a8a31c810a3d08649af70dc06f4fd5d2d69c744cd283e2dd052f6b641dbf9d11b0348542bb5708649af70dc06f4fd5d2d69c744cd2839475c9dfdbc1d46597949d9c7e82bf5a08649af70dc06f4fd5d2d69c744cd28397a93eab8d6aecd566489154789a6b0308649af70dc06f4fd5d2d69c744cd283d403180c98c8f6db1f2a3f9c4040deb0ab51b29933f2c123c58386b06fba186a`
- This string is on line 133 of [`8.txt`](https://cryptopals.com/static/challenge-data/8.txt).
</details>

## Summary

Overall, this set wasn't too bad. [Challenge 6 – Break repeating-key XOR](#break-repeating-key-xor) did take quite a bit of time, but since I've already gone through these first few challenges about 3 times or so, it felt a lot easier this time around.

Onto the next set!
