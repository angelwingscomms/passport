import type { RequestHandler } from "../../$types";
import { AutoModel, AutoProcessor, RawImage } from '@huggingface/transformers';
import { createCanvas, loadImage } from 'canvas';

let model: any = null;
let processor: any = null;

// Initialize the MODNet model and processor
async function initializeModel() {
	if (!model || !processor) {
		try {
			console.log('Initializing MODNet model...');
			model = await AutoModel.from_pretrained('Xenova/modnet', { dtype: "fp32" });
			processor = await AutoProcessor.from_pretrained('Xenova/modnet');
			console.log('Model initialized successfully');
		} catch (error) {
			console.error('Failed to initialize MODNet model:', error);
			throw error;
		}
	}
}

export const GET: RequestHandler = async () => {
	try {
		await initializeModel();

		return new Response(JSON.stringify({
			message: 'Model test successful',
			model_loaded: true,
			processor_loaded: true
		}), {
			headers: {
				'Content-Type': 'application/json',
				'Access-Control-Allow-Origin': '*'
			}
		});

	} catch (error) {
		console.error('Model test error:', error);
		return new Response(JSON.stringify({
			error: 'Model test failed',
			details: error instanceof Error ? error.message : 'Unknown error'
		}), {
			status: 500,
			headers: {
				'Content-Type': 'application/json',
				'Access-Control-Allow-Origin': '*'
			}
		});
	}
};

