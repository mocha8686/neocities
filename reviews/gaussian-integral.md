---
title: Gaussian Integral
date: 2024-03-30
updatedDate: 2024-03-31
thing:
    type: math
    expression: \int_{-\infty}^{\infty}e^{-x^{2}}\;dx=\sqrt{\pi}
---

there's [a great video](https://youtu.be/cy8r7WSuT1I?si=Iog6M8q6-B01h_EB) about this by [3Blue1Brown](https://www.youtube.com/@3blue1brown), which will probably do a much better job of explaining this one than i could ever do, but i do still want to talk about it because i think it's cool

## Normal Distribution

this integral is the foundation of the normal distribution we all know and love (yeah right, i had to google the dang formula bc it's so long), whose [pdf](https://en.wikipedia.org/wiki/Probability_density_function) looks like this:

$$
\begin{align*}
X&\sim N(\mu,\sigma^{2}) \\
\implies f(x)&=\frac{1}{\sqrt{2\pi\sigma^{2}}}e^{-\frac{(x-\mu)^{2}}{2\sigma^{2}}} \\
&=\frac{1}{\sqrt{2\pi\sigma^{2}}}\,\mathrm{exp}(-\frac{(x-\mu)^{2}}{2\sigma^{2}})
\end{align*}
$$

where $\mathrm{exp}(x)=e^{x}$, for readability purposes. to simplify, let's assume $\mu=0,\sigma=1$, and thus the pdf simplifies to:

$$
\begin{align*}
f(x)&=\frac{1}{\sqrt{2\pi(1)}}\,\mathrm{exp}(-\frac{(x-0)^{2}}{2(1)}) \\
&=\frac{1}{\sqrt{2\pi}}\,\mathrm{exp}(-\frac{x^{2}}{2}) \\
&=(\frac{1}{\sqrt{2}})\frac{1}{\sqrt{\pi}}e^{-(\frac{1}{2})x^{2}} \\
&=C\frac{1}{\sqrt{\pi}}e^{-kx^{2}}
\end{align*}
$$

if we ignore the constants $C$ and $k$, we see two components: $\frac{1}{\sqrt{\pi}}$ and $e^{-x^{2}}$. familiar? we have an expression divided by its area from $-\infty$ to $\infty$. is this a coincidence? (spoiler: no)

## Statistics and PDF's

for some background, pdf's, or [probability density functions](https://en.wikipedia.org/wiki/Probability_density_function), are functions that describe the likelihood that a random variable will take on a certain value. since the probability that the random variable lies between $-\infty$ and $\infty$ is 100%, we want the sum of the probabilities to equal 100%, which is the same as saying we want the area under the curve of the pdf, f(x), to equal one, or $\int_{-\infty}^{\infty}f(x)\;dx=1$.

the core of the normal distribution's pdf is the $e^{-x^{2}}$ component. this function was chosen because of its properties when considering the multivariabled version, $f(x,y)=e^{-(x^{2}+y^{2})}$: it's (1) only dependent on the distance from the origin ($(x,y)=(0,0)$) and (2) $x$ and $y$ are independent of each other. again, this is explained much more elegantly in 3Blue1Brown's video, so go check that out for more details

## Integration

now that we have our $e^{-x^{2}}$ base, we need to "normalize" it to have an area of 1. to do this, we might think to divide $e^{-x^{2}}$ by its area under the curve, so the area becomes 1, but now the tricky part becomes finding that area, or $\int_{-\infty}^{\infty}e^{-x^{2}}\;dx$. the formal method, the one usually taught, is through double integration or shell integration and polar coordinates, but 3Blue1Brown uses a visual proof which is so much more intuitive to me, and you should definitely check out the video for the full details. basically, the fact that $x$ and $y$ are independent of each other in the case of $e^{-(x^{2}+y^{2})}$ means that the cross-sections of its surface are just scaled versions of $e^{-x^{2}}$. since we know our target integral $\int_{-\infty}^{\infty}e^{-x^{2}}\;dx$ is equal to some constant, let's say $C$, we can say:

$$
\begin{align*}
\int_{-\infty}^{\infty}e^{-(x^2+y^2)}\;dx\,dy&=\int_{-\infty}^{\infty}e^{-x^2}e^{-y^2}\;dx\,dy \\
&=\int_{-\infty}^{\infty}Ce^{-y^2}\;dy
&=C\int_{-\infty}^{\infty}e^{-y^2}\;dy
\end{align*}
$$

since y is just a dummy variable *and* independent of x, we can say that $\int_{-\infty}^{\infty}e^{-y^2}\;dy=C$. thus:

$$
C\int_{-\infty}^{\infty}e^{-y^2}\;dy=C^{2}
$$

so now, we know that the area under the curve of $e^{-x^{2}}$ is equal to the volume under the surface of $e^{-(x^2+y^2)}$.

to find the volume, let's consider $e^{-(x^2+y^2)}$ once again. if we look at a graph of the function, we see that the surface is radially symmetric, which means we can use the shell method to integrate. we let $x^2+y^2=r^2$ (look familiar?), which implies that our shell cylinder's circumference is $2\pi r$, our height is $e^{-r^{2}}$, and our thickness is $dr$. thus, we find that the sum of those shells gives us the volume under $e^{-(x^2+y^2)}$:

$$
\begin{align*}
\int_{-\infty}^{\infty}e^{-(x^2+y^2)}\;dydx&=\int_{0}^{\infty}2\pi r\cdot e^{-r^{2}}\;dr \\
&=\pi\int_{0}^{\infty}2r\cdot e^{-r^{2}}\;dr & \mathrm{Let}\;u=e^{-r^{2}} \\ 
&=\pi\int_{\infty}^{0}1du & \implies du=-2re^{-r^{2}}dr \\
&=\pi\left[e^{-r^{2}}\right]_{\infty}^{0} \\
&=\pi\left[e^{-0^{2}}-e^{-\infty^{2}}\right] \\
&=\pi\left[1-0\right] \\
&=\pi=C^{2}
\end{align*}
$$

so, after all that, we get that the volume under the surface of $e^{-(x^2+y^2)}$ is equal to $\pi$. since we now know $\pi=C^{2}$, this implies $C=\sqrt{\pi}$, and since we know $C$ is equal to our target integral, we finally have our result, $\int_{-\infty}^{\infty}e^{-x^{2}}\;dx=\sqrt{\pi}$.

---

again, i explained this pretty poorly, so to get a much better explanation, go check out [3Blue1Brown](https://www.youtube.com/@3blue1brown)'s [video on the topic!](https://youtu.be/cy8r7WSuT1I?si=Iog6M8q6-B01h_EB)

yay math~
