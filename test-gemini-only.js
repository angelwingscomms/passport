// Test script for Gemini 2.5 Flash Image Preview background removal
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function testGeminiOnlyEndpoint() {
  try {
    // Read the test image
    const imagePath = path.join(__dirname, 'test-image.png');
    const imageBuffer = fs.readFileSync(imagePath);

    // Create form data
    const formData = new FormData();
    const blob = new Blob([imageBuffer], { type: 'image/png' });
    formData.append('image', blob, 'test-image.png');

    console.log('Testing Gemini 1.5 Pro endpoint...');
    console.log('Image size:', imageBuffer.length, 'bytes');
    console.log('Model: gemini-1.5-pro');

    // Make the request
    const response = await fetch('http://localhost:5175/api/remove-background-gemini', {
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
      console.log('✅ Success! Gemini 1.5 Pro processed the image');
      const blob = await response.blob();
      console.log('✅ Response blob size:', blob.size, 'bytes');
      console.log('✅ Response blob type:', blob.type);

      // Save the result for inspection
      const arrayBuffer = await blob.arrayBuffer();
      const resultBuffer = Buffer.from(arrayBuffer);
      fs.writeFileSync('gemini-1.5-pro-result.png', resultBuffer);
      console.log('✅ Result saved as gemini-1.5-pro-result.png');

      console.log('\n🎉 Gemini 1.5 Pro is working correctly!');
    }

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run the test
testGeminiOnlyEndpoint();
