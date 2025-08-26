<script lang="ts">
	import Base from './Base.svelte';

	export let text: string | undefined = undefined,
		href: string | undefined = undefined,
		classes: string | undefined = undefined,
		iconDescription: string | undefined = undefined,
		icon: ConstructorOfATypedSvelteComponent | undefined = undefined,
		outline: boolean | undefined = undefined,
		disabled: boolean | undefined = undefined,
		type: 'button' | 'submit' | 'reset' | null | undefined = undefined;
</script>

<Base
	on:click
	{disabled}
	{icon}
	{type}
	{href}
	{text}
	classes="{outline ? 'border-2 border-6' : ''} {classes}"
/>
