import type { RequestHandler } from "../$types";
import { AutoModel, AutoProcessor, RawImage } from '@huggingface/transformers';
import { createCanvas, loadImage } from 'canvas';

// Debug endpoint to visualize the mask
export const GET: RequestHandler = async () => {
	return new Response(JSON.stringify({
		message: 'Background removal API is running. Use POST to upload an image.',
		debug_info: 'Check server logs for detailed processing information'
	}), {
		headers: { 'Content-Type': 'application/json' }
	});
};

// Handle OPTIONS requests for CORS
export const OPTIONS: RequestHandler = async () => {
	return new Response(null, {
		status: 200,
		headers: {
			'Access-Control-Allow-Origin': '*',
			'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
			'Access-Control-Allow-Headers': 'Content-Type',
		}
	});
};

let model: any = null;
let processor: any = null;

// Initialize the MODNet model and processor
async function initializeModel() {
	if (!model || !processor) {
		try {
			model = await AutoModel.from_pretrained('Xenova/modnet', { dtype: "fp32" });
			processor = await AutoProcessor.from_pretrained('Xenova/modnet');
		} catch (error) {
			console.error('Failed to initialize MODNet model:', error);
			throw error;
		}
	}
}

export const POST: RequestHandler = async ({ request }) => {
	try {
		console.log('=== NEW REQUEST STARTED ===');
		console.log('Request method:', request.method);
		console.log('Request headers:', Object.fromEntries(request.headers.entries()));
		console.log('Request URL:', request.url);

		// Initialize model if not already done
		await initializeModel();

		// Parse the multipart form data
		const formData = await request.formData();
		const file = formData.get('image') as File;

		if (!file) {
			console.log('No image file found in form data');
			return new Response(JSON.stringify({ error: 'No image file provided' }), {
				status: 400,
				headers: { 'Content-Type': 'application/json' }
			});
		}

		console.log('File received:', file.name, 'Size:', file.size, 'Type:', file.type);

		console.log('Processing image:', file.name, 'Size:', file.size, 'Type:', file.type);

		// Convert file to buffer
		const arrayBuffer = await file.arrayBuffer();
		const buffer = Buffer.from(arrayBuffer);

		// Load image with canvas
		const image = await loadImage(buffer);
		console.log('Image loaded:', image.width, 'x', image.height);

		// Create RawImage from the loaded image
		const canvas = createCanvas(image.width, image.height);
		const ctx = canvas.getContext('2d');
		ctx.drawImage(image, 0, 0);

		// Convert to RawImage format for transformers
		const rawImage = new RawImage(new Uint8Array(canvas.toBuffer('raw')), image.width, image.height, 4);
		console.log('RawImage created with dimensions:', rawImage.width, 'x', rawImage.height);

		// Pre-process image
		const { pixel_values } = await processor(rawImage);
		console.log('Pixel values processed, shape:', pixel_values.dims);

		// Predict alpha matte
		const { output } = await model({ input: pixel_values });
		console.log('Model output received, output length:', output.length);

		if (output && output[0]) {
			console.log('Output tensor shape:', output[0].dims);
			console.log('Output tensor type:', output[0].type);
		}

		// Convert output to mask
		const maskTensor = output[0].mul(255).to('uint8');
		const maskData = maskTensor.data;
		console.log('Mask data length:', maskData.length);
		console.log('Image dimensions:', image.width, 'x', image.height);
		console.log('Expected mask length for image:', image.width * image.height);
		console.log('Mask dimensions from tensor:', maskTensor.dims);

		// Check if mask needs to be resized to match image dimensions
		let finalMaskData = maskData;
		if (maskTensor.dims && maskTensor.dims.length >= 2) {
			const maskHeight = maskTensor.dims[1] || Math.floor(Math.sqrt(maskData.length));
			const maskWidth = maskTensor.dims[2] || Math.floor(maskData.length / maskHeight);
			console.log('Calculated mask dimensions:', maskWidth, 'x', maskHeight);

			if (maskWidth !== image.width || maskHeight !== image.height) {
				console.log('⚠️ Mask dimensions do not match image dimensions! Resizing...');
				// Simple nearest neighbor scaling
				finalMaskData = new Uint8Array(image.width * image.height);
				const scaleX = maskWidth / image.width;
				const scaleY = maskHeight / image.height;

				for (let y = 0; y < image.height; y++) {
					for (let x = 0; x < image.width; x++) {
						const sourceX = Math.floor(x * scaleX);
						const sourceY = Math.floor(y * scaleY);
						const sourceIndex = sourceY * maskWidth + sourceX;
						const targetIndex = y * image.width + x;
						finalMaskData[targetIndex] = maskData[sourceIndex] || 0;
					}
				}
				console.log('✅ Mask resized to match image dimensions');
			}
		}

		console.log('First 10 mask values:', Array.from(finalMaskData.slice(0, 10)));

		// Check mask statistics
		const maskStats = finalMaskData.reduce((stats, val) => {
			stats.sum += val;
			stats.min = Math.min(stats.min, val);
			stats.max = Math.max(stats.max, val);
			return stats;
		}, { sum: 0, min: 255, max: 0 });
		console.log('Mask statistics:', maskStats);

		// Create new canvas for the result
		const resultCanvas = createCanvas(image.width, image.height);
		const resultCtx = resultCanvas.getContext('2d');

		// Draw original image
		resultCtx.drawImage(image, 0, 0);

		// Get image data
		const imageData = resultCtx.getImageData(0, 0, image.width, image.height);
		const data = imageData.data;
		console.log('Original image data length:', data.length);

		// Apply mask to make background transparent
		let pixelsModified = 0;
		let pixelsKept = 0;
		for (let i = 0; i < data.length; i += 4) {
			const maskIndex = Math.floor(i / 4);
			const maskValue = finalMaskData[maskIndex];

			// For MODNet, higher values typically mean foreground, lower values mean background
			// We want to keep the foreground (high alpha) and remove background (low alpha)
			// const alpha = maskValue / 255; // maskValue is already 0-255

			// Try inverting the mask - sometimes MODNet outputs work differently
			const alpha = 1 - (maskValue / 255); // Inverted mask

			// Apply threshold to avoid partial transparency issues
			const threshold = 0.3; // Adjust this if needed
			const finalAlpha = alpha > threshold ? 255 : Math.max(0, alpha * 255);

			data[i + 3] = Math.round(finalAlpha); // Set alpha channel

			if (alpha < 0.5) {
				pixelsModified++;
			} else {
				pixelsKept++;
			}
		}

		console.log('Pixels modified (made transparent):', pixelsModified);
		console.log('Pixels kept (foreground):', pixelsKept);
		console.log('Total pixels:', pixelsModified + pixelsKept);
		console.log('First 20 alpha values after processing:', Array.from(data.slice(3, 83, 4))); // Every 4th value starting from index 3

		// Put the modified image data back
		resultCtx.putImageData(imageData, 0, 0);

		// Convert to buffer and return
		const resultBuffer = resultCanvas.toBuffer('image/png');
		console.log('Final buffer size:', resultBuffer.length);

		// Add debug information to response headers
		const debugInfo = {
			imageDimensions: `${image.width}x${image.height}`,
			pixelsModified,
			pixelsKept,
			totalPixels: pixelsModified + pixelsKept,
			processingTime: Date.now()
		};

		return new Response(new Uint8Array(resultBuffer), {
			headers: {
				'Content-Type': 'image/png',
				'Content-Disposition': 'attachment; filename="background-removed.png"',
				'Access-Control-Allow-Origin': '*',
				'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
				'Access-Control-Allow-Headers': 'Content-Type',
				'X-Debug-Info': JSON.stringify(debugInfo)
			}
		});

	} catch (error) {
		console.error('Background removal error:', error);
		return new Response(JSON.stringify({
			error: 'Failed to process image',
			details: error instanceof Error ? error.message : 'Unknown error'
		}), {
			status: 500,
			headers: { 'Content-Type': 'application/json' }
		});
	}
};
