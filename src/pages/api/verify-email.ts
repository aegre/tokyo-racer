import type { APIRoute } from 'astro';
import { getVerificationToken, verifyUserEmail, deleteVerificationToken } from '../../lib/db';

export const GET: APIRoute = async ({ url, request }) => {
	try {
		const token = url.searchParams.get('token');

		if (!token) {
			return new Response(JSON.stringify({ error: 'Verification token is required' }), {
				status: 400,
				headers: { 'Content-Type': 'application/json' },
			});
		}

		// Find verification token
		const verificationToken = await getVerificationToken(token);
		if (!verificationToken) {
			return new Response(JSON.stringify({ error: 'Invalid or expired verification token' }), {
				status: 400,
				headers: { 'Content-Type': 'application/json' },
			});
		}

		// Verify user email
		await verifyUserEmail(verificationToken.user_id);

		// Delete used token
		await deleteVerificationToken(token);

		return new Response(
			JSON.stringify({
				message: 'Email verified successfully. You can now log in.',
			}),
			{
				status: 200,
				headers: { 'Content-Type': 'application/json' },
			}
		);
	} catch (error: unknown) {
		const { createErrorResponse } = await import('../../lib/error-handler');
		return createErrorResponse(error, {
			path: '/api/verify-email',
			method: 'GET',
			request,
		});
	}
};
