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

-- Insert test user
-- Password: 'test123'
INSERT INTO users (name, surname, email, password, role) 
VALUES ('Test', 'User', 'test@test.com', crypt('test123', gen_salt('bf')), 'USER')
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

INSERT INTO trips (user_id, title, date_from, date_to, country, trip_type, tags, budget, description, image)
SELECT 
    u.id,
    'Japan Adventure',
    '2026-03-15',
    '2026-03-28', 
    'Japan',
    '["cultural", "city"]'::jsonb,
    '["Cherry Blossom", "Tokyo"]'::jsonb,
    '$4,500',
    'Experience cherry blossom season in Japan. Visit Tokyo, Kyoto, and Osaka.',
    '/public/assets/oriental.jpg'
FROM users u WHERE u.email = 'admin@admin.com'
ON CONFLICT DO NOTHING;

INSERT INTO trips (user_id, title, date_from, date_to, country, trip_type, tags, budget, description, image)
SELECT 
    u.id,
    'Iceland Road Trip',
    '2026-06-01',
    '2026-06-14', 
    'Iceland',
    '["nature", "adventure"]'::jsonb,
    '["Northern Lights", "Waterfalls"]'::jsonb,
    '$3,800',
    'Explore Iceland''s stunning landscapes, waterfalls, and geysers on an epic road trip.',
    '/public/assets/mountains.jpg'
FROM users u WHERE u.email = 'admin@admin.com'
ON CONFLICT DO NOTHING;

INSERT INTO trips (user_id, title, date_from, date_to, country, trip_type, tags, budget, description, image)
SELECT 
    u.id,
    'Greek Island Hopping',
    '2026-08-10',
    '2026-08-24', 
    'Greece',
    '["beach", "cultural"]'::jsonb,
    '["Summer", "Mediterranean"]'::jsonb,
    '$2,800',
    'Visit Santorini, Mykonos, and Crete. Enjoy beautiful beaches and ancient history.',
    '/public/assets/mountains-2.jpg'
FROM users u WHERE u.email = 'admin@admin.com'
ON CONFLICT DO NOTHING;

INSERT INTO trips (user_id, title, date_from, date_to, country, trip_type, tags, budget, description, image)
SELECT 
    u.id,
    'Swiss Alps Skiing',
    '2026-12-20',
    '2027-01-03', 
    'Switzerland',
    '["mountain", "winter"]'::jsonb,
    '["Skiing", "Winter Sports"]'::jsonb,
    '$5,200',
    'Ski in the Swiss Alps during the Christmas holidays. Stay in a luxury chalet.',
    '/public/assets/mountains.jpg'
FROM users u WHERE u.email = 'admin@admin.com'
ON CONFLICT DO NOTHING;

-- Insert sample trips for test user
INSERT INTO trips (user_id, title, date_from, date_to, country, trip_type, tags, budget, description, image)
SELECT 
    u.id,
    'Paris Weekend',
    '2026-02-14',
    '2026-02-16', 
    'France',
    '["city", "cultural"]'::jsonb,
    '["Valentine", "Romantic"]'::jsonb,
    '$1,200',
    'Romantic Valentine''s weekend in Paris. Visit the Eiffel Tower and Louvre.',
    '/public/assets/eiffel-tower.jpg'
FROM users u WHERE u.email = 'test@test.com'
ON CONFLICT DO NOTHING;

INSERT INTO trips (user_id, title, date_from, date_to, country, trip_type, tags, budget, description, image)
SELECT 
    u.id,
    'Thailand Beach Vacation',
    '2026-04-10',
    '2026-04-24', 
    'Thailand',
    '["beach", "exotic"]'::jsonb,
    '["Relaxation", "Tropical"]'::jsonb,
    '€2,100',
    'Relax on Thailand''s beautiful beaches. Visit Phuket, Krabi, and Koh Samui.',
    '/public/assets/mountains-3.jpg'
FROM users u WHERE u.email = 'test@test.com'
ON CONFLICT DO NOTHING;

INSERT INTO trips (user_id, title, date_from, date_to, country, trip_type, tags, budget, description, image)
SELECT 
    u.id,
    'New York City',
    '2026-05-01',
    '2026-05-07', 
    'USA',
    '["city", "cultural"]'::jsonb,
    '["Shopping", "Broadway"]'::jsonb,
    '$3,500',
    'Explore the Big Apple. See Times Square, Central Park, and catch a Broadway show.',
    '/public/assets/colosseum.jpg'
FROM users u WHERE u.email = 'test@test.com'
ON CONFLICT DO NOTHING;

INSERT INTO trips (user_id, title, date_from, date_to, country, trip_type, tags, budget, description, image)
SELECT 
    u.id,
    'Morocco Desert Tour',
    '2026-09-15',
    '2026-09-25', 
    'Morocco',
    '["exotic", "adventure"]'::jsonb,
    '["Desert", "Culture"]'::jsonb,
    '$1,900',
    'Experience the magic of Morocco. Visit Marrakech and camp in the Sahara Desert.',
    '/public/assets/oriental.jpg'
FROM users u WHERE u.email = 'test@test.com'
ON CONFLICT DO NOTHING;

INSERT INTO trips (user_id, title, date_from, date_to, country, trip_type, tags, budget, description, image)
SELECT 
    u.id,
    'Norway Fjords',
    '2026-07-05',
    '2026-07-15', 
    'Norway',
    '["nature", "adventure"]'::jsonb,
    '["Hiking", "Fjords"]'::jsonb,
    '$3,200',
    'Cruise through Norway''s spectacular fjords and hike in stunning landscapes.',
    '/public/assets/mountains.jpg'
FROM users u WHERE u.email = 'test@test.com'
ON CONFLICT DO NOTHING;

INSERT INTO trips (user_id, title, date_from, date_to, country, trip_type, tags, budget, description, image)
SELECT 
    u.id,
    'Spain Cultural Tour',
    '2026-10-01',
    '2026-10-12', 
    'Spain',
    '["cultural", "city"]'::jsonb,
    '["Art", "History"]'::jsonb,
    '$2,400',
    'Discover Spanish culture in Barcelona, Madrid, and Seville. Visit museums and historic sites.',
    '/public/assets/colosseum.jpg'
FROM users u WHERE u.email = 'test@test.com'
ON CONFLICT DO NOTHING;
