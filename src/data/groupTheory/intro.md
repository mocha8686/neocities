---
title: Introduction
number: 1
date: 2026/3/16
description: A short intro to theorems and proofs in higher-level mathematics.
---

If you're already familiar with proofs and theorems, feel free to skip this unit and [move on to the next one](../groups/). (Note: Still WIP!)

## What in the world is a theorem?

If you've ever been taught any math in elementary, middle, or high school, the idea you probably have about math is that it's a lot of numbers and formulas and calculations: Solve for $x$, or find the value of $\sin(\frac{\pi}{4})$, or plot the points at $x=1$ and $x=2$ of $f(x) = x^2$. While this is indeed math, there's also so much more to math than raw computation.

Some of the most fundamental ideas of math are :red[axioms], :green[theorems], and :blue[definitions]. In simple terms:

- :red[Axioms] are fundamental truths that we as mathematicians agree upon; for example, that a set is a collection of things, or that a line can be drawn between any two points. We use them to build :blue[theorems].
- :green[Theorems] are statements that we *prove* using :red[axioms], and using those :green[theorems] we can prove other :green[theorems].
- :blue[Definitions] are certain mathematical concepts that we associate with a word or a phrase. For example, we say that a number is even if it can be written as two times another number.

---

## Our first proof

Let's use our new tools to prove something! We'll prove that if you add together two even numbers, the result must be an even number.

First, we'll write our :blue[definition], and we'll use more rigorous vocabulary:

- We say an integer $n$ is :green[even] if there exists an integer $k$ such that $n = 2k$.

(If you don't know, an integer is just a whole number that can be positive or negative. That means no decimal points or fractions.)

Now, we can state our theorem and start our proof. I'll put comments inside parentheses so you can follow along easier.

> **Theorem.** If $m$ and $n$ are :green[even] numbers, then $x+y$ is :green[even].

**Proof.** Let $m$ and $n$ be :green[even] numbers.
> (Since our theorem relies on having two :green[even] numbers, we can introduce the two numbers here to use in our proof.)

By definition, we have $m=2k$ and $n=2l$ for some integers $k$ and $l$.
> (Since $m$ and $n$ are :green[even], we can use our :blue[definitions] to rewrite the statement that $m$ and $n$ are :green[even] into actual equations, which we can manipulate.)

Adding $m$ and $n$ together, we see that

$$
\begin{align*}
m + n &= 2k + 2l \tag{substitute definitions} \\
&= 2 (k + l). \tag{distributive property}
\end{align*}
$$

We know that the sum of two integers is an integer, so $k + l$ is an integer.
> (This is something we just assume to be true when working with integers. We could actually prove this, but that would be a very long theorem.)

Since we have $m + n = 2 (k + l)$, by definition, we conclude that $m + n$ is :green[even]. $\square$
> (Notice, we have an integer $m + n$ is equal to two times another integer $k + l$. By our :blue[definitions], this is exactly what it means for an integer to be :green[even]! Thus, we can say that $m + n$ is :green[even], and there's our proof. The square simply denotes the end of our proof, and it's commonly known as [QED](https://en.wikipedia.org/wiki/Q.E.D./).)

---

And that's a (very, very short) intro to theorems and proofs! We'll be referring to :green[theorems] and :blue[definitions] a lot as we explore groups. The best way to learn to read theorems and proofs is to simply read more of them. I know, this is probably a cop-out answer, but it's honestly true. You'll see some of them in these pages on group theory, but if there's a specific area of math you're really interested in, like [linear algebra](https://en.wikipedia.org/wiki/Linear_algebra), [calculus](https://en.wikipedia.org/wiki/Calculus), [topology](https://en.wikipedia.org/wiki/Topology), or something else, honestly, read a textbook on the topic! It's the best way to self-study math; and don't worry about buying new textbooks. There'll always be [places to find some for pretty dang cheap](https://annas-archive.pk) ;)

(If that last link isn't working, try [this one](https://annas-archive.gl) or [this one](https://annas-archive.gd))

Also, you may see a lot of mathematical symbols out in the wild. For example, our definition of an :green[even] number can be written as:

- We say $n$ is even if $\exists k \in \Z$ such that $n = 2k$.

For a list of common symbols, check out [Wikipedia's glossary of mathematical symbols](https://en.wikipedia.org/wiki/Glossary_of_mathematical_symbols), namely the [basic logic section](https://en.wikipedia.org/wiki/Glossary_of_mathematical_symbols#Basic_logic) and the [blackboard bold section](https://en.wikipedia.org/wiki/Glossary_of_mathematical_symbols#Blackboard_bold).
