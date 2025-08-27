// Test script for MODNet background removal
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function testModnetEndpoint() {
  try {
    // Read the test image
    const imagePath = path.join(__dirname, 'test-image.png');
    const imageBuffer = fs.readFileSync(imagePath);

    // Create form data
    const formData = new FormData();
    const blob = new Blob([imageBuffer], { type: 'image/png' });
    formData.append('image', blob, 'test-image.png');

    console.log('Sending request to MODNet endpoint...');
    console.log('Image size:', imageBuffer.length, 'bytes');

    // Make the request
    const response = await fetch('http://localhost:5173/api/remove-background', {
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

      // Save the result for inspection
      const arrayBuffer = await blob.arrayBuffer();
      const resultBuffer = Buffer.from(arrayBuffer);
      fs.writeFileSync('modnet-result.png', resultBuffer);
      console.log('Result saved as modnet-result.png');
    }

  } catch (error) {
    console.error('Test failed:', error);
  }
}

// Run the test
testModnetEndpoint();
