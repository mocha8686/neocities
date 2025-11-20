---
title: Basics
number: 1
description: The qualifying set—do you have what it takes?
---

This set is mainly about getting basic functionality working, like manipulating byte arrays and parsing hex/base64.

These challenges will involve a lot of bit manipulation, so the first thing I did was to define a newtype, `Data`, to hold bytes.

```zig
// src/Data.zig
const std = @import("std");
const Allocator = std.mem.Allocator;

const Self = @This();

allocator: Allocator,
    bytes: []u8,

    pub fn init(allocator: Allocator, bytes: []u8) Self {
        return Self{
            .allocator = allocator,
            .bytes = bytes,
        };
    }

pub fn copy(allocator: Allocator, buf: []const u8) !Self {
    const bytes = try allocator.alloc(u8, buf.len);
    errdefer allocator.free(bytes);

    @memcpy(bytes, buf);
    return Self{
        .allocator = allocator,
            .bytes = bytes,
    };
}

pub fn reinit(allocator: Allocator, bytes: []u8) void {
    self.deinit();
    self.bytes = bytes;
}

pub fn len(self: Self) usize {
    return self.bytes.len;
}

pub fn deinit(self: Self) void {
    self.allocator.free(self.bytes);
}
```

If this syntax looks unfamiliar, especially the `allocator` and `bytes` fields at the top, it's becuase Zig files are structs—that means you can import the struct directly with `const Data = @import("Data.zig")`, and it will work just fine.

The two static methods `init` and `copy` are for creating new `Data` instances. `init` assumes `bytes` was initialized using the provided `allocator`, while `copy` creates its own copy of `bytes`, so you can, for example, pass a static string into `Data.copy`.

`len` and `deinit` are convenience methods to get the length of the buffer and deallocate the buffer, repsectively. `reinit` is another convenience method that simply replaces the current `bytes` with the new buffer passed in, deallocating the old one in the process.

From now on, I'll be omitting the imports and the `const @Self = @This()` to save space.

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

I started by creating `fromHex` and `fromBase64` methods, which both take `[]const u8`'s of their respective format. These two methods are mainly for convenience, as we'll see in a bit.

For decoding hex, we can use `std.fmt.hexToBytes`, which takes an output and input buffer. The output buffer must be at least half the size of the input buffer, since each byte is represented by two characters in hex (e.g. `169` = `0b11001001` = `0xa9`).

```zig
// src/Data.zig

pub fn fromHex(allocator: Allocator, input: []const u8) !Self {
    const bytes = try allocator.alloc(u8, input.len / 2);
    errdefer allocator.free(bytes);
    _ = try std.fmt.hexToBytes(bytes, input);
    return Self{
        .allocator = allocator,
        .bytes = bytes,
    };
}
```

As for base64, the process is a bit more complex. First, we have to create a decoder struct, which involves passing in a few options such as padding. Fortunately, the standard library already has presets, and the `standard` preset is just what we need. We can get a decoder using `std.base64.standard.Decoder`. Then, we have to allocate a buffer to store the output. Thankfully, the decoder contains a method, `calcSizeForSlice`, which takes in our input base64 buffer and calculates the minimum size required to store the output. After we allocate that buffer, we can finally run `decode`, passing in our output and input buffer, before creating our struct.

```zig
// src/Data.zig
pub fn fromBase64(allocator: Allocator, input: []const u8) !Self {
    const decoder = std.base64.standard.Decoder;
    const size = try decoder.calcSizeForSlice(input);

    const bytes = try allocator.alloc(u8, size);
    errdefer allocator.free(bytes);

    try decoder.decode(bytes, input);

    return Self{
        .allocator = allocator,
        .bytes = bytes,
    };
}
```

Since hex and base64 are encodings, and to prepare for future encodings/ciphers like AES, I decided to put the encoding/decoding logic into their own files.

The decoding part simply uses the `fromHex` and `fromBase64` methods in `Data`.

```zig
// src/cipher.zig

pub const Base64 = @import("cipher/Base64.zig");
pub const Hex = @import("cipher/Hex.zig");
```

```zig
// src/cipher/Hex.zig

pub fn decode(_: Self, data: *Data) !void {
    const res = try Data.fromHex(data.allocator, data.bytes);
    data.reinit(res.bytes);
}
```

```zig
// src/cipher/Base64.zig

pub fn decode(_: Self, data: *Data) !void {
    const res = try Data.fromBase64(data.allocator, data.bytes);
    data.reinit(res.bytes);
}
```

