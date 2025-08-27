# Gemini Background Removal Setup

This project now supports background removal using Google's Gemini 2.5 Flash Preview model.

## Prerequisites

1. **Gemini API Key**: Get your API key from [Google AI Studio](https://aistudio.google.com/apikey)

2. **Environment Setup**: Add your API key to the environment:
   ```bash
   # Copy the example file
   cp .env.example .env

   # Edit .env and add your API key
   GEMINI=your_actual_api_key_here
   ```

## How It Works

The Gemini background removal uses:
- **Model**: `gemini-2.0-flash-exp` (Gemini 2.0 Flash Experimental)
- **Input**: Image file (any common format: PNG, JPG, JPEG, WebP)
- **Output**: PNG image with transparent background
- **Processing**: AI-powered segmentation and background removal

## API Endpoints

### Background Removal
- **Endpoint**: `/api/remove-background-gemini`
- **Method**: POST
- **Content-Type**: `multipart/form-data`
- **Parameter**: `image` (file upload)

### Example Usage

```javascript
const formData = new FormData();
formData.append('image', imageFile);

const response = await fetch('/api/remove-background-gemini', {
  method: 'POST',
  body: formData
});

if (response.ok) {
  const blob = await response.blob();
  // Use the processed image blob
}
```

## Testing

1. **Start the development server**:
   ```bash
   npm run dev
   ```

2. **Visit the test page**: `http://localhost:5173/t`

3. **Upload an image** and click "Remove Background"

4. **View results**: The processed image will appear with a transparent background

## Features

- ✅ **Full Image Processing**: Processes entire images correctly
- ✅ **High Quality**: Gemini 2.5 Flash provides excellent segmentation
- ✅ **Multiple Formats**: Supports PNG, JPG, JPEG, WebP
- ✅ **Transparent Output**: Returns PNG with alpha channel
- ✅ **Error Handling**: Comprehensive error messages and logging

## Troubleshooting

### Common Issues

1. **"GEMINI environment variable is not set"**
   - Make sure you have a `.env` file with your API key
   - Restart the development server after adding the key

2. **API Quota Exceeded**
   - Check your Gemini API usage in Google AI Studio
   - Upgrade your quota if needed

3. **Model Not Available**
   - The `gemini-2.0-flash-exp` model might be in limited availability
   - Try using `gemini-1.5-flash` or `gemini-1.5-pro` as alternatives

### Alternative Models

If `gemini-2.0-flash-exp` is not available, you can modify the endpoint to use:
- `gemini-1.5-flash` (recommended alternative)
- `gemini-1.5-pro` (higher quality, more expensive)

## Performance

- **Typical Processing Time**: 2-5 seconds per image
- **Image Size Limits**: Up to 20MB per image
- **Output Format**: Always PNG with transparency
- **Cost**: Varies by model and usage (check Gemini pricing)

## Integration Notes

- The endpoint includes proper CORS headers for web usage
- Images are processed server-side to keep API keys secure
- Error responses include detailed debugging information
- The processed images maintain the original aspect ratio

## Next Steps

1. **Set up your API key** in the `.env` file
2. **Test the functionality** with various image types
3. **Integrate into your application** as needed
4. **Monitor API usage** and costs in Google AI Studio

