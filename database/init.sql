-- Create database and users table for Trip Planner application

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Create users table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    surname VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(20) DEFAULT 'USER' CHECK (role IN ('USER', 'ADMIN')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create index on email for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- Insert default admin user with properly hashed password
-- Password: 'admin' - in production use a strong password!
-- Using PostgreSQL's crypt function with blowfish algorithm
INSERT INTO users (name, surname, email, password, role) 
VALUES ('Admin', 'Admin', 'admin@admin.com', crypt('admin', gen_salt('bf')), 'ADMIN')
ON CONFLICT (email) DO NOTHING;

-- Create trips table (for future use)
CREATE TABLE IF NOT EXISTS trips (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    date_from DATE NOT NULL,
    date_to DATE NOT NULL,
    country VARCHAR(100) NOT NULL,
    trip_type JSONB, -- Array of trip types: ["exotic", "cultural"]
    tags JSONB, -- Array of tags: ["Holidays", "Trip of the month"]
    budget VARCHAR(50),
    description TEXT,
    image VARCHAR(255) DEFAULT '/public/assets/mountains.jpg',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create index on user_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_trips_user_id ON trips(user_id);

-- Insert sample trips for admin user
INSERT INTO trips (user_id, title, date_from, date_to, country, trip_type, tags, budget, description, image)
SELECT 
    u.id,
    'My Taiwan',
    '2025-07-20',
    '2025-08-11', 
    'Taiwan',
    '["exotic", "cultural"]'::jsonb,
    '["Holidays", "Trip of the month"]'::jsonb,
    '$3,000',
    'Explore the beautiful island of Taiwan with its stunning mountains, vibrant culture, and delicious cuisine.',
    '/public/assets/mountains.jpg'
FROM users u WHERE u.email = 'admin@admin.com'
ON CONFLICT DO NOTHING;
