<script lang="ts">
	import Base from './Base.svelte';

	export let text: string,
		href: string | undefined = undefined,
		icon: ConstructorOfATypedSvelteComponent | undefined = undefined,
		disabled: boolean | undefined = undefined,
		type: 'button' | 'submit' | 'reset' | null | undefined = undefined;
</script>

<Base on:click {disabled} {icon} {type} {href} {text} bg="bg-gradient-to-l from-8 to-7" />
