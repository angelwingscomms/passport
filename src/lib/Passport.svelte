<script lang="ts">
	export let src: string,
		w: number,
		h: number,
		top: number,
		left: number,
		color: string,
		el: HTMLDivElement | undefined = undefined,
		viewMode: string = 'screen',
		screenScale: number = 0.15;
	import { onMount } from 'svelte';

	// Debug: log when component is created
	console.log('Passport created with src:', src ? 'has image' : 'no image', 'viewMode:', viewMode, 'scale:', screenScale);

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
	style="background-color: {color}; {viewMode === 'screen' ? `width: ${Math.max(200, 1320.283 * screenScale)}px; height: ${Math.max(200, 1700.079 * screenScale)}px;` : ''}"
	class="border-[1px] border-solid border-slate-100 relative flex justify-center items-center overflow-hidden"
	class:w-[1320.283px]={viewMode === 'print'}
	class:h-[1700.079px]={viewMode === 'print'}
>
	<div
		style=" top: {top * screenScale}px; left: {left * screenScale}px"
		class="relative w-fit h-fit"
	>
		<div
			style="width: {w * (viewMode === 'screen' ? screenScale : 1)}px; height: {h * (viewMode === 'screen' ? screenScale : 1)}px"
			class="flex justify-center items-center"
		>
			<img
				alt="passport with removed background"
				class="img"
				style="inline-size: 100%; block-size: auto; object-fit: contain;"
				{src}
				on:load={() => console.log('Image loaded successfully')}
				on:error={(e) => console.error('Image failed to load:', e)}
			/>
		</div>
	</div>
</div>
