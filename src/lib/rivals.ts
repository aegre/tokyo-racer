import { supabase } from './supabase';

export interface Rival {
	id: number;
	number: string;
	level: number;
	name: string;
	unlock_requirements: string | null;
	restrictions: string | null;
	location: string;
	unlocks: string | null;
	created_at: string;
}

export interface UserRivalProgress {
	id: number;
	user_id: number;
	rival_id: number;
	completed: boolean;
	completed_at: string | null;
	created_at: string;
	updated_at: string;
}

/**
 * Get all rivals
 */
export async function getAllRivals(): Promise<Rival[]> {
	const { data, error } = await supabase
		.from('rivals')
		.select('*')
		.order('level', { ascending: true })
		.order('number', { ascending: true });

	if (error) {
		throw new Error(`Failed to fetch rivals: ${error.message}`);
	}

	return data || [];
}

/**
 * Get user's progress for all rivals
 */
export async function getUserRivalProgress(userId: number): Promise<Record<number, { completed: boolean; updated_at: string | null }>> {
	const { data, error } = await supabase
		.from('user_rival_progress')
		.select('rival_id, completed, updated_at')
		.eq('user_id', userId);

	if (error) {
		throw new Error(`Failed to fetch user progress: ${error.message}`);
	}

	// Convert to a map for easy lookup
	const progressMap: Record<number, { completed: boolean; updated_at: string | null }> = {};
	data?.forEach((item) => {
		progressMap[item.rival_id] = {
			completed: item.completed,
			updated_at: item.updated_at,
		};
	});

	return progressMap;
}

/**
 * Toggle rival completion status for a user
 */
export async function toggleRivalCompletion(
	userId: number,
	rivalId: number,
	completed: boolean
): Promise<void> {
	// First, check if a progress record exists
	const { data: existing, error: fetchError } = await supabase
		.from('user_rival_progress')
		.select('id')
		.eq('user_id', userId)
		.eq('rival_id', rivalId)
		.maybeSingle();

	if (existing && existing.id) {
		// Update existing record
		const { error } = await supabase
			.from('user_rival_progress')
			.update({
				completed,
				completed_at: completed ? new Date().toISOString() : null,
				updated_at: new Date().toISOString(),
			})
			.eq('id', existing.id);

		if (error) {
			throw new Error(`Failed to update progress: ${error.message}`);
		}
	} else {
		// Create new record
		const { error } = await supabase
			.from('user_rival_progress')
			.insert({
				user_id: userId,
				rival_id: rivalId,
				completed,
				completed_at: completed ? new Date().toISOString() : null,
			});

		if (error) {
			throw new Error(`Failed to create progress: ${error.message}`);
		}
	}
}

/**
 * Get rivals with user progress
 */
export async function getRivalsWithProgress(userId: number): Promise<
	Array<Rival & { user_completed: boolean; last_updated: string | null }>
> {
	const rivals = await getAllRivals();
	const progress = await getUserRivalProgress(userId);

	return rivals.map((rival) => {
		const progressData = progress[rival.id];
		return {
			...rival,
			user_completed: progressData?.completed || false,
			last_updated: progressData?.updated_at || null,
		};
	});
}
