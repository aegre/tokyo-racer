-- Add milestones table and automatic milestone creation
-- Milestones are created automatically when certain conditions are met

-- Milestones table
CREATE TABLE IF NOT EXISTS user_milestones (
	id BIGSERIAL PRIMARY KEY,
	user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
	milestone_type TEXT NOT NULL,
	title TEXT NOT NULL,
	description TEXT,
	achieved_at TIMESTAMPTZ DEFAULT NOW(),
	metadata JSONB,
	UNIQUE(user_id, milestone_type)
);

-- Indexes for milestones
CREATE INDEX IF NOT EXISTS idx_user_milestones_user_id ON user_milestones(user_id);
CREATE INDEX IF NOT EXISTS idx_user_milestones_type ON user_milestones(milestone_type);
CREATE INDEX IF NOT EXISTS idx_user_milestones_achieved_at ON user_milestones(achieved_at);

-- Function to check and create rival milestones
CREATE OR REPLACE FUNCTION check_rival_milestones(p_user_id BIGINT)
RETURNS void AS $$
DECLARE
	v_completed_count INTEGER;
	v_total_count INTEGER;
	v_completion_rate NUMERIC;
	v_milestone_exists BOOLEAN;
BEGIN
	-- Get completion stats
	SELECT 
		COUNT(*) FILTER (WHERE completed = true),
		(SELECT COUNT(*) FROM rivals)
	INTO v_completed_count, v_total_count
	FROM user_rival_progress
	WHERE user_id = p_user_id;

	-- Calculate completion rate
	v_completion_rate := CASE 
		WHEN v_total_count > 0 THEN (v_completed_count::NUMERIC / v_total_count::NUMERIC * 100)
		ELSE 0
	END;

	-- Check for "First Rival" milestone
	IF v_completed_count >= 1 THEN
		SELECT EXISTS(SELECT 1 FROM user_milestones WHERE user_id = p_user_id AND milestone_type = 'first_rival')
		INTO v_milestone_exists;
		
		IF NOT v_milestone_exists THEN
			INSERT INTO user_milestones (user_id, milestone_type, title, description, metadata)
			VALUES (
				p_user_id,
				'first_rival',
				'First Rival Defeated',
				'You defeated your first wanderer!',
				jsonb_build_object('completed_count', v_completed_count)
			)
			ON CONFLICT (user_id, milestone_type) DO NOTHING;
		END IF;
	END IF;

	-- Check for "Halfway There" milestone (50% completion)
	IF v_completion_rate >= 50 AND v_completion_rate < 100 THEN
		SELECT EXISTS(SELECT 1 FROM user_milestones WHERE user_id = p_user_id AND milestone_type = 'halfway_rivals')
		INTO v_milestone_exists;
		
		IF NOT v_milestone_exists THEN
			INSERT INTO user_milestones (user_id, milestone_type, title, description, metadata)
			VALUES (
				p_user_id,
				'halfway_rivals',
				'Halfway There!',
				format('You''ve completed %s%% of all rivals!', ROUND(v_completion_rate)::TEXT),
				jsonb_build_object('completion_rate', v_completion_rate, 'completed_count', v_completed_count, 'total_count', v_total_count)
			)
			ON CONFLICT (user_id, milestone_type) DO NOTHING;
		END IF;
	END IF;

	-- Check for "All Rivals Defeated" milestone
	IF v_completed_count = v_total_count AND v_total_count > 0 THEN
		SELECT EXISTS(SELECT 1 FROM user_milestones WHERE user_id = p_user_id AND milestone_type = 'all_rivals')
		INTO v_milestone_exists;
		
		IF NOT v_milestone_exists THEN
			INSERT INTO user_milestones (user_id, milestone_type, title, description, metadata)
			VALUES (
				p_user_id,
				'all_rivals',
				'All Rivals Defeated!',
				'You completed every wanderer in the game!',
				jsonb_build_object('completed_count', v_completed_count, 'total_count', v_total_count)
			)
			ON CONFLICT (user_id, milestone_type) DO NOTHING;
		END IF;
	END IF;
END;
$$ LANGUAGE plpgsql;

-- Function to check and create car milestones
CREATE OR REPLACE FUNCTION check_car_milestones(p_user_id BIGINT)
RETURNS void AS $$
DECLARE
	v_owned_count INTEGER;
	v_total_count INTEGER;
	v_milestone_exists BOOLEAN;
