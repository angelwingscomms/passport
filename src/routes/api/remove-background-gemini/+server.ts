import { GEMINI } from "$env/static/private";
import type { RequestHandler } from "../../$types";
import { GoogleGenAI } from '@google/genai';

let ai: GoogleGenAI | null = null;

// Initialize Gemini AI
async function initializeGemini() {
	if (!ai) {
		const apiKey = GEMINI;
		if (!apiKey) {
			throw new Error('GEMINI environment variable is not set');
		}
		ai = new GoogleGenAI({ apiKey });
	}
}


export const POST: RequestHandler = async ({ request }) => {
	// Initialize Gemini AI
	await initializeGemini();

	// Parse the multipart form data
	const formData = await request.formData();
	const file = formData.get('image') as File;

	if (!file) {
		return new Response(JSON.stringify({ error: 'No image file provided' }), {
			status: 400,
			headers: { 'Content-Type': 'application/json' }
		});
	}

	console.log('Processing image with Gemini:', file.name, 'Size:', file.size, 'Type:', file.type);

	// Convert file to base64 for Gemini
	const arrayBuffer = await file.arrayBuffer();
	const base64Image = Buffer.from(arrayBuffer).toString('base64');

	try {

		// Create the prompt for background removal
		const prompt = `remove bg`;

		// Use Gemini to process the image
		const response = await ai!.models.generateContent({
			model: 'gemini-2.5-flash-image-preview',
			contents: [
				{
					role: 'user',
					parts: [
						{ text: prompt },
						{
							inlineData: {
								mimeType: file.type,
								data: base64Image
							}
						}
					]
				}
			]
		});

		// Check for API errors in the response (Gemini errors are thrown as exceptions)

		console.log('Gemini response received');
		console.log('Full response structure:', JSON.stringify(response, null, 2));

		// Extract the processed image from Gemini's response
		const candidate = response.candidates?.[0];
		if (!candidate?.content?.parts) {
			console.log('No content parts in Gemini response. Full candidate:', JSON.stringify(candidate, null, 2));
			throw new Error('No content parts in Gemini response');
		}

		console.log('Response parts:', JSON.stringify(candidate.content.parts, null, 2));

		// Find the image data in the response
		let processedImageData: string | null = null;
		for (const part of candidate.content.parts) {
			if (part.inlineData && part.inlineData.data) {
				processedImageData = part.inlineData.data;
				break;
			}
		}

		if (!processedImageData) {
			// If no image data, try to get text response
			const text = response.text;
			console.log('Gemini text response:', text);
			console.log('Available part types:', candidate.content.parts.map(p => Object.keys(p)).join(', '));
			throw new Error('Gemini did not return image data. Response: ' + text);
		}

		// Convert base64 back to buffer
		const imageBuffer = Buffer.from(processedImageData, 'base64');

		console.log('Processed image buffer size:', imageBuffer.length);

		return new Response(imageBuffer, {
			headers: {
				'Content-Type': 'image/png',
				'Content-Disposition': 'attachment; filename="background-removed-gemini.png"',
				'Access-Control-Allow-Origin': '*',
				'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
				'Access-Control-Allow-Headers': 'Content-Type',
			}
		});

	} catch (error) {
		console.error('Gemini background removal error:', error);

		const errorMessage = error instanceof Error ? error.message : 'Unknown error';

		return new Response(JSON.stringify({
			error: 'Failed to process image with Gemini',
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