As for the encoding, the process is fairly similar to decoding for base64. First, we get our `std.base64.standard.Encoder`, then calculate our size with `calcSize`, and finally `encode` our input.

A small difference is with `calcSize`, which, instead of an input buffer, only needs to take in the length of our data. This is because base64 has built-in padding, so the decoder needs to know if those last few characters in our base64 are padding bytes or not; whereas with our encoder, it knows that all of our input is just data.

```zig
// src/cipher/Base64.zig

pub fn encode(_: Self, data: *Data) !void {
    const allocator = data.allocator;

    const encoder = std.base64.standard.Encoder;
    const size = encoder.calcSize(data.len());

    const buf = try allocator.alloc(u8, size);
    errdefer allocator.free(buf);

    _ = encoder.encode(buf, data.bytes);

    data.reinit(buf);
}
```

For hex, the process is quite different. There is a `std.fmt.bytesToHex` function, but it only works with a `comptime`-known array. Thus, we have to use `std.fmt.bufPrint` instead, which works similarly to `sprintf` in libc.

First, we create a buffer twice the size of our input, then we use the format `"{x}"` to print out our bytes in lowercase hex format, storing it into our output buffer.

```zig
// src/cipher/Hex.zig

pub fn encode(_: Self, data: *Data) !void {
    const allocator = data.allocator;

    const buf = try allocator.alloc(u8, data.len() * 2);
    errdefer allocator.free(buf);

    _ = try std.fmt.bufPrint(buf, "{x}", .{data.bytes});

    data.reinit(buf);
}
```

Next, I created `encode` and `decode` methods on `Data` to help with using ciphers easily. It simply takes the `cipher` as an `anytype` and calls the respective `encode` and `decode` methods. If you don't know about `anytype`, it essentially just enables [duck-typing](https://en.wikipedia.org/wiki/Duck_typing) for Zig.

```zig
// src/Data.zig

pub fn decode(self: *Self, cipher: anytype) !void {
    try cipher.decode(self);
}

pub fn encode(self: *Self, cipher: anytype) !void {
    try cipher.encode(self);
}
```

Now, we can finally complete the first challenge. I decided to make each challenge its own Zig test, so here's the first challenge:

```zig
// src/root.zig

test "set 1 challenge 1" {
    const allocator = std.testing.allocator;

    var data = try Data.fromHex(
        allocator,
        "49276d206b696c6c696e6720796f757220627261696e206c696b65206120706f69736f6e6f7573206d757368726f6f6d",
    );
    defer data.deinit();

    const base64 = cipher.Base64{};
    try data.encode(base64);

    try std.testing.expectEqualStrings(
        "SSdtIGtpbGxpbmcgeW91ciBicmFpbiBsaWtlIGEgcG9pc29ub3VzIG11c2hyb29t",
        data.bytes,
    );
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

The process for fixed XOR is fairly simple. I decided to mutate `self` to save on extra allocations. A more functional approach would be to instead return a new `Data` object, but I decided against it since I'm working with Zig, which I've found to lend itself much more to mutating state than pure functions.

We first check that both buffers are of equal length, then we iterate over both buffers, performing an XOR-assign on our own bytes.

```zig
// src/Data.zig

pub fn xor(self: *Self, other: Self) !void {
    if (self.len() != other.len()) {
        return error.Unimplemented;
    }

    for (other.bytes, 0..) |byte, i| {
        self.bytes[i] ^= byte;
    }
}
```

Again, here's the test for challenge 2.

```zig
// src/root.zig

