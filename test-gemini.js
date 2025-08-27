// Test script for Gemini background removal
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function testGeminiEndpoint() {
  try {
    // Read the test image
    const imagePath = path.join(__dirname, 'test-image.png');
    const imageBuffer = fs.readFileSync(imagePath);
    const base64Image = imageBuffer.toString('base64');

    // Create form data
    const formData = new FormData();
    const blob = new Blob([imageBuffer], { type: 'image/png' });
    formData.append('image', blob, 'test-image.png');

    console.log('Sending request to Gemini endpoint...');
    console.log('Image size:', imageBuffer.length, 'bytes');

    // Make the request
    const response = await fetch('http://localhost:5173/api/remove-background-gemini', {
      method: 'POST',
      body: formData,
      credentials: 'same-origin'
    });

    console.log('Response status:', response.status);
    console.log('Response headers:', Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Error response:', errorData);
    } else {
      console.log('Success! Response received');
      const blob = await response.blob();
      console.log('Blob size:', blob.size, 'bytes');
      console.log('Blob type:', blob.type);
    }

  } catch (error) {
    console.error('Test failed:', error);
  }
}

// Run the test
testGeminiEndpoint();
