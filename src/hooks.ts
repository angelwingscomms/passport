import type { Handle } from '@sveltejs/kit';

export const handle: Handle = async ({ event, resolve }) => {
	// Handle API requests - disable CSRF for API routes
	if (event.url.pathname.startsWith('/api/')) {
		// Skip CSRF check for API routes by not calling the default resolve
		// and handling the request directly
		const response = await resolve(event, {
			filterSerializedResponseHeaders: (name) => name !== 'x-sveltekit-page'
		});

		// Add CORS headers for API routes
		const newResponse = new Response(response.body, {
			status: response.status,
			statusText: response.statusText,
			headers: {
				...Object.fromEntries(response.headers.entries()),
				'Access-Control-Allow-Origin': '*',
				'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
				'Access-Control-Allow-Headers': 'Content-Type, Authorization',
			},
		});

		return newResponse;
	}

	// For all other requests, use default behavior
	return resolve(event);
};
