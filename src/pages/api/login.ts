import type { APIRoute } from 'astro';
import { randomBytesHexSync } from '../../lib/crypto-utils';
import { loginSchema } from '../../lib/validation';
import { verifyPassword } from '../../lib/auth';
import { getUserByEmail } from '../../lib/db';
import { createSession } from '../../lib/session';

export const POST: APIRoute = async ({ request, cookies }) => {
	try {
		const body = await request.json();
		const validated = loginSchema.parse(body);

		// Find user
		const user = await getUserByEmail(validated.email);
		if (!user) {
			return new Response(JSON.stringify({ error: 'Invalid email or password' }), {
				status: 401,
				headers: { 'Content-Type': 'application/json' },
			});
		}

		// Verify password
		const isValidPassword = await verifyPassword(validated.password, user.password);
		if (!isValidPassword) {
			return new Response(JSON.stringify({ error: 'Invalid email or password' }), {
				status: 401,
				headers: { 'Content-Type': 'application/json' },
			});
		}

		// Check if email is verified
		if (!user.email_verified) {
			return new Response(JSON.stringify({ error: 'Please verify your email before logging in' }), {
				status: 403,
				headers: { 'Content-Type': 'application/json' },
			});
		}

		// Check for "remember me" option
		const rememberMe = body.rememberMe === true;

		// Create session
		const sessionToken = randomBytesHexSync(32);
		await createSession(user.id, sessionToken, rememberMe);
		
		// Set cookie expiration: 30 days for "remember me", 7 days for regular sessions
		const maxAge = rememberMe ? 60 * 60 * 24 * 30 : 60 * 60 * 24 * 7;
		
		cookies.set('session', sessionToken, {
			path: '/',
			httpOnly: true,
			secure: true,
			sameSite: 'strict',
			maxAge: maxAge,
		});

		return new Response(
			JSON.stringify({
				message: 'Login successful',
				user: {
					id: user.id,
					email: user.email,
					username: user.username,
				},
			}),
			{
				status: 200,
				headers: { 'Content-Type': 'application/json' },
			}
		);
	} catch (error: unknown) {
		const { createErrorResponse } = await import('../../lib/error-handler');
		return createErrorResponse(error, {
			path: '/api/login',
			method: 'POST',
			request,
		});
	}
};
