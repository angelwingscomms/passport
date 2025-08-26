<script lang="ts">
	export let multiple = false,
		name: string = '',
		// loading: boolean,
		ref: HTMLInputElement | undefined = undefined,
		label = `Upload file${multiple ? 's' : ''}`,
		dispatch_empty = false;

	// import type { Button as ButtonProps } from 'carbon-components-svelte/types';
	import { createEventDispatcher } from 'svelte';
	import Button from './Button/Button.svelte';

	const dispatch = createEventDispatcher<{ change: FileList }>();

	const change = async () => {
		if (!ref || !ref.files) return;
		if (ref.files.length < 1 && !dispatch_empty) return;
		dispatch('change', ref.files);
	};

	//TODO-loading indicator
	//TODO-button icon
	//TODO-icon description
</script>

<Button text={label} on:click={() => ref?.click()} />
<input style="display: none;" {multiple} {name} on:change={change} type="file" bind:this={ref} />
