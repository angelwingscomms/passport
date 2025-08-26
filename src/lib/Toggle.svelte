<script lang="ts">
	export let checked: boolean,
		label: string,
		// label: string | undefined = undefined,
		id: string;
	// id: string | undefined = label || String(Math.random());
</script>

<input class="hidden" type="checkbox" {id} name={id} bind:checked />
<!-- {#if label} -->
<label
	class="inline-flex gap-x-2 items-center justify-center transition-colors focus-visible:outline-none disabled:pointer-events-none w-full max-w-full disabled:opacity-50 hover:bg-primary/90 {checked
		? 'bg-slate-300'
		: 'bg-slate-600'} hover:bg-slate-700 px-4 py-2 rounded-full min-h-fit h-full"
	for={id}>{label}</label
>
<!-- {/if} -->
