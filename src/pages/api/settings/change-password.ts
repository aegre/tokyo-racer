import type { APIRoute } from 'astro';
import { z } from 'zod';
import { getUserFromSession } from '../../../lib/session';
import { verifyPassword, hashPassword } from '../../../lib/auth';
import { supabase } from '../../../lib/supabase';
import { createErrorResponse } from '../../../lib/error-handler';

const changePasswordSchema = z.object({
	currentPassword: z.string().min(1, 'Current password is required'),
	newPassword: z.string().min(8, 'New password must be at least 8 characters'),
});

export const POST: APIRoute = async ({ request, cookies }) => {
	try {
		// Check authentication
		const sessionToken = cookies.get('session')?.value;
		if (!sessionToken) {
			return createErrorResponse('Unauthorized', 401);
		}

		const user = await getUserFromSession(sessionToken);
		if (!user) {
			return createErrorResponse('Unauthorized', 401);
		}

		// Validate request body
		const body = await request.json();
		const validated = changePasswordSchema.parse(body);

		// Verify current password
		const isValidPassword = await verifyPassword(validated.currentPassword, user.password);
		if (!isValidPassword) {
			return createErrorResponse('Current password is incorrect', 400);
		}

		// Check if new password is different
		if (validated.currentPassword === validated.newPassword) {
			return createErrorResponse('New password must be different from current password', 400);
		}

		// Hash new password
		const hashedPassword = await hashPassword(validated.newPassword);

		// Update password in database
		const { error } = await supabase
			.from('users')
			.update({
				password: hashedPassword,
				updated_at: new Date().toISOString(),
			})
			.eq('id', user.id);

		if (error) {
			console.error('Failed to update password:', error);
			return createErrorResponse('Failed to update password. Please try again.', 500);
		}

		return new Response(
			JSON.stringify({
				message: 'Password changed successfully',
			}),
			{
				status: 200,
				headers: { 'Content-Type': 'application/json' },
			}
		);
	} catch (error: unknown) {
		if (error instanceof z.ZodError) {
			return createErrorResponse(error.errors[0].message, 400);
		}
		return createErrorResponse('An unexpected error occurred', 500);
	}
};
