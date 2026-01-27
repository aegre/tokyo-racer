import { z } from 'zod';

export const signupSchema = z.object({
	email: z.string().email('Invalid email address'),
	username: z.string().min(3, 'Username must be at least 3 characters').max(30, 'Username must be less than 30 characters'),
	password: z.string().min(8, 'Password must be at least 8 characters'),
});

export const loginSchema = z.object({
	email: z.string().email('Invalid email address'),
	password: z.string().min(1, 'Password is required'),
	rememberMe: z.boolean().optional().default(false),
});

export type SignupInput = z.infer<typeof signupSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
