---
title: Groups
number: 2
date: 2026/3/17
description: An introduction to groups, a collection of symmetries with a certain structure.
---

## What even is group theory?

:blue[Group theory], broadly speaking, is the study of *symmetries*. For example, think of all the different ways you can flip and rotate a square and still have it look the same. You can :green[rotate] it :red[90], :red[180], or :red[270] degrees clockwise, or you can :green[flip] it across the :red[vertical], :red[horizontal], or the two :red[diagonal] axes. We also include the act of doing nothing, which obviously keeps the square the same. (You'll learn why later on.)

![A 4x2 grid of squares. The top row contains the square's rotational symmetries of 0, 90, 180, and 270 degree clockwise rotations, and the bottom row consists of flips over the vertical, horizontal, northeast to southwest, and northwest to southeast axes.](./whiteboard/square_symmetries.png)

## Why would I learn this stuff?

Although studying symmetries might sound like a very niche topic, :blue[group theory] appears in so many other parts of math like linear algebra and calculus. It's even been used to prove and build things in other non-mathematics fields too! For example:

- In chemistry, groups are used to study [molecular symmetry](https://en.wikipedia.org/wiki/Molecular_symmetry), a fundamental concept for classifying and categorizing certain molecular behaviors.
- In physics, [Emmy Noether](https://en.wikipedia.org/wiki/Emmy_Noether) used group theory to prove that [every conservation law corresponds to a certain symmetry](https://en.wikipedia.org/wiki/Noether%27s_theorem).
- In cryptography, groups are used to implement some of the newest forms of public-key encryption known as [ellpitic-curve cryptography](https://en.wikipedia.org/wiki/Elliptic-curve_cryptography). If you've ever used an `ed25519` key, that's [EdDSA](https://en.wikipedia.org/wiki/EdDSA#Ed25519), and it's a type of elliptic-curve cryptography!

