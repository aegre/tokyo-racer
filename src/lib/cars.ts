import { supabase } from './supabase';

export interface MandatoryCar {
	id: number;
	name: string;
	brand: string;
	model: string;
	year: string | null;
	chassis: string | null;
	status: 'locked' | 'unlocked' | 'owned';
	created_at: string;
}

/**
 * Get all mandatory cars with user's progress
 */
export async function getMandatoryCars(userId: number): Promise<MandatoryCar[]> {
	// First, ensure all default cars have progress entries for this user
	await ensureDefaultProgressForUser(userId);

	// Get all cars
	const { data: cars, error: carsError } = await supabase
		.from('mandatory_cars')
		.select('id, name, brand, model, year, chassis, created_at')
		.order('brand, model', { ascending: true });

	if (carsError) {
		throw new Error(`Failed to fetch mandatory cars: ${carsError.message}`);
	}

	// Get user's progress for all cars
	const { data: progress, error: progressError } = await supabase
		.from('user_mandatory_car_progress')
		.select('car_id, status')
		.eq('user_id', userId);

	if (progressError) {
		throw new Error(`Failed to fetch car progress: ${progressError.message}`);
	}

	// Create a map of car_id -> status
	const progressMap = new Map<number, 'locked' | 'unlocked' | 'owned'>();
	progress?.forEach((p) => {
		progressMap.set(p.car_id, p.status);
	});

	// Combine cars with their progress status
	return (cars || []).map((car) => ({
		id: car.id,
		name: car.name,
		brand: car.brand,
		model: car.model,
		year: car.year,
		chassis: car.chassis,
		status: progressMap.get(car.id) || 'locked',
		created_at: car.created_at,
	}));
}

/**
 * Ensure all default cars have progress entries for a user
 */
async function ensureDefaultProgressForUser(userId: number): Promise<void> {
	// Get all mandatory cars
	const { data: allCars, error: carsError } = await supabase
		.from('mandatory_cars')
		.select('id');

	if (carsError) {
		throw new Error(`Failed to fetch mandatory cars: ${carsError.message}`);
	}

	if (!allCars || allCars.length === 0) {
		return;
	}

	// Get existing progress for this user
	const { data: existingProgress } = await supabase
		.from('user_mandatory_car_progress')
		.select('car_id')
		.eq('user_id', userId);

	const existingCarIds = new Set(existingProgress?.map(p => p.car_id) || []);

	// Insert missing progress entries
	const progressToInsert = allCars
		.filter(car => !existingCarIds.has(car.id))
		.map(car => ({
			user_id: userId,
			car_id: car.id,
			status: 'locked',
		}));

	if (progressToInsert.length > 0) {
		const { error } = await supabase
			.from('user_mandatory_car_progress')
			.insert(progressToInsert);

		if (error) {
			throw new Error(`Failed to create default progress: ${error.message}`);
		}
	}
}

/**
 * Update car status for a user
 */
export async function updateCarStatus(
	userId: number,
	carId: number,
	status: 'locked' | 'unlocked' | 'owned'
): Promise<void> {
	// Check if progress entry exists
	const { data: existing } = await supabase
		.from('user_mandatory_car_progress')
		.select('id')
		.eq('user_id', userId)
		.eq('car_id', carId)
		.maybeSingle();

	if (existing && existing.id) {
		// Update existing progress
		const { error } = await supabase
			.from('user_mandatory_car_progress')
			.update({
				status,
				updated_at: new Date().toISOString(),
			})
			.eq('id', existing.id);

		if (error) {
			throw new Error(`Failed to update car status: ${error.message}`);
		}
	} else {
		// Create new progress entry
		const { error } = await supabase
			.from('user_mandatory_car_progress')
			.insert({
				user_id: userId,
				car_id: carId,
				status,
			});

		if (error) {
			throw new Error(`Failed to create car status: ${error.message}`);
		}
	}
}