BEGIN
	-- Get car stats
	SELECT 
		COUNT(*) FILTER (WHERE status = 'owned'),
		(SELECT COUNT(*) FROM mandatory_cars)
	INTO v_owned_count, v_total_count
	FROM user_mandatory_car_progress
	WHERE user_id = p_user_id;

	-- Check for "First Car" milestone
	IF v_owned_count >= 1 THEN
		SELECT EXISTS(SELECT 1 FROM user_milestones WHERE user_id = p_user_id AND milestone_type = 'first_car')
		INTO v_milestone_exists;
		
		IF NOT v_milestone_exists THEN
			INSERT INTO user_milestones (user_id, milestone_type, title, description, metadata)
			VALUES (
				p_user_id,
				'first_car',
				'First Car Owned',
				'You own your first mandatory car!',
				jsonb_build_object('owned_count', v_owned_count)
			)
			ON CONFLICT (user_id, milestone_type) DO NOTHING;
		END IF;
	END IF;

	-- Check for "All Cars Owned" milestone
	IF v_owned_count = v_total_count AND v_total_count > 0 THEN
		SELECT EXISTS(SELECT 1 FROM user_milestones WHERE user_id = p_user_id AND milestone_type = 'all_cars')
		INTO v_milestone_exists;
		
		IF NOT v_milestone_exists THEN
			INSERT INTO user_milestones (user_id, milestone_type, title, description, metadata)
			VALUES (
				p_user_id,
				'all_cars',
				'All Cars Owned!',
				'You own every mandatory car!',
				jsonb_build_object('owned_count', v_owned_count, 'total_count', v_total_count)
			)
			ON CONFLICT (user_id, milestone_type) DO NOTHING;
		END IF;
	END IF;
END;
$$ LANGUAGE plpgsql;

-- Trigger function to check milestones after rival progress update
CREATE OR REPLACE FUNCTION trigger_check_rival_milestones()
RETURNS TRIGGER AS $$
BEGIN
	-- Only check milestones when a rival is marked as completed
	IF NEW.completed = true THEN
		PERFORM check_rival_milestones(NEW.user_id);
	END IF;
	RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger function to check milestones after car progress update
CREATE OR REPLACE FUNCTION trigger_check_car_milestones()
RETURNS TRIGGER AS $$
BEGIN
	-- Only check milestones when a car is marked as owned
	IF NEW.status = 'owned' THEN
		PERFORM check_car_milestones(NEW.user_id);
	END IF;
	RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers
DROP TRIGGER IF EXISTS check_rival_milestones_trigger ON user_rival_progress;
CREATE TRIGGER check_rival_milestones_trigger
	AFTER INSERT OR UPDATE ON user_rival_progress
	FOR EACH ROW
	WHEN (NEW.completed = true)
	EXECUTE FUNCTION trigger_check_rival_milestones();

DROP TRIGGER IF EXISTS check_car_milestones_trigger ON user_mandatory_car_progress;
CREATE TRIGGER check_car_milestones_trigger
	AFTER INSERT OR UPDATE ON user_mandatory_car_progress
	FOR EACH ROW
	WHEN (NEW.status = 'owned')
	EXECUTE FUNCTION trigger_check_car_milestones();

-- Function to backfill milestones for existing users
-- Run this once after migration to create milestones for users who already meet the criteria
CREATE OR REPLACE FUNCTION backfill_milestones()
RETURNS void AS $$
DECLARE
	v_user RECORD;
BEGIN
	FOR v_user IN SELECT DISTINCT user_id FROM user_rival_progress
	LOOP
		PERFORM check_rival_milestones(v_user.user_id);
	END LOOP;

	FOR v_user IN SELECT DISTINCT user_id FROM user_mandatory_car_progress
	LOOP
		PERFORM check_car_milestones(v_user.user_id);
	END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Add comments
COMMENT ON TABLE user_milestones IS 'User achievements and milestones';
COMMENT ON COLUMN user_milestones.milestone_type IS 'Type of milestone: first_rival, halfway_rivals, all_rivals, first_car, all_cars';
COMMENT ON COLUMN user_milestones.metadata IS 'Additional data about the milestone (completion rates, counts, etc.)';
COMMENT ON FUNCTION backfill_milestones() IS 'Run this function once after migration to create milestones for existing users';
