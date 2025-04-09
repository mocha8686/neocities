export function randomizeRainbows() {
	const rainbows: NodeListOf<HTMLSpanElement> =
		document.querySelectorAll('.rainbow');

	for (const rainbow of rainbows) {
		const randDelay = Math.floor(Math.random() * 2000);
		const randDelayMs = `${randDelay}ms`;

		const randDuration = Math.floor(Math.random() * 1000) + 1500;
		const randDurationMs = `${randDuration}ms`;

		rainbow.style.setProperty('--delay', randDelayMs);
		rainbow.style.setProperty('--duration', randDurationMs);
	}
}
