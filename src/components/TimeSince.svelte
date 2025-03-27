<script lang="ts">
	import dayjs from 'dayjs';
	import relativeTime from 'dayjs/plugin/relativeTime';
	import type { HTMLTimeAttributes } from 'svelte/elements';

	interface Props extends Omit<HTMLTimeAttributes, 'datetime'> {
		timestamp: string;
	}

	const { timestamp, ...rest }: Props = $props();

	dayjs.extend(relativeTime);
	const dateUpdated = dayjs(timestamp);
	const timeSinceUpdate = dayjs().to(dateUpdated);

	let isHovered = $state(false);
	let date = $derived(isHovered ? timestamp : timeSinceUpdate);

	const hover = () => {
		isHovered = true;
	};
	const unhover = () => {
		isHovered = false;
	};
</script>

<time
	datetime={timestamp}
	{...rest}
	onmouseover={hover}
	onfocus={hover}
	onmouseout={unhover}
	onblur={unhover}>{date}</time
>
