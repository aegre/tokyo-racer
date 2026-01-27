import type { APIRoute } from 'astro';
import { signupSchema } from '../../lib/validation';
import { hashPassword, generateVerificationToken, getVerificationExpiry } from '../../lib/auth';
import { getUserByEmail, getUserByUsername, createUser, createVerificationToken } from '../../lib/db';
import { sendVerificationEmail } from '../../lib/email';

export const POST: APIRoute = async ({ request }) => {
	try {
		const body = await request.json();
		const validated = signupSchema.parse(body);

		// Check if user already exists
		const existingUserByEmail = await getUserByEmail(validated.email);
		if (existingUserByEmail) {
			return new Response(JSON.stringify({ error: 'Email already registered' }), {
				status: 400,
				headers: { 'Content-Type': 'application/json' },
			});
		}

		const existingUserByUsername = await getUserByUsername(validated.username);
		if (existingUserByUsername) {
			return new Response(JSON.stringify({ error: 'Username already taken' }), {
				status: 400,
				headers: { 'Content-Type': 'application/json' },
			});
		}

		// Hash password
		const hashedPassword = await hashPassword(validated.password);

		// Generate verification token
		const verificationToken = generateVerificationToken();
		const expiresAt = getVerificationExpiry();

		// Create user
		const userId = await createUser(validated.email, validated.username, hashedPassword, verificationToken);

		// Create verification token record
		await createVerificationToken(userId, verificationToken, expiresAt);

		// Send verification email
		const appUrl = import.meta.env.APP_URL || new URL(request.url).origin;
		try {
			await sendVerificationEmail({
				email: validated.email,
				username: validated.username,
				verificationToken,
				appUrl,
			});
		} catch (emailError) {
			// Log error but don't fail user registration
			// The token is still created, user can request a new verification email later
			console.error('Failed to send verification email:', emailError);
		}

		return new Response(
			JSON.stringify({
				message: 'User created successfully. Please check your email to verify your account.',
			}),
			{
				status: 201,
				headers: { 'Content-Type': 'application/json' },
			}
		);
	} catch (error: unknown) {
		const { createErrorResponse } = await import('../../lib/error-handler');
		return createErrorResponse(error, {
			path: '/api/signup',
			method: 'POST',
			request,
		});
	}
};
