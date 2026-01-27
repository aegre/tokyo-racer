import type { APIRoute } from 'astro';
import { getUserFromSession } from '../../lib/session';
import { getMandatoryCars, updateCarStatus } from '../../lib/cars';

// Get all mandatory cars for the user
export const GET: APIRoute = async ({ cookies, request }) => {
	try {
		const sessionToken = cookies.get('session')?.value;
		if (!sessionToken) {
			return new Response(JSON.stringify({ error: 'Unauthorized' }), {
				status: 401,
				headers: { 'Content-Type': 'application/json' },
			});
		}

		const user = await getUserFromSession(sessionToken);
		if (!user) {
			return new Response(JSON.stringify({ error: 'Unauthorized' }), {
				status: 401,
				headers: { 'Content-Type': 'application/json' },
			});
		}

		const cars = await getMandatoryCars(user.id);

		return new Response(JSON.stringify({ cars }), {
			status: 200,
			headers: { 'Content-Type': 'application/json' },
		});
	} catch (error: unknown) {
		const { createErrorResponse } = await import('../../lib/error-handler');
		return createErrorResponse(error, {
			path: '/api/cars',
			method: 'GET',
			request,
		});
	}
};

// Update car status
export const POST: APIRoute = async ({ request, cookies }) => {
	try {
		const sessionToken = cookies.get('session')?.value;
		if (!sessionToken) {
			return new Response(JSON.stringify({ error: 'Unauthorized' }), {
				status: 401,
				headers: { 'Content-Type': 'application/json' },
			});
		}

		const user = await getUserFromSession(sessionToken);
		if (!user) {
			return new Response(JSON.stringify({ error: 'Unauthorized' }), {
				status: 401,
				headers: { 'Content-Type': 'application/json' },
			});
		}

		const body = await request.json();
		const { carId, status } = body;

		if (typeof carId !== 'number' || !['locked', 'unlocked', 'owned'].includes(status)) {
			return new Response(JSON.stringify({ error: 'Invalid request' }), {
				status: 400,
				headers: { 'Content-Type': 'application/json' },
			});
		}

		await updateCarStatus(user.id, carId, status);

		return new Response(JSON.stringify({ success: true }), {
			status: 200,
			headers: { 'Content-Type': 'application/json' },
		});
	} catch (error: unknown) {
		const { createErrorResponse } = await import('../../lib/error-handler');
		return createErrorResponse(error, {
			path: '/api/cars',
			method: 'POST',
			request,
		});
	}
};
