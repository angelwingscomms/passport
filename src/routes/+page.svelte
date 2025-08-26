<script lang="ts">
	import FileUpload from '$lib/FileUpload.svelte';
	import Button from '../lib/Button/Button.svelte';
	import Passport from '../lib/Passport.svelte';
	import '../app.css';
	import Toggle from '$lib/Toggle.svelte';
	import html2canvas from 'html2canvas';
	import ColorInput from '$lib/ColorInput.svelte';

	let src: string = '',
		count = 4,
		top = 0,
		left = 0,
		interval: number,
		loading = false,
		// fit_w = false,
		color = '#334155',
		w = 1320.283,
		h = 1700.079,
		el: HTMLDivElement,
		single: HTMLDivElement;

	// $: position = `${left}px ${top}px`;
	// $: console.log(w);

	const download = () => {
		html2canvas(el).then((canvas) => {
			canvas.toBlob(function (blob) {
				const link = document.createElement('a');
				if (!blob) {
					alert('an error occured');
					return;
				}
				link.href = URL.createObjectURL(blob);
				link.download = 'image.png';
				link.click();
				document.removeChild(link);
			});
		});
	};

	const download_single = () => {
		html2canvas(single).then((canvas) => {
			canvas.toBlob(function (blob) {
				const link = document.createElement('a');
				if (!blob) {
					alert('an error occured');
					return;
				}
				link.href = URL.createObjectURL(blob);
				link.download = 'image.png';
				link.click();
				document.removeChild(link);
			});
		});
	};

	const download_single_without_background = () => {
		const link = document.createElement('a');
		link.href = src;
		link.download = 'plain.png';
		link.click();
		document.removeChild(link);
	};

	const file_to_base64 = (file: File): Promise<string | ArrayBuffer | null> => {
		return new Promise((resolve, reject) => {
			const reader = new FileReader();

			reader.onloadend = () => {
				resolve(reader.result);
			};

			reader.onerror = reject;

			reader.readAsDataURL(file);
		});
	};
</script>

<svelte:window
	on:keydown={(e) => {
		switch (e.key) {
			case 'ArrowUp':
				e.preventDefault()
				top--;
				break;
			case 'ArrowDown':
				e.preventDefault()
				top++;
				break;
			case 'ArrowLeft':
				e.preventDefault()
				left--;
				break;
			case 'ArrowRight':
				e.preventDefault()
				left++;
				break;
			case '+':
			case 'NumpadAdd':
				e.preventDefault()
				w++;
				// e.shiftKey ? w++ : h++;
				break;
			case '-':
			case 'NumpadSubtract':
				e.preventDefault()
				w--;
				// e.shiftKey ? w-- : h--;
				break;
		}
	}}
/>

<div class="p-4 flex flex-col gap-3">
	<div class="print:hidden flex flex-col gap-3">
		<FileUpload
			label={src ? 'change image' : 'add image'}
			on:change={async ({ detail }) => {
				loading = true;
				try{const r = await import('@imgly/background-removal');
				src = URL.createObjectURL(new Blob([await r.default(detail[0])], { type: 'image/png' }));} catch (e) {
					console.error('rm error', e)
					alert(`rm error: ${e}`)
				}
				loading = false;
			}}
		/>
	</div>

	<!-- {#if true} -->
	{#if src}
		<div class="flex flex-col gap-3">
			<div
				bind:this={el}
				class=" flex flex-wrap content-start h-[3850px] w-[5740px] bg-slate-700"
			>
					<Passport bind:el={single} bind:w bind:h bind:top bind:left bind:color bind:src />
					{#each Array(count-1) as _}
					<Passport bind:w bind:h bind:top bind:left bind:color bind:src />
				{/each}
			</div>

			<div class="print:hidden flex flex-col gap-1">
				<Button on:click={download} text="download" />
				<ColorInput bind:color id="color" label="set background color" />
				<Button on:click={download_single} text="download single" />
				<Button on:click={download_single_without_background} text="download single without background" />
				<div class="print:hidden flex flex-col items-center gap-1">
					<div>
						<Button
							text="up"
							on:mousedown={() => (interval = setInterval(() => /*fit_w ? w-- : */ top--, 144))}
							on:mouseup={() => clearInterval(interval)}
						/>
					</div>
					<div class="flex gap-1 items-stretch">
						<div>
							<Button
								text="left"
								on:mousedown={() => (interval = setInterval(() => /*fit_w ? w-- : */ left--, 144))}
								on:mouseup={() => clearInterval(interval)}
							/>
						</div>
						<div>
							<Button
								text="down"
								on:mousedown={() => (interval = setInterval(() => /*fit_w ? w-- : */ top++, 144))}
								on:mouseup={() => clearInterval(interval)}
							/>
						</div>
						<div>
							<Button
								text="right"
								on:mousedown={() => (interval = setInterval(() => /*fit_w ? w-- : */ left++, 144))}
								on:mouseup={() => clearInterval(interval)}
							/>
						</div>
					</div>
				</div>
				<div class="flex gap-1">
					<Button
						text="reduce"
						on:mousedown={() => (interval = setInterval(() => /*fit_w ? w-- : */ w--, 144))}
						on:mouseup={() => clearInterval(interval)}
					/>
					<Button
						text="increase"
						on:mousedown={() => (interval = setInterval(() => /*fit_w ? w++ : */ w++, 144))}
						on:mouseup={() => clearInterval(interval)}
					/>
				</div>
				<!-- <Toggle id="fit_w" label="fit width" bind:checked={fit_w} /> -->
				<Button text="remove one" on:click={() => count--} />
				<Button text="add one" on:click={() => count++} />
			</div>
		</div>
	{:else if loading}
		<p class="text-white">Loading...</p>
	{/if}
</div>
