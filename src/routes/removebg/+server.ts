import { REMOVE_BG } from "$env/static/private";
import type { RequestHandler } from "../../$types";

export const POST: RequestHandler = async ({ request }) => {
	// Get the API key from environment variables
	const apiKey = REMOVE_BG;
	if (!apiKey) {
		return new Response(JSON.stringify({ error: 'REMOVE_BG environment variable is not set' }), {
			status: 500,
			headers: { 'Content-Type': 'application/json' }
		});
	}

	try {
		// Parse the multipart form data
		const formData = await request.formData();
		const file = formData.get('image') as File;

		if (!file) {
			return new Response(JSON.stringify({ error: 'No image file provided' }), {
				status: 400,
				headers: { 'Content-Type': 'application/json' }
			});
		}

		console.log('Processing image with remove.bg:', file.name, 'Size:', file.size, 'Type:', file.type);

		// Create FormData for remove.bg API
		const apiFormData = new FormData();
		apiFormData.append("size", "auto");
		apiFormData.append("image_file", file);

		// Call remove.bg API
		const response = await fetch("https://api.remove.bg/v1.0/removebg", {
			method: "POST",
			headers: { "X-Api-Key": apiKey },
			body: apiFormData,
		});

		if (!response.ok) {
			const errorText = await response.text();
			console.error('remove.bg API error:', response.status, response.statusText, errorText);
			return new Response(JSON.stringify({
				error: `remove.bg API error: ${response.status} ${response.statusText}`,
				details: errorText
			}), {
				status: response.status,
				headers: { 'Content-Type': 'application/json' }
			});
		}

		// Get the processed image data
		const imageBuffer = await response.arrayBuffer();

		console.log('Processed image buffer size:', imageBuffer.byteLength);

		// Return the processed image
		return new Response(imageBuffer, {
			headers: {
				'Content-Type': 'image/png',
				'Content-Disposition': 'attachment; filename="background-removed.png"',
				'Access-Control-Allow-Origin': '*',
				'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
				'Access-Control-Allow-Headers': 'Content-Type',
			}
		});

	} catch (error) {
		console.error('remove.bg processing error:', error);

		const errorMessage = error instanceof Error ? error.message : 'Unknown error';

		return new Response(JSON.stringify({
			error: 'Failed to process image with remove.bg',
			details: errorMessage
		}), {
			status: 500,
			headers: {
				'Content-Type': 'application/json',
				'Access-Control-Allow-Origin': '*'
			}
		});
	}
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
