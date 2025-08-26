<script lang="ts">
	export let color = '#000',
		id: string,
		label: string;
</script>

<input class="hidden" {id} type="color" name={id} bind:value={color} />
<label
	style="background-color: {color};"
	for={id}
	class="border-[1px] border-zinc-100 inline-flex gap-x-2 items-center justify-center transition-colors focus-visible:outline-none disabled:pointer-events-none w-full max-w-full disabled:opacity-50 hover:bg-primary/90 px-4 py-2 rounded-full min-h-fit h-full"
	>{label}</label
>
