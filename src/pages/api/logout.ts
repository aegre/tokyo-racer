import type { APIRoute } from 'astro';
import { deleteSession } from '../../lib/session';

export const GET: APIRoute = async ({ cookies }) => {
	const sessionToken = cookies.get('session')?.value;
	if (sessionToken) {
		try {
			await deleteSession(sessionToken);
		} catch (error) {
			console.error('Error deleting session:', error);
		}
	}

	cookies.delete('session', {
		path: '/',
	});

	return new Response(null, {
		status: 302,
		headers: {
			Location: '/login',
		},
	});
};
