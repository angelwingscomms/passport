<script lang="ts">
	export let src: string,
		w: number,
		h: number,
		top: number,
		left: number,
		color: string,
		el: HTMLDivElement | undefined = undefined;
	import { onMount } from 'svelte';

	onMount(async () => {
		const Hammer = await import('hammerjs');
		const hammer = new Hammer.default(el as HTMLDivElement);
		hammer.get('pinch').set({ enable: true });
		hammer.get('rotate').set({ enable: true });
		hammer.get('pan').set({ direction: Hammer.DIRECTION_ALL });

		hammer.on('pan', (e) => {
			console.info(e.distance, e.deltaX, e.deltaY);
			switch (e.direction) {
				case 2:
					left = e.deltaX;
				case 8:
					top = e.deltaY;
				case 4:
					left = e.deltaX;
				case 16:
					top = e.deltaY;
			}
		});

		hammer.on('pinch', (e) => {
			console.info(e.distance, e.deltaX, e.deltaY);
			if (e.deltaX > 0) w += e.distance
			if (e.deltaX < 0) w -= e.distance
		});
	});
</script>

<div
	bind:this={el}
	style="background-color: {color};"
	class="w-[1320.283px] h-[1700.079px] border-[1px] border-solid border-slate-100 relative flex justify-center items-center overflow-hidden"
>
	<div style=" top: {top}px; left: {left}px" class="relative w-fit h-fit">
		<div style="width: {w}px; height: {h}px" class="flex justify-center items-center">
			<img
				alt="passport with removed background"
				class="img"
				style="inline-size: 100%; block-size: auto"
				{src}
			/>
		</div>
	</div>
</div>
