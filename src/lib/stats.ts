import { supabase } from './supabase';
import { getAllRivals } from './rivals';
import { getMandatoryCars } from './cars';

export interface ActivityItem {
	type: 'rival_completed' | 'rival_uncompleted' | 'car_status_change' | 'milestone';
	timestamp: string;
	title: string;
	description: string;
	icon: string;
}

export interface UserStats {
	rivals: {
		total: number;
		completed: number;
		pending: number;
		completionRate: number;
		highestLevel: number;
		byLevel: Record<number, { total: number; completed: number }>;
	};
	cars: {
		total: number;
		owned: number;
		unlocked: number;
		locked: number;
		completionRate: number;
		byBrand: Record<string, { total: number; owned: number; unlocked: number; locked: number }>;
	};
	account: {
		createdAt: string;
		emailVerified: boolean;
	};
	activity: ActivityItem[];
	milestones: {
		firstRival: boolean;
		halfwayRivals: boolean;
		allRivals: boolean;
		firstCar: boolean;
		allCars: boolean;
	};
}

/**
 * Get comprehensive user statistics
 */
export async function getUserStats(userId: number): Promise<UserStats> {
	// Get rivals data
	const rivals = await getAllRivals();
	const { data: rivalProgress, error: rivalProgressError } = await supabase
		.from('user_rival_progress')
		.select('rival_id, completed')
		.eq('user_id', userId);

	if (rivalProgressError) {
		throw new Error(`Failed to fetch rival progress: ${rivalProgressError.message}`);
	}

	const completedRivalIds = new Set(
		rivalProgress?.filter(p => p.completed).map(p => p.rival_id) || []
	);

	const rivalsCompleted = rivals.filter(r => completedRivalIds.has(r.id)).length;
	const rivalsTotal = rivals.length;
	const rivalsPending = rivalsTotal - rivalsCompleted;
	const rivalsCompletionRate = rivalsTotal > 0 ? Math.round((rivalsCompleted / rivalsTotal) * 100) : 0;

	// Find highest level completed
	const highestLevel = rivals
		.filter(r => completedRivalIds.has(r.id))
		.reduce((max, r) => Math.max(max, r.level), 0);

	// Group by level
	const byLevel: Record<number, { total: number; completed: number }> = {};
	rivals.forEach(rival => {
		if (!byLevel[rival.level]) {
			byLevel[rival.level] = { total: 0, completed: 0 };
		}
		byLevel[rival.level].total++;
		if (completedRivalIds.has(rival.id)) {
			byLevel[rival.level].completed++;
		}
	});

	// Get cars data
	const cars = await getMandatoryCars(userId);
	const carsTotal = cars.length;
	const carsOwned = cars.filter(c => c.status === 'owned').length;
	const carsUnlocked = cars.filter(c => c.status === 'unlocked').length;
	const carsLocked = cars.filter(c => c.status === 'locked').length;
	const carsCompletionRate = carsTotal > 0 ? Math.round((carsOwned / carsTotal) * 100) : 0;

	// Group cars by brand
	const byBrand: Record<string, { total: number; owned: number; unlocked: number; locked: number }> = {};
	cars.forEach(car => {
		if (!byBrand[car.brand]) {
			byBrand[car.brand] = { total: 0, owned: 0, unlocked: 0, locked: 0 };
		}
		byBrand[car.brand].total++;
		if (car.status === 'owned') byBrand[car.brand].owned++;
		else if (car.status === 'unlocked') byBrand[car.brand].unlocked++;
		else byBrand[car.brand].locked++;
	});

	// Get user account info
	const { data: user, error: userError } = await supabase
		.from('users')
		.select('created_at, email_verified')
		.eq('id', userId)
		.single();

	if (userError) {
		throw new Error(`Failed to fetch user info: ${userError.message}`);
	}

	// Get recent activity
	const activity: ActivityItem[] = [];

	// Get recent rival completions (last 10)
	const { data: recentRivalProgress, error: recentRivalError } = await supabase
		.from('user_rival_progress')
		.select('rival_id, completed, completed_at, updated_at')
		.eq('user_id', userId)
		.eq('completed', true)
		.not('completed_at', 'is', null)
		.order('completed_at', { ascending: false })
		.limit(10);

	if (!recentRivalError && recentRivalProgress) {
		for (const progress of recentRivalProgress) {
			if (progress.completed_at) {
				const rival = rivals.find(r => r.id === progress.rival_id);
				if (rival) {
					activity.push({
						type: 'rival_completed',
						timestamp: progress.completed_at,
						title: `Defeated ${rival.name}`,
						description: `Level ${rival.level} • ${rival.number}`,
						icon: '🏁',
					});
				}
			}
		}
	}

	// Get recent car status changes (last 10)
	const { data: recentCarProgress, error: recentCarError } = await supabase
		.from('user_mandatory_car_progress')
		.select('car_id, status, updated_at')
		.eq('user_id', userId)
		.in('status', ['owned', 'unlocked'])
		.order('updated_at', { ascending: false })
		.limit(10);

	if (!recentCarError && recentCarProgress) {
		for (const progress of recentCarProgress) {
			const car = cars.find(c => c.id === progress.car_id);
			if (car && progress.updated_at) {
				const statusText = progress.status === 'owned' ? 'Owned' : progress.status === 'unlocked' ? 'Unlocked' : 'Locked';
				activity.push({
					type: 'car_status_change',
					timestamp: progress.updated_at,
					title: `${car.brand} ${car.model} - ${statusText}`,
					description: car.year ? `'${car.year}` : '',
					icon: progress.status === 'owned' ? '🟢' : '🔵',
				});
			}
		}
	}

	// Get milestones from database
	const { data: milestones, error: milestonesError } = await supabase
		.from('user_milestones')
		.select('milestone_type, title, description, achieved_at, metadata')
		.eq('user_id', userId)
		.order('achieved_at', { ascending: false });

	if (!milestonesError && milestones) {
		// Map milestone types to icons
		const milestoneIcons: Record<string, string> = {
			first_rival: '🎯',
			halfway_rivals: '🎉',
			all_rivals: '🏆',
			first_car: '🚗',
			all_cars: '🏁',
		};

		for (const milestone of milestones) {
			activity.push({
				type: 'milestone',
				timestamp: milestone.achieved_at,
				title: milestone.title,
				description: milestone.description || '',
				icon: milestoneIcons[milestone.milestone_type] || '🏅',
			});
		}
	}

	// Build milestones object for API response (for backward compatibility)
	const milestonesMap: Record<string, boolean> = {};
	if (milestones) {
		milestones.forEach(m => {
			milestonesMap[m.milestone_type] = true;
		});
	}
	const milestonesObj = {
		firstRival: !!milestonesMap['first_rival'],
		halfwayRivals: !!milestonesMap['halfway_rivals'],
		allRivals: !!milestonesMap['all_rivals'],
		firstCar: !!milestonesMap['first_car'],
		allCars: !!milestonesMap['all_cars'],
	};

	// Sort activity by timestamp (most recent first)
	activity.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

	// Limit to last 15 items
	const recentActivity = activity.slice(0, 15);

	return {
		rivals: {
			total: rivalsTotal,
			completed: rivalsCompleted,
			pending: rivalsPending,
			completionRate: rivalsCompletionRate,
			highestLevel,
			byLevel,
		},
		cars: {
			total: carsTotal,
			owned: carsOwned,
			unlocked: carsUnlocked,
			locked: carsLocked,
			completionRate: carsCompletionRate,
			byBrand,
		},
		account: {
			createdAt: user.created_at,
			emailVerified: user.email_verified || false,
		},
		activity: recentActivity,
		milestones: milestonesObj,
	};
}
