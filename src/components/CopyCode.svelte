<script lang="ts">
interface Props {
	code: string;
}

const { code, ...rest }: Props = $props();

let text = $state('copy code');
let timeout: NodeJS.Timeout | undefined = $state(undefined);

function copy() {
	navigator.clipboard.writeText(code);
	text = 'copied!';

	clearTimeout(timeout);
	timeout = setTimeout(() => {
		text = 'copy code';
		timeout = undefined;
	}, 2500);
}
</script>

<button type="button" {...rest} onclick={copy}>{text}</button>
