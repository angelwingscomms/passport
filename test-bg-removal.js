// Simple test script to debug background removal
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Test function to check if the API is working
async function testBackgroundRemoval() {
	try {
		// First test GET request
		console.log('Testing GET request...');
		const getResponse = await fetch('http://localhost:5173/api/remove-background', {
			method: 'GET'
		});

		const getData = await getResponse.json();
		console.log('API Status:', getData);

		// Now test POST request with image
		console.log('\nTesting POST request with image...');

		// Read the test image
		const imagePath = path.join(__dirname, 'test-image.png');
		const imageBuffer = fs.readFileSync(imagePath);

		// Create form data
		const formData = new FormData();
		const blob = new Blob([imageBuffer], { type: 'image/png' });
		formData.append('image', blob, 'test-image.png');

		const postResponse = await fetch('http://localhost:5173/api/remove-background-gemini', {
			method: 'POST',
			body: formData,
			headers: {
				// Let browser set content-type for FormData
			}
		});

		console.log('POST Response status:', postResponse.status);
		console.log('POST Response headers:', Object.fromEntries(postResponse.headers.entries()));

		if (postResponse.ok) {
			const resultBlob = await postResponse.blob();
			console.log('Success! Received blob:', resultBlob.size, 'bytes');

			// Check debug info from headers
			const debugInfo = postResponse.headers.get('x-debug-info');
			if (debugInfo) {
				console.log('Debug info:', JSON.parse(debugInfo));
			}

			// Save the result
			const resultBuffer = Buffer.from(await resultBlob.arrayBuffer());
			fs.writeFileSync('result-from-node.png', resultBuffer);
			console.log('Result saved to result-from-node.png');
		} else {
			const errorText = await postResponse.text();
			console.log('Error response:', errorText);
		}

	} catch (error) {
		console.error('Test failed:', error.message);
		console.error('Full error:', error);
	}
}

// Run the test
testBackgroundRemoval();
