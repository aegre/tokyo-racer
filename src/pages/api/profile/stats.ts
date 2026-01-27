import type { APIRoute } from 'astro';
import { getUserFromSession } from '../../../lib/session';
import { getUserStats } from '../../../lib/stats';

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

		const stats = await getUserStats(user.id);

		return new Response(JSON.stringify({ stats }), {
			status: 200,
			headers: { 'Content-Type': 'application/json' },
		});
	} catch (error: unknown) {
		const { createErrorResponse } = await import('../../../lib/error-handler');
		return createErrorResponse(error, {
			path: '/api/profile/stats',
			method: 'GET',
			request,
		});
	}
};