test "set 1 challenge 2" {
    const allocator = std.testing.allocator;

    var lhs = try Data.fromHex(
        allocator,
        "1c0111001f010100061a024b53535009181c",
    );
    defer lhs.deinit();

    const rhs = try Data.fromHex(
        allocator,
        "686974207468652062756c6c277320657965",
    );
    defer rhs.deinit();

    try lhs.xor(rhs);

    const hex = cipher.Hex{};
    try lhs.encode(hex);

    try std.testing.expectEqualStrings(
        "746865206b696420646f6e277420706c6179",
        lhs.bytes,
    );
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

Since we're mutating `self`, if our buffer is larger or of equal length to the other buffer, we can use the same buffer. However, if it's smaller, we will need to reallocate a larger buffer to accomodate the new data.

```zig
// src/Data.zig

pub fn xor(self: *Self, other: Self) !void {
    if (self.len() >= other.len()) {
        const size = self.len();
        for (0..size) |i| {
            const l = other.len();
            self.bytes[i] ^= other.bytes[i % l];
        }
    } else {
        const size = other.len();
        const buf = try self.allocator.alloc(u8, size);
        const l = self.len();
        for (0..size) |i| {
            buf[i] = self.bytes[i % l] ^ other.bytes[i];
        }
        self.reinit(buf);
    }
}
```

Now, to "score" a piece of plaintext. Like the problem text suggests, we'll use [English character frequency](https://en.wikipedia.org/wiki/Letter_frequency) (i.e. [ETAOIN SHRDLU](https://en.wikipedia.org/wiki/Etaoin_shrdlu)) to cryptanalyze a best-choice for the key.

The code is fairly simple; we simply loop over each byte, look it up in a frequency dictionary, then sum the scores. If we don't find a byte in the letter dictionary, we apply a small penalty. Another neat little trick is giving spaces a very high score, since they are by far the most common "character" in English texts.

In Zig, we can generate a `StaticStringMap` at `comptime`, which basically means the frequency dictionary will be baked into the program data. The process is a little convoluted, but it's not too bad.

```zig
// src/attack/score.zig

const Frequencies = StaticStringMap(i32);

const FrequencyKV = struct { []const u8, i32 };
const frequencies: []const FrequencyKV = &.{
    .{ " ", 20000 },
    .{ "e", 12700 },
    .{ "t", 9100 },
    .{ "a", 8200 },
    .{ "o", 7500 },
    .{ "i", 7000 },
    .{ "n", 6700 },
    .{ "s", 6300 },
    .{ "h", 6100 },
    .{ "r", 6000 },
    .{ "d", 4000 },
    .{ "l", 4000 },
    .{ "c", 2000 },
    .{ "u", 2000 },
    .{ "m", 2000 },
    .{ "w", 2000 },
    .{ "f", 2000 },
    .{ "g", 2000 },
    .{ "y", 2000 },
    .{ "p", 1000 },
    .{ "b", 1000 },
    .{ "v", 980 },
    .{ "k", 770 },
    .{ "j", 160 },
    .{ "x", 150 },
    .{ "q", 120 },
    .{ "z", 74 },
};
const map = Frequencies.initComptime(frequencies);
```

Now, we just have to write a function that loops over the bytes in a piece of `Data` and tells us its score. We also make sure that our lookup is case-insensitive.

```zig
pub fn score(data: Data) i32 {
    var res: i32 = 0;
    for (data.bytes) |b| {
        res += map.get(&.{std.ascii.toLower(b)}) orelse -1000;
    }
    return res;
}
```

Now, we can start guessing our single-byte key. We simply loop over each `(0..=255)` as our target byte, perform an XOR on it with our data, and get the resulting score. Whichever buffer whose byte key yields the highest score is the one we reassign to our `Data`.

We also return our key byte to report later as well.

```zig
pub fn singleCharacterXOR(data: *Data) !u8 {
    var bestGuess: Data = blk: {
        var guess = try Data.copy(data.allocator, &.{0});
        errdefer guess.deinit();
        try guess.xor(data.*);
        break :blk guess;
    };
    var bestScore: i32 = score(bestGuess);
    var bestChar: u8 = 0;

    for (1..std.math.maxInt(u8)) |n| {
        const c: u8 = @intCast(n);

        var guess = try Data.copy(data.allocator, &.{c});
        errdefer guess.deinit();

        try guess.xor(data.*);
        const guessScore = score(guess);
        if (guessScore > bestScore) {
            bestGuess.deinit();
            bestScore = guessScore;
            bestGuess = guess;
            bestChar = c;
        } else {
            guess.deinit();
        }
    }

    data.reinit(bestGuess.bytes);
    return bestChar;
}
```

Finally, it's time to test our function. We'll load our encrypted text into a `Data`, then we'll run `singleCharacterXOR` on it.

```zig
test "set 1 challenge 3" {
    const allocator = std.testing.allocator;

    var data = try Data.fromHex(
        allocator,
        "1b37373331363f78151b7f2b783431333d78397828372d363c78373e783a393b3736",
    );
    defer data.deinit();

    const byte = try singleCharacterXOR(&data);

    try std.testing.expectEqual('<KEY>', byte);
    try std.testing.expectEqualStrings("<PLAINTEXT>", data.bytes);
}
```

<details>
<summary>Answers</summary>

- `<KEY>` – `'X'`
- `<PLAINTEXT>` – `"Cooking MC's like a pound of bacon"`
</details>
