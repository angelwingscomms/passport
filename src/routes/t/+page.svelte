<script lang="ts">
	import { createEventDispatcher } from 'svelte';

	let selectedFile: File | null = null;
	let originalImageUrl: string | null = null;
	let processedImageUrl: string | null = null;
	let isProcessing = false;
	let error: string | null = null;

	function handleFileSelect(event: Event) {
		const target = event.target as HTMLInputElement;
		const file = target.files?.[0];

		if (file) {
			selectedFile = file;
			// Create preview of original image
			const reader = new FileReader();
			reader.onload = (e) => {
				originalImageUrl = e.target?.result as string;
				processedImageUrl = null; // Clear previous result
				error = null;
			};
			reader.readAsDataURL(file);
		}
	}

	// Alternative approach using a hidden form
	async function removeBackgroundWithForm() {
		if (!selectedFile) return;

		isProcessing = true;
		error = null;

		try {
					// Create a temporary form element
		const form = document.createElement('form');
		form.method = 'POST';
		form.action = '/removebg';
		form.enctype = 'multipart/form-data';
		form.style.display = 'none';

			// Create file input
			const fileInput = document.createElement('input');
			fileInput.type = 'file';
			fileInput.name = 'image';

			// Create a new FileList-like object
			const dt = new DataTransfer();
			dt.items.add(selectedFile);
			fileInput.files = dt.files;

			form.appendChild(fileInput);
			document.body.appendChild(form);

			// Submit form and get response
			const formData = new FormData(form);
			document.body.removeChild(form);

			console.log('Sending request to background removal API...');
			const response = await fetch('/removebg', {
				method: 'POST',
				body: formData,
				// Try adding same-origin credentials
				credentials: 'same-origin'
			});

			console.log('Response status:', response.status);
			console.log('Response headers:', Object.fromEntries(response.headers.entries()));

			if (!response.ok) {
				const errorData = await response.json();
				throw new Error(errorData.error || 'Failed to process image');
			}

			// Create blob URL for the processed image
			const blob = await response.blob();
			console.log('Received blob:', blob.size, 'bytes, type:', blob.type);
			processedImageUrl = URL.createObjectURL(blob);

			console.log('Processed image URL created:', processedImageUrl);

		} catch (err) {
			error = err instanceof Error ? err.message : 'An error occurred';
			console.error('Background removal error:', err);
		} finally {
			isProcessing = false;
		}
	}

	async function removeBackground() {
		// Try the form approach first, fallback to regular fetch
		try {
			await removeBackgroundWithForm();
		} catch (err) {
			console.log('Form approach failed, trying regular fetch...');
			await removeBackgroundRegular();
		}
	}

	async function removeBackgroundRegular() {
		if (!selectedFile) return;

		isProcessing = true;
		error = null;

		try {
			const formData = new FormData();
			formData.append('image', selectedFile);

			console.log('Sending request to background removal API...');
			const response = await fetch('/removebg', {
				method: 'POST',
				body: formData,
				credentials: 'same-origin'
			});

			console.log('Response status:', response.status);
			console.log('Response headers:', Object.fromEntries(response.headers.entries()));

			if (!response.ok) {
				const errorData = await response.json();
				throw new Error(errorData.error || 'Failed to process image');
			}

			// Create blob URL for the processed image
			const blob = await response.blob();
			console.log('Received blob:', blob.size, 'bytes, type:', blob.type);
			processedImageUrl = URL.createObjectURL(blob);

			console.log('Processed image URL created:', processedImageUrl);

		} catch (err) {
			error = err instanceof Error ? err.message : 'An error occurred';
			console.error('Background removal error:', err);
		} finally {
			isProcessing = false;
		}
	}

	function downloadImage() {
		if (!processedImageUrl) return;

		const link = document.createElement('a');
		link.href = processedImageUrl;
		link.download = 'background-removed.png';
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);
	}
</script>

<svelte:head>
	<title>Background Removal Test</title>
</svelte:head>

<div class="container">
	<h1>Background Removal Test Page</h1>

	<div class="upload-section">
		<input
			type="file"
			accept="image/*"
			on:change={handleFileSelect}
			disabled={isProcessing}
		/>
		<button
			on:click={removeBackground}
			disabled={!selectedFile || isProcessing}
		>
			{isProcessing ? 'Processing...' : 'Remove Background'}
		</button>
		<button
			on:click={() => {
				console.log('=== DEBUG INFO ===');
				console.log('Selected file:', selectedFile);
				console.log('Original image URL:', originalImageUrl);
				console.log('Processed image URL:', processedImageUrl);
				console.log('Is processing:', isProcessing);
				console.log('Error:', error);
				alert('Check browser console for debug info');
			}}
		>
			Debug Info
		</button>
	</div>

	{#if error}
		<div class="error">{error}</div>
	{/if}

	<div class="images-section">
		{#if originalImageUrl}
			<div class="image-container">
				<h3>Original Image</h3>
				<img src={originalImageUrl} alt="Original" />
			</div>
		{/if}

		{#if processedImageUrl}
			<div class="image-container">
				<h3>Background Removed</h3>
				<img src={processedImageUrl} alt="Background removed" />
				<button on:click={downloadImage} class="download-btn">
					Download
				</button>
			</div>
		{/if}
	</div>
</div>

<style>
	.container {
		max-width: 1200px;
		margin: 0 auto;
		padding: 20px;
		font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
	}

	h1 {
		text-align: center;
		margin-bottom: 30px;
		color: #333;
	}

	.upload-section {
		display: flex;
		gap: 15px;
		margin-bottom: 30px;
		align-items: center;
		justify-content: center;
	}

	input[type="file"] {
		padding: 8px;
		border: 1px solid #ddd;
		border-radius: 4px;
	}

	button {
		padding: 10px 20px;
		background-color: #007bff;
		color: white;
		border: none;
		border-radius: 4px;
		cursor: pointer;
		font-size: 16px;
	}

	button:hover:not(:disabled) {
		background-color: #0056b3;
	}

	button:disabled {
		background-color: #ccc;
		cursor: not-allowed;
	}

	.error {
		background-color: #f8d7da;
		color: #721c24;
		padding: 10px;
		border-radius: 4px;
		margin-bottom: 20px;
		text-align: center;
	}

	.images-section {
		display: flex;
		gap: 40px;
		justify-content: center;
		flex-wrap: wrap;
	}

	.image-container {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 15px;
	}

	.image-container h3 {
		margin: 0;
		color: #555;
	}

	img {
		max-width: 400px;
		max-height: 400px;
		border: 1px solid #ddd;
		border-radius: 8px;
		box-shadow: 0 2px 8px rgba(0,0,0,0.1);
	}

	.download-btn {
		background-color: #28a745;
		font-size: 14px;
		padding: 8px 16px;
	}

	.download-btn:hover {
		background-color: #218838;
	}
</style>
