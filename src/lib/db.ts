import { supabase } from './supabase';

export interface User {
	id: number;
	email: string;
	username: string;
	password: string;
	email_verified: boolean;
	verification_token: string | null;
	created_at: string;
	updated_at: string;
}

export interface VerificationToken {
	id: number;
	user_id: number;
	token: string;
	expires_at: number;
	created_at: string;
}

// No longer needed with Supabase - tables are managed via Supabase dashboard or migrations
export async function initDatabase() {
	// Supabase handles table creation via migrations or dashboard
	// This function is kept for compatibility but does nothing
	return;
}

export async function getUserByEmail(email: string): Promise<User | null> {
	const { data, error } = await supabase
		.from('users')
		.select('*')
		.eq('email', email)
		.single();

	if (error || !data) {
		return null;
	}

	return data as User;
}

export async function getUserByUsername(username: string): Promise<User | null> {
	const { data, error } = await supabase
		.from('users')
		.select('*')
		.eq('username', username)
		.single();

	if (error || !data) {
		return null;
	}

	return data as User;
}

export async function getUserById(id: number): Promise<User | null> {
	const { data, error } = await supabase
		.from('users')
		.select('*')
		.eq('id', id)
		.single();

	if (error || !data) {
		return null;
	}

	return data as User;
}

export async function createUser(
	email: string,
	username: string,
	hashedPassword: string,
	verificationToken: string
): Promise<number> {
	const { data, error } = await supabase
		.from('users')
		.insert({
			email,
			username,
			password: hashedPassword,
			verification_token: verificationToken,
			email_verified: false,
		})
		.select('id')
		.single();

	if (error || !data) {
		throw new Error(`Failed to create user: ${error?.message || 'Unknown error'}`);
	}

	return data.id;
}

export async function verifyUserEmail(userId: number): Promise<void> {
	const { error } = await supabase
		.from('users')
		.update({
			email_verified: true,
			verification_token: null,
		})
		.eq('id', userId);

	if (error) {
		throw new Error(`Failed to verify email: ${error.message}`);
	}
}

export async function createVerificationToken(
	userId: number,
	token: string,
	expiresAt: number
): Promise<void> {
	const { error } = await supabase
		.from('verification_tokens')
		.insert({
			user_id: userId,
			token,
			expires_at: expiresAt,
		});

	if (error) {
		throw new Error(`Failed to create verification token: ${error.message}`);
	}
}

export async function getVerificationToken(token: string): Promise<VerificationToken | null> {
	const now = Math.floor(Date.now() / 1000);
	const { data, error } = await supabase
		.from('verification_tokens')
		.select('*')
		.eq('token', token)
		.gt('expires_at', now)
		.single();

	if (error || !data) {
		return null;
	}

	return data as VerificationToken;
}

export async function deleteVerificationToken(token: string): Promise<void> {
	const { error } = await supabase
		.from('verification_tokens')
		.delete()
		.eq('token', token);

	if (error) {
		throw new Error(`Failed to delete verification token: ${error.message}`);
	}
}
