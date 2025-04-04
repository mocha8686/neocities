<script lang="ts">
import { effectsSettings, setSetting } from '$/lib/effectsSettings';

$effect(() => {
	window.localStorage.setItem('settings', JSON.stringify($effectsSettings));
});

// @ts-ignore
const set = (name: string, v: boolean) => setSetting(name, v);
</script>

{#each Object.entries($effectsSettings) as [name, checked]}
	<label>
		Enable {name}
		<input
			type="checkbox"
			bind:checked={() => checked, v => set(name, v)}
		/>
	</label>
{/each}
