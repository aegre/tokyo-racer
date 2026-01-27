-- Add mandatory cars tables (normalized structure)
-- This creates a normalized structure: cars list + user progress tracking

-- Table for the list of mandatory cars (shared across all users)
CREATE TABLE IF NOT EXISTS mandatory_cars (
	id BIGSERIAL PRIMARY KEY,
	name TEXT NOT NULL UNIQUE,
	created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table for user progress on mandatory cars
CREATE TABLE IF NOT EXISTS user_mandatory_car_progress (
	id BIGSERIAL PRIMARY KEY,
	user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
	car_id BIGINT NOT NULL REFERENCES mandatory_cars(id) ON DELETE CASCADE,
	status TEXT NOT NULL DEFAULT 'locked' CHECK (status IN ('locked', 'unlocked', 'owned')),
	created_at TIMESTAMPTZ DEFAULT NOW(),
	updated_at TIMESTAMPTZ DEFAULT NOW(),
	UNIQUE(user_id, car_id)
);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_mandatory_cars_name ON mandatory_cars(name);
CREATE INDEX IF NOT EXISTS idx_user_car_progress_user_id ON user_mandatory_car_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_user_car_progress_car_id ON user_mandatory_car_progress(car_id);
CREATE INDEX IF NOT EXISTS idx_user_car_progress_status ON user_mandatory_car_progress(status);

-- Trigger to update updated_at
CREATE TRIGGER update_user_car_progress_updated_at BEFORE UPDATE ON user_mandatory_car_progress
	FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert default mandatory cars list (only once, shared by all users)
INSERT INTO mandatory_cars (name) VALUES
	('DAIHATSU COPEN Cero (LA400K) ''15'),
	('HONDA CIVIC TYPE R (FL5) ''22'),
	('MAZDA RX-7 Type RZ (FD3S) ''00'),
	('MITSUBISHI (any car)'),
	('NISSAN 180SX TYPE X w/ SUPER HICAS (KRPS13) ''96'),
	('NISSAN FAIRLADY 240Z (HS30S) ''71'),
	('NISSAN FAIRLADY Z Version (Z33) ''05'),
	('NISSAN FAIRLADY Z Version ST (RZ34) ''24'),
	('SUZUKI ALTO WORKS (HA36S) ''15'),
	('TOYOTA bB Z X Version (NCP31) ''03'),
	('TOYOTA GR YARIS RZ (GXPA16) ''20'),
	('TOYOTA MARK X 350RDS (GRX133) ''16')
ON CONFLICT (name) DO NOTHING;
