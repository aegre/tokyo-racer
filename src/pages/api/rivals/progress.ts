import type { APIRoute } from 'astro';
import { getUserFromSession } from '../../../lib/session';
import { toggleRivalCompletion, getRivalsWithProgress } from '../../../lib/rivals';
import { supabase } from '../../../lib/supabase';

// Get all rivals with user progress
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

		const rivals = await getRivalsWithProgress(user.id);

		return new Response(JSON.stringify({ rivals }), {
			status: 200,
			headers: { 'Content-Type': 'application/json' },
		});
	} catch (error: unknown) {
		const { createErrorResponse } = await import('../../../lib/error-handler');
		return createErrorResponse(error, {
			path: '/api/rivals/progress',
			method: 'GET',
			request,
		});
	}
};

// Toggle rival completion
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
		const { rivalId, completed } = body;

		if (typeof rivalId !== 'number' || typeof completed !== 'boolean') {
			return new Response(JSON.stringify({ error: 'Invalid request' }), {
				status: 400,
				headers: { 'Content-Type': 'application/json' },
			});
		}

		await toggleRivalCompletion(user.id, rivalId, completed);

		// Return updated timestamp
		const { data: updatedProgress } = await supabase
			.from('user_rival_progress')
			.select('updated_at')
			.eq('user_id', user.id)
			.eq('rival_id', rivalId)
			.maybeSingle();

		return new Response(JSON.stringify({ 
			success: true,
			updated_at: updatedProgress?.updated_at || new Date().toISOString()
		}), {
			status: 200,
			headers: { 'Content-Type': 'application/json' },
		});
	} catch (error: unknown) {
		const { createErrorResponse } = await import('../../../lib/error-handler');
		return createErrorResponse(error, {
			path: '/api/rivals/progress',
			method: 'POST',
			request,
		});
	}
};
