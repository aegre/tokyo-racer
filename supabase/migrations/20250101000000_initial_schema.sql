-- Initial schema for Tokyo Tracker
-- Creates users, sessions, verification_tokens, and rivals tables

-- Users table
CREATE TABLE IF NOT EXISTS users (
	id BIGSERIAL PRIMARY KEY,
	email TEXT UNIQUE NOT NULL,
	username TEXT UNIQUE NOT NULL,
	password TEXT NOT NULL,
	email_verified BOOLEAN DEFAULT false,
	verification_token TEXT,
	created_at TIMESTAMPTZ DEFAULT NOW(),
	updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Email verification tokens table
CREATE TABLE IF NOT EXISTS verification_tokens (
	id BIGSERIAL PRIMARY KEY,
	user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
	token TEXT UNIQUE NOT NULL,
	expires_at BIGINT NOT NULL,
	created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Sessions table
CREATE TABLE IF NOT EXISTS sessions (
	id BIGSERIAL PRIMARY KEY,
	user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
	token TEXT UNIQUE NOT NULL,
	expires_at BIGINT NOT NULL,
	created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_verification_tokens_token ON verification_tokens(token);
CREATE INDEX IF NOT EXISTS idx_verification_tokens_user_id ON verification_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_token ON sessions(token);
CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
	NEW.updated_at = NOW();
	RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to automatically update updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
	FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Rivals/Wanderers table
CREATE TABLE IF NOT EXISTS rivals (
	id BIGSERIAL PRIMARY KEY,
	number TEXT UNIQUE NOT NULL,
	level INTEGER NOT NULL,
	name TEXT NOT NULL,
	unlock_requirements TEXT,
	restrictions TEXT,
	location TEXT NOT NULL,
	unlocks TEXT,
	created_at TIMESTAMPTZ DEFAULT NOW()
);

-- User progress tracking for rivals
CREATE TABLE IF NOT EXISTS user_rival_progress (
	id BIGSERIAL PRIMARY KEY,
	user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
	rival_id BIGINT NOT NULL REFERENCES rivals(id) ON DELETE CASCADE,
	completed BOOLEAN DEFAULT false,
	completed_at TIMESTAMPTZ,
	created_at TIMESTAMPTZ DEFAULT NOW(),
	updated_at TIMESTAMPTZ DEFAULT NOW(),
	UNIQUE(user_id, rival_id)
);

-- Indexes for rivals
CREATE INDEX IF NOT EXISTS idx_rivals_number ON rivals(number);
CREATE INDEX IF NOT EXISTS idx_rivals_level ON rivals(level);
CREATE INDEX IF NOT EXISTS idx_rivals_name ON rivals(name);
CREATE INDEX IF NOT EXISTS idx_rivals_location ON rivals(location);

-- Indexes for user progress
CREATE INDEX IF NOT EXISTS idx_user_rival_progress_user_id ON user_rival_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_user_rival_progress_rival_id ON user_rival_progress(rival_id);
CREATE INDEX IF NOT EXISTS idx_user_rival_progress_completed ON user_rival_progress(completed);

-- Trigger to update updated_at for user_rival_progress
CREATE TRIGGER update_user_rival_progress_updated_at BEFORE UPDATE ON user_rival_progress
	FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
