import { supabase } from './supabase';
import { getUserById } from './db';

export interface Session {
	id: number;
	user_id: number;
	token: string;
	expires_at: number;
	created_at: string;
}

export async function createSession(userId: number, token: string, rememberMe: boolean = false): Promise<void> {
	// 30 days for "remember me", 7 days for regular sessions
	const days = rememberMe ? 30 : 7;
	const expiresAt = Math.floor(Date.now() / 1000) + 60 * 60 * 24 * days;
	const { error } = await supabase
		.from('sessions')
		.insert({
			user_id: userId,
			token,
			expires_at: expiresAt,
		});

	if (error) {
		throw new Error(`Failed to create session: ${error.message}`);
	}
}

export async function getSessionByToken(token: string): Promise<Session | null> {
	const now = Math.floor(Date.now() / 1000);
	const { data, error } = await supabase
		.from('sessions')
		.select('*')
		.eq('token', token)
		.gt('expires_at', now)
		.single();

	if (error || !data) {
		return null;
	}

	return data as Session;
}

export async function deleteSession(token: string): Promise<void> {
	const { error } = await supabase
		.from('sessions')
		.delete()
		.eq('token', token);

	if (error) {
		throw new Error(`Failed to delete session: ${error.message}`);
	}
}

export async function getUserFromSession(token: string) {
	const session = await getSessionByToken(token);
	if (!session) {
		return null;
	}
	return await getUserById(session.user_id);
}
