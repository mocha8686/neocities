---
title: Euler-Lagrange
pubDate: 2024-03-27
updatedDate: 2024-03-29
thing:
    type: math
    expression: \frac{d}{dt}\left(\frac{\partial L}{\partial \dot{q}}\right)=\frac{\partial L}{\partial q}
---

this one's a real doozy. one day i found a random youtube video talking about [lagrangian mechanics](https://en.wikipedia.org/wiki/Lagrangian_mechanics), and i watched it and i was like, *wow! that sounds cool. lemme try*.... yeah i'm weird, okay?

and so i did try and it was horribly confusing—but still, some part of me just wanted to learn it for some reason, so i kept going until i finally understood it. and wow, i now know i should've waited until calculus because after calc everything just clicked.

this method is way more complicated than newton's, up to a certain point of complexity in the problem when you just have too many damn forces to keep track of.

the premise is simple: find $L=T-V$, where $T$ is the sum of kinetic energies and $V$ is the sum of potential energies in the system. then, you just plug it into the equation and boom, you get your equation of motion.

obviously there's a rest of the owl situation here, and some problems might include DE's, but... y'know... it's cool i swear

so here's an example: let's imagine a block of mass $m$ connected to a spring with constant $k$, all on top of a frictionless table, where the block's displacement from equlibrium is $x$. then, we can define $T=\frac{1}{2}mv^{2}=\frac{1}{2}m\dot{x}^{2}$ and $V=\frac{1}{2}kx^{2}$. then, we can find:

$$
\begin{align*}
L & =T-V \\
 & = \frac{1}{2}m\dot{x}^{2}-\frac{1}{2}kx^{2}
\end{align*}
$$

from this, we find:

$$
\begin{align*}
\frac{d}{dt}\left(\frac{\partial L}{\partial \dot{x}}\right) & =\frac{d}{dt}\left(\frac{1}{2}m\dot{x}^{2}\right)=m\ddot{x}, \\
\frac{\partial L}{\partial x} & =kx
\end{align*}
$$

so, finally, we get:

$$
\begin{align*}
\frac{d}{dt}\left(\frac{\partial L}{\partial \dot{q}}\right) & =\frac{\partial L}{\partial q} \\
\implies m\ddot{x} & =kx \\
\iff ma & =kx
\end{align*}
$$

and this is actually just [hooke's law](https://en.wikipedia.org/wiki/Hooke%27s_law)! so we know this method works. isn't it cool?

yay physics~
