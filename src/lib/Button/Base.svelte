<script lang="ts">
	export let text: string | undefined = undefined,
		bg = '',
		classes = '',
		icon: ConstructorOfATypedSvelteComponent | undefined = undefined,
		disabled: boolean | undefined = undefined,
		href: string | undefined = undefined,
		type: 'button' | 'submit' | 'reset' | null | undefined = undefined;
</script>

{#if href}
	<a
		on:click
		on:mousedown
		on:mouseup
		{href}
		class="inline-flex gap-x-2 items-center justify-center transition-colors focus-visible:outline-none disabled:pointer-events-none w-full max-w-full disabled:opacity-50 hover:bg-primary/90 {bg}  px-4 py-2 rounded-full min-h-fit h-full {classes}"
		>{#if text}
			{text}
		{/if}{#if icon}
			<svelte:component this={icon} />
		{/if}</a
	>
{:else}
	<button
		on:click
		on:mousedown
		on:mouseup
		{disabled}
		{type}
		class="inline-flex gap-x-2 items-center justify-center transition-colors focus-visible:outline-none disabled:pointer-events-none w-full max-w-full disabled:opacity-50 hover:bg-primary/90 {bg}  px-4 py-2 rounded-full min-h-fit h-full {classes}"
	>
		{#if text}
			{text}
		{/if}
		{#if icon}
			<svelte:component this={icon} />
		{/if}
	</button>
{/if}
