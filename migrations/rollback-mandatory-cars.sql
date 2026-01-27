-- Rollback: Remove the old mandatory_cars table structure
-- Run this BEFORE running the new normalized migration

-- Drop the old table (this will cascade delete any user_mandatory_car_progress if it exists)
DROP TABLE IF EXISTS mandatory_cars CASCADE;

-- Also drop user_mandatory_car_progress if it exists from a previous attempt
DROP TABLE IF EXISTS user_mandatory_car_progress CASCADE;

-- Drop any indexes that might exist
DROP INDEX IF EXISTS idx_mandatory_cars_user_id;
DROP INDEX IF EXISTS idx_mandatory_cars_status;
DROP INDEX IF EXISTS idx_mandatory_cars_name;
DROP INDEX IF EXISTS idx_user_car_progress_user_id;
DROP INDEX IF EXISTS idx_user_car_progress_car_id;
DROP INDEX IF EXISTS idx_user_car_progress_status;

-- Drop any triggers
DROP TRIGGER IF EXISTS update_mandatory_cars_updated_at ON mandatory_cars;
DROP TRIGGER IF EXISTS update_user_car_progress_updated_at ON user_mandatory_car_progress;
