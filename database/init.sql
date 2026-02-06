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

-- Insert test users
-- Password: 'test123'
INSERT INTO users (name, surname, email, password, role) 
VALUES 
    ('Test', 'User', 'test@test.com', crypt('test123', gen_salt('bf')), 'USER'),
    ('John', 'Smith', 'john.smith@example.com', crypt('test123', gen_salt('bf')), 'USER'),
    ('Emily', 'Johnson', 'emily.j@example.com', crypt('test123', gen_salt('bf')), 'USER'),
    ('Michael', 'Brown', 'michael.b@example.com', crypt('test123', gen_salt('bf')), 'USER')
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
    '€3,000',
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
    '€4,500',
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
    '€3,800',
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
    '€2,800',
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
    '€5,200',
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
    '€1,200',
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
    '€3,500',
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
    '€1,900',
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
    '€3,200',
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
    '€2,400',
    'Discover Spanish culture in Barcelona, Madrid, and Seville. Visit museums and historic sites.',
    '/public/assets/colosseum.jpg'
FROM users u WHERE u.email = 'test@test.com'
ON CONFLICT DO NOTHING;

-- =============================================================================
-- EXPENSE CATEGORIES TABLE
-- =============================================================================
CREATE TABLE IF NOT EXISTS expense_categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    icon VARCHAR(50),
    color VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert expense categories
INSERT INTO expense_categories (name, icon, color) VALUES
    ('Accommodation', '🏨', '#3498db'),
    ('Transportation', '🚗', '#e74c3c'),
    ('Food & Dining', '🍽️', '#2ecc71'),
    ('Activities', '🎭', '#9b59b6'),
    ('Shopping', '🛍️', '#f39c12'),
    ('Healthcare', '💊', '#e67e22'),
    ('Entertainment', '🎬', '#1abc9c'),
    ('Other', '📌', '#95a5a6')
ON CONFLICT (name) DO NOTHING;

-- =============================================================================
-- EXPENSES TABLE
-- =============================================================================
CREATE TABLE IF NOT EXISTS expenses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    trip_id UUID REFERENCES trips(id) ON DELETE CASCADE,
    category_id INTEGER REFERENCES expense_categories(id),
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    amount DECIMAL(10, 2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    description TEXT,
    expense_date DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for expenses
CREATE INDEX IF NOT EXISTS idx_expenses_trip_id ON expenses(trip_id);
CREATE INDEX IF NOT EXISTS idx_expenses_category_id ON expenses(category_id);
CREATE INDEX IF NOT EXISTS idx_expenses_user_id ON expenses(user_id);

-- =============================================================================
-- PACKING CATEGORIES TABLE
-- =============================================================================
CREATE TABLE IF NOT EXISTS packing_categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    icon VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert packing categories
INSERT INTO packing_categories (name, icon) VALUES
    ('Clothing', '👕'),
    ('Toiletries', '🧴'),
    ('Electronics', '📱'),
    ('Documents', '📄'),
    ('Medicine', '💊'),
    ('Accessories', '👜'),
    ('Sports & Recreation', '⚽'),
    ('Other', '📦')
ON CONFLICT (name) DO NOTHING;

-- =============================================================================
-- PACKING ITEMS TABLE
-- =============================================================================
CREATE TABLE IF NOT EXISTS packing_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    trip_id UUID REFERENCES trips(id) ON DELETE CASCADE,
    category_id INTEGER REFERENCES packing_categories(id),
    name VARCHAR(255) NOT NULL,
    quantity INTEGER DEFAULT 1,
    is_packed BOOLEAN DEFAULT FALSE,
    priority VARCHAR(20) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for packing items
CREATE INDEX IF NOT EXISTS idx_packing_items_trip_id ON packing_items(trip_id);
CREATE INDEX IF NOT EXISTS idx_packing_items_category_id ON packing_items(category_id);

-- =============================================================================
-- TODO ITEMS TABLE
-- =============================================================================
CREATE TABLE IF NOT EXISTS todo_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    trip_id UUID REFERENCES trips(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    due_date DATE,
    is_completed BOOLEAN DEFAULT FALSE,
    priority VARCHAR(20) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create index for todo items
CREATE INDEX IF NOT EXISTS idx_todo_items_trip_id ON todo_items(trip_id);

-- =============================================================================
-- SAMPLE DATA - EXPENSES
-- =============================================================================
-- Expenses for "My Taiwan" trip (admin)
INSERT INTO expenses (trip_id, category_id, user_id, amount, currency, description, expense_date)
SELECT 
    t.id,
    (SELECT id FROM expense_categories WHERE name = 'Accommodation'),
    u.id,
    1200.00,
    'USD',
    'Hotel in Taipei - 10 nights',
    '2025-07-20'
FROM trips t, users u 
WHERE t.title = 'My Taiwan' AND u.email = 'admin@admin.com';

INSERT INTO expenses (trip_id, category_id, user_id, amount, currency, description, expense_date)
SELECT 
    t.id,
    (SELECT id FROM expense_categories WHERE name = 'Transportation'),
    u.id,
    850.00,
    'USD',
    'Round-trip flight tickets',
    '2025-07-20'
FROM trips t, users u 
WHERE t.title = 'My Taiwan' AND u.email = 'admin@admin.com';

INSERT INTO expenses (trip_id, category_id, user_id, amount, currency, description, expense_date)
SELECT 
    t.id,
    (SELECT id FROM expense_categories WHERE name = 'Food & Dining'),
    u.id,
    450.00,
    'USD',
    'Meals and local cuisine',
    '2025-07-22'
FROM trips t, users u 
WHERE t.title = 'My Taiwan' AND u.email = 'admin@admin.com';

INSERT INTO expenses (trip_id, category_id, user_id, amount, currency, description, expense_date)
SELECT 
    t.id,
    (SELECT id FROM expense_categories WHERE name = 'Activities'),
    u.id,
    300.00,
    'USD',
    'Tours and attractions',
    '2025-07-25'
FROM trips t, users u 
WHERE t.title = 'My Taiwan' AND u.email = 'admin@admin.com';

-- Expenses for "Japan Adventure" (admin)
INSERT INTO expenses (trip_id, category_id, user_id, amount, currency, description, expense_date)
SELECT 
    t.id,
    (SELECT id FROM expense_categories WHERE name = 'Accommodation'),
    u.id,
    1800.00,
    'USD',
    'Hotels in Tokyo, Kyoto, Osaka',
    '2026-03-15'
FROM trips t, users u 
WHERE t.title = 'Japan Adventure' AND u.email = 'admin@admin.com';

INSERT INTO expenses (trip_id, category_id, user_id, amount, currency, description, expense_date)
SELECT 
    t.id,
    (SELECT id FROM expense_categories WHERE name = 'Transportation'),
    u.id,
    1200.00,
    'USD',
    'Flights and JR Pass',
    '2026-03-15'
FROM trips t, users u 
WHERE t.title = 'Japan Adventure' AND u.email = 'admin@admin.com';

INSERT INTO expenses (trip_id, category_id, user_id, amount, currency, description, expense_date)
SELECT 
    t.id,
    (SELECT id FROM expense_categories WHERE name = 'Food & Dining'),
    u.id,
    650.00,
    'USD',
    'Sushi, ramen, and dining',
    '2026-03-18'
FROM trips t, users u 
WHERE t.title = 'Japan Adventure' AND u.email = 'admin@admin.com';

-- Expenses for "Paris Weekend" (test user)
INSERT INTO expenses (trip_id, category_id, user_id, amount, currency, description, expense_date)
SELECT 
    t.id,
    (SELECT id FROM expense_categories WHERE name = 'Accommodation'),
    u.id,
    450.00,
    'USD',
    'Romantic hotel near Eiffel Tower',
    '2026-02-14'
FROM trips t, users u 
WHERE t.title = 'Paris Weekend' AND u.email = 'test@test.com';

INSERT INTO expenses (trip_id, category_id, user_id, amount, currency, description, expense_date)
SELECT 
    t.id,
    (SELECT id FROM expense_categories WHERE name = 'Food & Dining'),
    u.id,
    250.00,
    'USD',
    'Fine dining restaurants',
    '2026-02-14'
FROM trips t, users u 
WHERE t.title = 'Paris Weekend' AND u.email = 'test@test.com';

INSERT INTO expenses (trip_id, category_id, user_id, amount, currency, description, expense_date)
SELECT 
    t.id,
    (SELECT id FROM expense_categories WHERE name = 'Entertainment'),
    u.id,
    120.00,
    'USD',
    'Louvre and Eiffel Tower tickets',
    '2026-02-15'
FROM trips t, users u 
WHERE t.title = 'Paris Weekend' AND u.email = 'test@test.com';

-- Expenses for "Thailand Beach Vacation" (test user)
INSERT INTO expenses (trip_id, category_id, user_id, amount, currency, description, expense_date)
SELECT 
    t.id,
    (SELECT id FROM expense_categories WHERE name = 'Accommodation'),
    u.id,
    850.00,
    'EUR',
    'Beach resort in Phuket',
    '2026-04-10'
FROM trips t, users u 
WHERE t.title = 'Thailand Beach Vacation' AND u.email = 'test@test.com';

INSERT INTO expenses (trip_id, category_id, user_id, amount, currency, description, expense_date)
SELECT 
    t.id,
    (SELECT id FROM expense_categories WHERE name = 'Activities'),
    u.id,
    400.00,
    'EUR',
    'Diving and island tours',
    '2026-04-12'
FROM trips t, users u 
WHERE t.title = 'Thailand Beach Vacation' AND u.email = 'test@test.com';

-- =============================================================================
-- SAMPLE DATA - PACKING ITEMS
-- =============================================================================
-- Packing for "My Taiwan" trip
INSERT INTO packing_items (trip_id, category_id, name, quantity, is_packed, priority)
SELECT 
    t.id,
    (SELECT id FROM packing_categories WHERE name = 'Documents'),
    'Passport',
    1,
    TRUE,
    'high'
FROM trips t WHERE t.title = 'My Taiwan';

INSERT INTO packing_items (trip_id, category_id, name, quantity, is_packed, priority)
SELECT 
    t.id,
    (SELECT id FROM packing_categories WHERE name = 'Documents'),
    'Travel insurance papers',
    1,
    FALSE,
    'high'
FROM trips t WHERE t.title = 'My Taiwan';

INSERT INTO packing_items (trip_id, category_id, name, quantity, is_packed, priority)
SELECT 
    t.id,
    (SELECT id FROM packing_categories WHERE name = 'Clothing'),
    'T-shirts',
    7,
    TRUE,
    'medium'
FROM trips t WHERE t.title = 'My Taiwan';

INSERT INTO packing_items (trip_id, category_id, name, quantity, is_packed, priority)
SELECT 
    t.id,
    (SELECT id FROM packing_categories WHERE name = 'Clothing'),
    'Shorts',
    3,
    FALSE,
    'medium'
FROM trips t WHERE t.title = 'My Taiwan';

INSERT INTO packing_items (trip_id, category_id, name, quantity, is_packed, priority)
SELECT 
    t.id,
    (SELECT id FROM packing_categories WHERE name = 'Electronics'),
    'Phone charger',
    1,
    FALSE,
    'high'
FROM trips t WHERE t.title = 'My Taiwan';

INSERT INTO packing_items (trip_id, category_id, name, quantity, is_packed, priority)
SELECT 
    t.id,
    (SELECT id FROM packing_categories WHERE name = 'Toiletries'),
    'Toothbrush and toothpaste',
    1,
    TRUE,
    'high'
FROM trips t WHERE t.title = 'My Taiwan';

-- Packing for "Japan Adventure"
INSERT INTO packing_items (trip_id, category_id, name, quantity, is_packed, priority)
SELECT 
    t.id,
    (SELECT id FROM packing_categories WHERE name = 'Documents'),
    'Passport and visa',
    1,
    FALSE,
    'high'
FROM trips t WHERE t.title = 'Japan Adventure';

INSERT INTO packing_items (trip_id, category_id, name, quantity, is_packed, priority)
SELECT 
    t.id,
    (SELECT id FROM packing_categories WHERE name = 'Clothing'),
    'Winter jacket',
    1,
    FALSE,
    'high'
FROM trips t WHERE t.title = 'Japan Adventure';

INSERT INTO packing_items (trip_id, category_id, name, quantity, is_packed, priority)
SELECT 
    t.id,
    (SELECT id FROM packing_categories WHERE name = 'Electronics'),
    'Camera',
    1,
    FALSE,
    'medium'
FROM trips t WHERE t.title = 'Japan Adventure';

INSERT INTO packing_items (trip_id, category_id, name, quantity, is_packed, priority)
SELECT 
    t.id,
    (SELECT id FROM packing_categories WHERE name = 'Accessories'),
    'Backpack',
    1,
    FALSE,
    'medium'
FROM trips t WHERE t.title = 'Japan Adventure';

-- Packing for "Paris Weekend"
INSERT INTO packing_items (trip_id, category_id, name, quantity, is_packed, priority)
SELECT 
    t.id,
    (SELECT id FROM packing_categories WHERE name = 'Clothing'),
    'Elegant dress',
    1,
    TRUE,
    'high'
FROM trips t WHERE t.title = 'Paris Weekend';

INSERT INTO packing_items (trip_id, category_id, name, quantity, is_packed, priority)
SELECT 
    t.id,
    (SELECT id FROM packing_categories WHERE name = 'Clothing'),
    'Comfortable shoes',
    1,
    TRUE,
    'medium'
FROM trips t WHERE t.title = 'Paris Weekend';

INSERT INTO packing_items (trip_id, category_id, name, quantity, is_packed, priority)
SELECT 
    t.id,
    (SELECT id FROM packing_categories WHERE name = 'Electronics'),
    'Phone and charger',
    1,
    FALSE,
    'high'
FROM trips t WHERE t.title = 'Paris Weekend';

-- Packing for "Thailand Beach Vacation"
INSERT INTO packing_items (trip_id, category_id, name, quantity, is_packed, priority)
SELECT 
    t.id,
    (SELECT id FROM packing_categories WHERE name = 'Clothing'),
    'Swimsuits',
    3,
    FALSE,
    'high'
FROM trips t WHERE t.title = 'Thailand Beach Vacation';

INSERT INTO packing_items (trip_id, category_id, name, quantity, is_packed, priority)
SELECT 
    t.id,
    (SELECT id FROM packing_categories WHERE name = 'Toiletries'),
    'Sunscreen SPF 50',
    2,
    FALSE,
    'high'
FROM trips t WHERE t.title = 'Thailand Beach Vacation';

INSERT INTO packing_items (trip_id, category_id, name, quantity, is_packed, priority)
SELECT 
    t.id,
    (SELECT id FROM packing_categories WHERE name = 'Accessories'),
    'Beach towel',
    1,
    FALSE,
    'medium'
FROM trips t WHERE t.title = 'Thailand Beach Vacation';

INSERT INTO packing_items (trip_id, category_id, name, quantity, is_packed, priority)
SELECT 
    t.id,
    (SELECT id FROM packing_categories WHERE name = 'Sports & Recreation'),
    'Snorkeling gear',
    1,
    FALSE,
    'low'
FROM trips t WHERE t.title = 'Thailand Beach Vacation';

-- =============================================================================
-- SAMPLE DATA - TODO ITEMS
-- =============================================================================
-- Todo items for "My Taiwan"
INSERT INTO todo_items (trip_id, title, description, due_date, is_completed, priority)
SELECT 
    t.id,
    'Book hotel in Taipei',
    'Reserve accommodation near city center',
    '2025-06-20',
    TRUE,
    'high'
FROM trips t WHERE t.title = 'My Taiwan';

INSERT INTO todo_items (trip_id, title, description, due_date, is_completed, priority)
SELECT 
    t.id,
    'Apply for visa',
    'Check visa requirements and apply if needed',
    '2025-06-15',
    TRUE,
    'high'
FROM trips t WHERE t.title = 'My Taiwan';

INSERT INTO todo_items (trip_id, title, description, due_date, is_completed, priority)
SELECT 
    t.id,
    'Buy travel insurance',
    'Get comprehensive travel insurance coverage',
    '2025-07-01',
    FALSE,
    'high'
FROM trips t WHERE t.title = 'My Taiwan';

INSERT INTO todo_items (trip_id, title, description, due_date, is_completed, priority)
SELECT 
    t.id,
    'Research local restaurants',
    'Find best night markets and local food spots',
    '2025-07-10',
    FALSE,
    'medium'
FROM trips t WHERE t.title = 'My Taiwan';

-- Todo items for "Japan Adventure"
INSERT INTO todo_items (trip_id, title, description, due_date, is_completed, priority)
SELECT 
    t.id,
    'Purchase JR Rail Pass',
    'Buy Japan Rail Pass before departure',
    '2026-02-15',
    FALSE,
    'high'
FROM trips t WHERE t.title = 'Japan Adventure';

INSERT INTO todo_items (trip_id, title, description, due_date, is_completed, priority)
SELECT 
    t.id,
    'Book cherry blossom viewing tour',
    'Reserve spots for hanami viewing',
    '2026-02-20',
    FALSE,
    'high'
FROM trips t WHERE t.title = 'Japan Adventure';

INSERT INTO todo_items (trip_id, title, description, due_date, is_completed, priority)
SELECT 
    t.id,
    'Learn basic Japanese phrases',
    'Practice common phrases and greetings',
    '2026-03-01',
    FALSE,
    'medium'
FROM trips t WHERE t.title = 'Japan Adventure';

-- Todo items for "Paris Weekend"
INSERT INTO todo_items (trip_id, title, description, due_date, is_completed, priority)
SELECT 
    t.id,
    'Book restaurant for Valentine dinner',
    'Reserve table at romantic restaurant',
    '2026-01-20',
    TRUE,
    'high'
FROM trips t WHERE t.title = 'Paris Weekend';

INSERT INTO todo_items (trip_id, title, description, due_date, is_completed, priority)
SELECT 
    t.id,
    'Buy museum tickets online',
    'Pre-purchase Louvre tickets to skip queue',
    '2026-02-01',
    FALSE,
    'medium'
FROM trips t WHERE t.title = 'Paris Weekend';

-- Todo items for "Thailand Beach Vacation"
INSERT INTO todo_items (trip_id, title, description, due_date, is_completed, priority)
SELECT 
    t.id,
    'Get vaccinations',
    'Check required vaccinations for Thailand',
    '2026-03-10',
    FALSE,
    'high'
FROM trips t WHERE t.title = 'Thailand Beach Vacation';

INSERT INTO todo_items (trip_id, title, description, due_date, is_completed, priority)
SELECT 
    t.id,
    'Book diving excursion',
    'Reserve spots for scuba diving tour',
    '2026-03-20',
    FALSE,
    'medium'
FROM trips t WHERE t.title = 'Thailand Beach Vacation';

INSERT INTO todo_items (trip_id, title, description, due_date, is_completed, priority)
SELECT 
    t.id,
    'Exchange currency',
    'Get Thai Baht before departure',
    '2026-04-05',
    FALSE,
    'low'
FROM trips t WHERE t.title = 'Thailand Beach Vacation';

-- =============================================================================
-- ADDITIONAL TRIPS FOR john.smith@example.com
-- =============================================================================
INSERT INTO trips (user_id, title, date_from, date_to, country, trip_type, tags, budget, description, image)
SELECT 
    u.id,
    'Barcelona Beach Escape',
    '2026-06-20',
    '2026-06-28', 
    'Spain',
    '["beach", "city"]'::jsonb,
    '["Summer", "Architecture"]'::jsonb,
    '€1,800',
    'Enjoy Barcelona beaches and Gaudí architecture.',
    '/public/assets/mountains-2.jpg'
FROM users u WHERE u.email = 'john.smith@example.com'
ON CONFLICT DO NOTHING;

INSERT INTO trips (user_id, title, date_from, date_to, country, trip_type, tags, budget, description, image)
SELECT 
    u.id,
    'Amsterdam Canal Tour',
    '2026-09-10',
    '2026-09-15', 
    'Netherlands',
    '["city", "cultural"]'::jsonb,
    '["Museums", "Cycling"]'::jsonb,
    '€1,400',
    'Explore Amsterdam canals, museums, and cycling culture.',
    '/public/assets/mountains-3.jpg'
FROM users u WHERE u.email = 'john.smith@example.com'
ON CONFLICT DO NOTHING;

INSERT INTO trips (user_id, title, date_from, date_to, country, trip_type, tags, budget, description, image)
SELECT 
    u.id,
    'Vienna Music Festival',
    '2026-10-20',
    '2026-10-25', 
    'Austria',
    '["city", "cultural"]'::jsonb,
    '["Music", "Classical"]'::jsonb,
    '€2,200',
    'Attend classical music concerts in Vienna.',
    '/public/assets/colosseum.jpg'
FROM users u WHERE u.email = 'john.smith@example.com'
ON CONFLICT DO NOTHING;

-- =============================================================================
-- ADDITIONAL TRIPS FOR emily.j@example.com
-- =============================================================================
INSERT INTO trips (user_id, title, date_from, date_to, country, trip_type, tags, budget, description, image)
SELECT 
    u.id,
    'Dubai Shopping Festival',
    '2027-01-10',
    '2027-01-18', 
    'UAE',
    '["city", "exotic"]'::jsonb,
    '["Shopping", "Luxury"]'::jsonb,
    '€4,500',
    'Experience Dubai luxury shopping and modern architecture.',
    '/public/assets/oriental.jpg'
FROM users u WHERE u.email = 'emily.j@example.com'
ON CONFLICT DO NOTHING;

INSERT INTO trips (user_id, title, date_from, date_to, country, trip_type, tags, budget, description, image)
SELECT 
    u.id,
    'Bali Yoga Retreat',
    '2026-08-01',
    '2026-08-14', 
    'Indonesia',
    '["beach", "wellness"]'::jsonb,
    '["Yoga", "Relaxation"]'::jsonb,
    '€2,800',
    'Wellness retreat in Ubud with daily yoga sessions.',
    '/public/assets/mountains.jpg'
FROM users u WHERE u.email = 'emily.j@example.com'
ON CONFLICT DO NOTHING;

INSERT INTO trips (user_id, title, date_from, date_to, country, trip_type, tags, budget, description, image)
SELECT 
    u.id,
    'Scottish Highlands',
    '2026-07-12',
    '2026-07-20', 
    'Scotland',
    '["nature", "adventure"]'::jsonb,
    '["Hiking", "Castles"]'::jsonb,
    '€2,100',
    'Hike through Scottish Highlands and visit historic castles.',
    '/public/assets/mountains.jpg'
FROM users u WHERE u.email = 'emily.j@example.com'
ON CONFLICT DO NOTHING;

-- =============================================================================
-- ADDITIONAL TRIPS FOR michael.b@example.com
-- =============================================================================
INSERT INTO trips (user_id, title, date_from, date_to, country, trip_type, tags, budget, description, image)
SELECT 
    u.id,
    'Prague Christmas Markets',
    '2026-12-10',
    '2026-12-17', 
    'Czech Republic',
    '["city", "cultural"]'::jsonb,
    '["Christmas", "Markets"]'::jsonb,
    '€1,300',
    'Visit Prague beautiful Christmas markets.',
    '/public/assets/mountains-3.jpg'
FROM users u WHERE u.email = 'michael.b@example.com'
ON CONFLICT DO NOTHING;

INSERT INTO trips (user_id, title, date_from, date_to, country, trip_type, tags, budget, description, image)
SELECT 
    u.id,
    'Portugal Wine Tour',
    '2026-05-15',
    '2026-05-22', 
    'Portugal',
    '["cultural", "food"]'::jsonb,
    '["Wine", "Douro Valley"]'::jsonb,
    '€1,900',
    'Wine tasting tour through Douro Valley.',
    '/public/assets/mountains-2.jpg'
FROM users u WHERE u.email = 'michael.b@example.com'
ON CONFLICT DO NOTHING;

INSERT INTO trips (user_id, title, date_from, date_to, country, trip_type, tags, budget, description, image)
SELECT 
    u.id,
    'Croatian Coast',
    '2026-07-25',
    '2026-08-05', 
    'Croatia',
    '["beach", "cultural"]'::jsonb,
    '["Adriatic", "Islands"]'::jsonb,
    '€2,400',
    'Sail along Croatian coast visiting Dubrovnik and Split.',
    '/public/assets/mountains-2.jpg'
FROM users u WHERE u.email = 'michael.b@example.com'
ON CONFLICT DO NOTHING;

-- =============================================================================
-- ADDITIONAL TRIPS FOR admin@admin.com
-- =============================================================================
INSERT INTO trips (user_id, title, date_from, date_to, country, trip_type, tags, budget, description, image)
SELECT 
    u.id,
    'Kenya Safari',
    '2026-11-01',
    '2026-11-14', 
    'Kenya',
    '["nature", "adventure"]'::jsonb,
    '["Safari", "Wildlife"]'::jsonb,
    '€5,800',
    'Wildlife safari in Masai Mara and Amboseli.',
    '/public/assets/mountains.jpg'
FROM users u WHERE u.email = 'admin@admin.com'
ON CONFLICT DO NOTHING;

INSERT INTO trips (user_id, title, date_from, date_to, country, trip_type, tags, budget, description, image)
SELECT 
    u.id,
    'Peru Machu Picchu',
    '2026-09-20',
    '2026-10-03', 
    'Peru',
    '["cultural", "adventure"]'::jsonb,
    '["Inca Trail", "History"]'::jsonb,
    '€3,600',
    'Trek the Inca Trail to Machu Picchu.',
    '/public/assets/mountains.jpg'
FROM users u WHERE u.email = 'admin@admin.com'
ON CONFLICT DO NOTHING;

INSERT INTO trips (user_id, title, date_from, date_to, country, trip_type, tags, budget, description, image)
SELECT 
    u.id,
    'Canadian Rockies',
    '2026-08-10',
    '2026-08-22', 
    'Canada',
    '["nature", "adventure"]'::jsonb,
    '["Mountains", "Lakes"]'::jsonb,
    '€4,200',
    'Explore Banff and Jasper National Parks.',
    '/public/assets/mountains.jpg'
FROM users u WHERE u.email = 'admin@admin.com'
ON CONFLICT DO NOTHING;

-- =============================================================================
-- ADDITIONAL EXPENSES FOR ALL TRIPS
-- =============================================================================
-- Expenses for Iceland Road Trip
INSERT INTO expenses (trip_id, category_id, amount, currency, expense_date, description)
SELECT t.id, ec.id, 850.00, 'EUR', '2026-06-02', 'Hotel booking for 7 nights'
FROM trips t, expense_categories ec 
WHERE t.title = 'Iceland Road Trip' AND ec.name = 'Accommodation';

INSERT INTO expenses (trip_id, category_id, amount, currency, expense_date, description)
SELECT t.id, ec.id, 420.00, 'EUR', '2026-06-01', 'Car rental for 14 days'
FROM trips t, expense_categories ec 
WHERE t.title = 'Iceland Road Trip' AND ec.name = 'Transportation';

INSERT INTO expenses (trip_id, category_id, amount, currency, expense_date, description)
SELECT t.id, ec.id, 180.00, 'EUR', '2026-06-08', 'Restaurant meals'
FROM trips t, expense_categories ec 
WHERE t.title = 'Iceland Road Trip' AND ec.name = 'Food & Dining';

-- Expenses for Greek Island Hopping
INSERT INTO expenses (trip_id, category_id, amount, currency, expense_date, description)
SELECT t.id, ec.id, 650.00, 'EUR', '2026-08-11', 'Hotel Santorini 5 nights'
FROM trips t, expense_categories ec 
WHERE t.title = 'Greek Island Hopping' AND ec.name = 'Accommodation';

INSERT INTO expenses (trip_id, category_id, amount, currency, expense_date, description)
SELECT t.id, ec.id, 230.00, 'EUR', '2026-08-12', 'Ferry tickets between islands'
FROM trips t, expense_categories ec 
WHERE t.title = 'Greek Island Hopping' AND ec.name = 'Transportation';

INSERT INTO expenses (trip_id, category_id, amount, currency, expense_date, description)
SELECT t.id, ec.id, 120.00, 'EUR', '2026-08-15', 'Beach activities'
FROM trips t, expense_categories ec 
WHERE t.title = 'Greek Island Hopping' AND ec.name = 'Activities';

-- Expenses for Swiss Alps Skiing
INSERT INTO expenses (trip_id, category_id, amount, currency, expense_date, description)
SELECT t.id, ec.id, 1800.00, 'EUR', '2026-12-20', 'Chalet rental'
FROM trips t, expense_categories ec 
WHERE t.title = 'Swiss Alps Skiing' AND ec.name = 'Accommodation';

INSERT INTO expenses (trip_id, category_id, amount, currency, expense_date, description)
SELECT t.id, ec.id, 350.00, 'EUR', '2026-12-21', 'Ski pass 14 days'
FROM trips t, expense_categories ec 
WHERE t.title = 'Swiss Alps Skiing' AND ec.name = 'Activities';

INSERT INTO expenses (trip_id, category_id, amount, currency, expense_date, description)
SELECT t.id, ec.id, 180.00, 'EUR', '2026-12-22', 'Ski equipment rental'
FROM trips t, expense_categories ec 
WHERE t.title = 'Swiss Alps Skiing' AND ec.name = 'Activities';

-- Expenses for New York City  
INSERT INTO expenses (trip_id, category_id, amount, currency, expense_date, description)
SELECT t.id, ec.id, 980.00, 'USD', '2026-05-01', 'Manhattan hotel 6 nights'
FROM trips t, expense_categories ec 
WHERE t.title = 'New York City' AND ec.name = 'Accommodation';

INSERT INTO expenses (trip_id, category_id, amount, currency, expense_date, description)
SELECT t.id, ec.id, 280.00, 'USD', '2026-05-03', 'Broadway show tickets'
FROM trips t, expense_categories ec 
WHERE t.title = 'New York City' AND ec.name = 'Entertainment';

INSERT INTO expenses (trip_id, category_id, amount, currency, expense_date, description)
SELECT t.id, ec.id, 420.00, 'USD', '2026-05-02', 'Shopping Fifth Avenue'
FROM trips t, expense_categories ec 
WHERE t.title = 'New York City' AND ec.name = 'Shopping';

-- Expenses for Morocco Desert Tour
INSERT INTO expenses (trip_id, category_id, amount, currency, expense_date, description)
SELECT t.id, ec.id, 380.00, 'EUR', '2026-09-16', 'Riad Marrakech 4 nights'
FROM trips t, expense_categories ec 
WHERE t.title = 'Morocco Desert Tour' AND ec.name = 'Accommodation';

INSERT INTO expenses (trip_id, category_id, amount, currency, expense_date, description)
SELECT t.id, ec.id, 450.00, 'EUR', '2026-09-18', 'Desert tour 3 days'
FROM trips t, expense_categories ec 
WHERE t.title = 'Morocco Desert Tour' AND ec.name = 'Activities';

-- Expenses for Norway Fjords
INSERT INTO expenses (trip_id, category_id, amount, currency, expense_date, description)
SELECT t.id, ec.id, 1200.00, 'EUR', '2026-07-06', 'Fjord cruise 7 days'
FROM trips t, expense_categories ec 
WHERE t.title = 'Norway Fjords' AND ec.name = 'Transportation';

INSERT INTO expenses (trip_id, category_id, amount, currency, expense_date, description)
SELECT t.id, ec.id, 180.00, 'EUR', '2026-07-10', 'Guided hiking tour'
FROM trips t, expense_categories ec 
WHERE t.title = 'Norway Fjords' AND ec.name = 'Activities';

-- Expenses for Spain Cultural Tour
INSERT INTO expenses (trip_id, category_id, amount, currency, expense_date, description)
SELECT t.id, ec.id, 680.00, 'EUR', '2026-10-02', 'Hotels in 3 cities'
FROM trips t, expense_categories ec 
WHERE t.title = 'Spain Cultural Tour' AND ec.name = 'Accommodation';

INSERT INTO expenses (trip_id, category_id, amount, currency, expense_date, description)
SELECT t.id, ec.id, 220.00, 'EUR', '2026-10-03', 'Museum tickets and tours'
FROM trips t, expense_categories ec 
WHERE t.title = 'Spain Cultural Tour' AND ec.name = 'Activities';

-- =============================================================================
-- ADDITIONAL PACKING ITEMS FOR ALL TRIPS
-- =============================================================================
-- Packing for Iceland Road Trip
INSERT INTO packing_items (trip_id, category_id, name, quantity, is_packed, priority)
SELECT t.id, pc.id, 'Waterproof jacket', 1, FALSE, 'high'
FROM trips t, packing_categories pc 
WHERE t.title = 'Iceland Road Trip' AND pc.name = 'Clothing';

INSERT INTO packing_items (trip_id, category_id, name, quantity, is_packed, priority)
SELECT t.id, pc.id, 'Hiking boots', 1, FALSE, 'high'
FROM trips t, packing_categories pc 
WHERE t.title = 'Iceland Road Trip' AND pc.name = 'Clothing';

INSERT INTO packing_items (trip_id, category_id, name, quantity, is_packed, priority)
SELECT t.id, pc.id, 'Camera with extra batteries', 1, FALSE, 'medium'
FROM trips t, packing_categories pc 
WHERE t.title = 'Iceland Road Trip' AND pc.name = 'Electronics';

-- Packing for Greek Island Hopping
INSERT INTO packing_items (trip_id, category_id, name, quantity, is_packed, priority)
SELECT t.id, pc.id, 'Beach towel', 2, FALSE, 'high'
FROM trips t, packing_categories pc 
WHERE t.title = 'Greek Island Hopping' AND pc.name = 'Sports & Recreation';

INSERT INTO packing_items (trip_id, category_id, name, quantity, is_packed, priority)
SELECT t.id, pc.id, 'Swimsuit', 2, TRUE, 'high'
FROM trips t, packing_categories pc 
WHERE t.title = 'Greek Island Hopping' AND pc.name = 'Sports & Recreation';

INSERT INTO packing_items (trip_id, category_id, name, quantity, is_packed, priority)
SELECT t.id, pc.id, 'Sun hat', 1, FALSE, 'medium'
FROM trips t, packing_categories pc 
WHERE t.title = 'Greek Island Hopping' AND pc.name = 'Accessories';

-- Packing for Swiss Alps Skiing
INSERT INTO packing_items (trip_id, category_id, name, quantity, is_packed, priority)
SELECT t.id, pc.id, 'Ski jacket', 1, FALSE, 'high'
FROM trips t, packing_categories pc 
WHERE t.title = 'Swiss Alps Skiing' AND pc.name = 'Clothing';

INSERT INTO packing_items (trip_id, category_id, name, quantity, is_packed, priority)
SELECT t.id, pc.id, 'Ski pants', 1, FALSE, 'high'
FROM trips t, packing_categories pc 
WHERE t.title = 'Swiss Alps Skiing' AND pc.name = 'Clothing';

INSERT INTO packing_items (trip_id, category_id, name, quantity, is_packed, priority)
SELECT t.id, pc.id, 'Thermal underwear', 3, FALSE, 'high'
FROM trips t, packing_categories pc 
WHERE t.title = 'Swiss Alps Skiing' AND pc.name = 'Clothing';

INSERT INTO packing_items (trip_id, category_id, name, quantity, is_packed, priority)
SELECT t.id, pc.id, 'Ski goggles', 1, FALSE, 'high'
FROM trips t, packing_categories pc 
WHERE t.title = 'Swiss Alps Skiing' AND pc.name = 'Sports & Recreation';

-- Packing for New York City
INSERT INTO packing_items (trip_id, category_id, name, quantity, is_packed, priority)
SELECT t.id, pc.id, 'Comfortable walking shoes', 1, TRUE, 'high'
FROM trips t, packing_categories pc 
WHERE t.title = 'New York City' AND pc.name = 'Clothing';

INSERT INTO packing_items (trip_id, category_id, name, quantity, is_packed, priority)
SELECT t.id, pc.id, 'Formal outfit for Broadway', 1, FALSE, 'medium'
FROM trips t, packing_categories pc 
WHERE t.title = 'New York City' AND pc.name = 'Clothing';

INSERT INTO packing_items (trip_id, category_id, name, quantity, is_packed, priority)
SELECT t.id, pc.id, 'City map', 1, FALSE, 'low'
FROM trips t, packing_categories pc 
WHERE t.title = 'New York City' AND pc.name = 'Documents';

-- Packing for Morocco Desert Tour
INSERT INTO packing_items (trip_id, category_id, name, quantity, is_packed, priority)
SELECT t.id, pc.id, 'Light scarf', 2, FALSE, 'high'
FROM trips t, packing_categories pc 
WHERE t.title = 'Morocco Desert Tour' AND pc.name = 'Accessories';

INSERT INTO packing_items (trip_id, category_id, name, quantity, is_packed, priority)
SELECT t.id, pc.id, 'Desert boots', 1, FALSE, 'high'
FROM trips t, packing_categories pc 
WHERE t.title = 'Morocco Desert Tour' AND pc.name = 'Clothing';

INSERT INTO packing_items (trip_id, category_id, name, quantity, is_packed, priority)
SELECT t.id, pc.id, 'Hand sanitizer', 1, TRUE, 'medium'
FROM trips t, packing_categories pc 
WHERE t.title = 'Morocco Desert Tour' AND pc.name = 'Toiletries';

-- Packing for Norway Fjords
INSERT INTO packing_items (trip_id, category_id, name, quantity, is_packed, priority)
SELECT t.id, pc.id, 'Rain jacket', 1, FALSE, 'high'
FROM trips t, packing_categories pc 
WHERE t.title = 'Norway Fjords' AND pc.name = 'Clothing';

INSERT INTO packing_items (trip_id, category_id, name, quantity, is_packed, priority)
SELECT t.id, pc.id, 'Binoculars', 1, FALSE, 'medium'
FROM trips t, packing_categories pc 
WHERE t.title = 'Norway Fjords' AND pc.name = 'Electronics';

-- Packing for Spain Cultural Tour
INSERT INTO packing_items (trip_id, category_id, name, quantity, is_packed, priority)
SELECT t.id, pc.id, 'Museum guide book', 1, FALSE, 'low'
FROM trips t, packing_categories pc 
WHERE t.title = 'Spain Cultural Tour' AND pc.name = 'Documents';

INSERT INTO packing_items (trip_id, category_id, name, quantity, is_packed, priority)
SELECT t.id, pc.id, 'Lightweight backpack', 1, TRUE, 'medium'
FROM trips t, packing_categories pc 
WHERE t.title = 'Spain Cultural Tour' AND pc.name = 'Accessories';

-- =============================================================================
-- ADDITIONAL TODO ITEMS FOR ALL TRIPS
-- =============================================================================
-- Todos for Iceland Road Trip
INSERT INTO todo_items (trip_id, title, description, due_date, is_completed, priority)
SELECT t.id, 'Book Blue Lagoon tickets', 'Reserve entry time in advance', '2026-05-20', FALSE, 'high'
FROM trips t WHERE t.title = 'Iceland Road Trip';

INSERT INTO todo_items (trip_id, title, description, due_date, is_completed, priority)
SELECT t.id, 'Plan ring road route', 'Map out stops and accommodations', '2026-05-15', TRUE, 'high'
FROM trips t WHERE t.title = 'Iceland Road Trip';

INSERT INTO todo_items (trip_id, title, description, due_date, is_completed, priority)
SELECT t.id, 'Download offline maps', 'Get Iceland GPS maps', '2026-05-28', FALSE, 'medium'
FROM trips t WHERE t.title = 'Iceland Road Trip';

-- Todos for Greek Island Hopping
INSERT INTO todo_items (trip_id, title, description, due_date, is_completed, priority)
SELECT t.id, 'Book ferry tickets', 'Reserve seats for island hopping', '2026-07-20', FALSE, 'high'
FROM trips t WHERE t.title = 'Greek Island Hopping';

INSERT INTO todo_items (trip_id, title, description, due_date, is_completed, priority)
SELECT t.id, 'Research best beaches', 'Find top beaches on each island', '2026-08-01', FALSE, 'medium'
FROM trips t WHERE t.title = 'Greek Island Hopping';

-- Todos for Swiss Alps Skiing
INSERT INTO todo_items (trip_id, title, description, due_date, is_completed, priority)
SELECT t.id, 'Rent ski equipment', 'Book skis and boots in advance', '2026-12-01', FALSE, 'high'
FROM trips t WHERE t.title = 'Swiss Alps Skiing';

INSERT INTO todo_items (trip_id, title, description, due_date, is_completed, priority)
SELECT t.id, 'Check avalanche warnings', 'Monitor snow conditions', '2026-12-15', FALSE, 'high'
FROM trips t WHERE t.title = 'Swiss Alps Skiing';

INSERT INTO todo_items (trip_id, title, description, due_date, is_completed, priority)
SELECT t.id, 'Book ski lessons', 'Reserve instructor for group', '2026-11-20', TRUE, 'medium'
FROM trips t WHERE t.title = 'Swiss Alps Skiing';

-- Todos for New York City
INSERT INTO todo_items (trip_id, title, description, due_date, is_completed, priority)
SELECT t.id, 'Buy Broadway tickets', 'Purchase Hamilton tickets', '2026-04-01', TRUE, 'high'
FROM trips t WHERE t.title = 'New York City';

INSERT INTO todo_items (trip_id, title, description, due_date, is_completed, priority)
SELECT t.id, 'Reserve restaurant', 'Book table at top restaurant', '2026-04-15', FALSE, 'medium'
FROM trips t WHERE t.title = 'New York City';

INSERT INTO todo_items (trip_id, title, description, due_date, is_completed, priority)
SELECT t.id, 'Get MetroCard', 'Buy subway pass online', '2026-04-25', FALSE, 'low'
FROM trips t WHERE t.title = 'New York City';

-- Todos for Morocco Desert Tour
INSERT INTO todo_items (trip_id, title, description, due_date, is_completed, priority)
SELECT t.id, 'Book desert camp', 'Reserve Berber camp experience', '2026-08-20', FALSE, 'high'
FROM trips t WHERE t.title = 'Morocco Desert Tour';

INSERT INTO todo_items (trip_id, title, description, due_date, is_completed, priority)
SELECT t.id, 'Learn basic Arabic phrases', 'Practice greetings and thank you', '2026-09-01', FALSE, 'low'
FROM trips t WHERE t.title = 'Morocco Desert Tour';

-- Todos for Norway Fjords
INSERT INTO todo_items (trip_id, title, description, due_date, is_completed, priority)
SELECT t.id, 'Book fjord cruise', 'Reserve cabin on cruise ship', '2026-06-15', TRUE, 'high'
FROM trips t WHERE t.title = 'Norway Fjords';

INSERT INTO todo_items (trip_id, title, description, due_date, is_completed, priority)
SELECT t.id, 'Plan hiking routes', 'Research best trails in area', '2026-06-25', FALSE, 'medium'
FROM trips t WHERE t.title = 'Norway Fjords';

-- Todos for Spain Cultural Tour
INSERT INTO todo_items (trip_id, title, description, due_date, is_completed, priority)
SELECT t.id, 'Book Prado Museum tour', 'Reserve guided tour in Madrid', '2026-09-15', FALSE, 'high'
FROM trips t WHERE t.title = 'Spain Cultural Tour';

INSERT INTO todo_items (trip_id, title, description, due_date, is_completed, priority)
SELECT t.id, 'Buy flamenco show tickets', 'Reserve seats in Seville', '2026-09-20', TRUE, 'medium'
FROM trips t WHERE t.title = 'Spain Cultural Tour';

-- =============================================================================
-- EXPENSES, PACKING & TODOS FOR NEW TRIPS
-- =============================================================================

-- Barcelona Beach Escape (user1)
INSERT INTO expenses (trip_id, category_id, amount, currency, expense_date, description)
SELECT t.id, ec.id, 560.00, 'EUR', '2026-06-20', 'Beachfront apartment 8 nights'
FROM trips t, expense_categories ec 
WHERE t.title = 'Barcelona Beach Escape' AND ec.name = 'Accommodation';

INSERT INTO expenses (trip_id, category_id, amount, currency, expense_date, description)
SELECT t.id, ec.id, 85.00, 'EUR', '2026-06-21', 'Sagrada Familia tickets'
FROM trips t, expense_categories ec 
WHERE t.title = 'Barcelona Beach Escape' AND ec.name = 'Activities';

INSERT INTO expenses (trip_id, category_id, amount, currency, expense_date, description)
SELECT t.id, ec.id, 140.00, 'EUR', '2026-06-23', 'Restaurants and tapas'
FROM trips t, expense_categories ec 
WHERE t.title = 'Barcelona Beach Escape' AND ec.name = 'Food & Dining';

INSERT INTO packing_items (trip_id, category_id, name, quantity, is_packed, priority)
SELECT t.id, pc.id, 'Swimwear', 2, TRUE, 'high'
FROM trips t, packing_categories pc 
WHERE t.title = 'Barcelona Beach Escape' AND pc.name = 'Sports & Recreation';

INSERT INTO packing_items (trip_id, category_id, name, quantity, is_packed, priority)
SELECT t.id, pc.id, 'Beach sandals', 1, FALSE, 'medium'
FROM trips t, packing_categories pc 
WHERE t.title = 'Barcelona Beach Escape' AND pc.name = 'Clothing';

INSERT INTO packing_items (trip_id, category_id, name, quantity, is_packed, priority)
SELECT t.id, pc.id, 'Camera', 1, FALSE, 'medium'
FROM trips t, packing_categories pc 
WHERE t.title = 'Barcelona Beach Escape' AND pc.name = 'Electronics';

INSERT INTO todo_items (trip_id, title, description, due_date, is_completed, priority)
SELECT t.id, 'Book Sagrada Familia tour', 'Reserve skip-the-line tickets', '2026-06-10', TRUE, 'high'
FROM trips t WHERE t.title = 'Barcelona Beach Escape';

INSERT INTO todo_items (trip_id, title, description, due_date, is_completed, priority)
SELECT t.id, 'Learn Spanish phrases', 'Basic Spanish for tourists', '2026-06-15', FALSE, 'low'
FROM trips t WHERE t.title = 'Barcelona Beach Escape';

-- Amsterdam Canal Tour (user1)
INSERT INTO expenses (trip_id, category_id, amount, currency, expense_date, description)
SELECT t.id, ec.id, 480.00, 'EUR', '2026-09-10', 'Canal house hotel 5 nights'
FROM trips t, expense_categories ec 
WHERE t.title = 'Amsterdam Canal Tour' AND ec.name = 'Accommodation';

INSERT INTO expenses (trip_id, category_id, amount, currency, expense_date, description)
SELECT t.id, ec.id, 120.00, 'EUR', '2026-09-11', 'Van Gogh Museum tickets'
FROM trips t, expense_categories ec 
WHERE t.title = 'Amsterdam Canal Tour' AND ec.name = 'Activities';

INSERT INTO expenses (trip_id, category_id, amount, currency, expense_date, description)
SELECT t.id, ec.id, 60.00, 'EUR', '2026-09-12', 'Bike rental for 5 days'
FROM trips t, expense_categories ec 
WHERE t.title = 'Amsterdam Canal Tour' AND ec.name = 'Transportation';

INSERT INTO packing_items (trip_id, category_id, name, quantity, is_packed, priority)
SELECT t.id, pc.id, 'Rain jacket', 1, FALSE, 'high'
FROM trips t, packing_categories pc 
WHERE t.title = 'Amsterdam Canal Tour' AND pc.name = 'Clothing';

INSERT INTO packing_items (trip_id, category_id, name, quantity, is_packed, priority)
SELECT t.id, pc.id, 'Comfortable walking shoes', 1, TRUE, 'high'
FROM trips t, packing_categories pc 
WHERE t.title = 'Amsterdam Canal Tour' AND pc.name = 'Clothing';

INSERT INTO todo_items (trip_id, title, description, due_date, is_completed, priority)
SELECT t.id, 'Reserve canal cruise', 'Book evening canal tour', '2026-09-01', FALSE, 'high'
FROM trips t WHERE t.title = 'Amsterdam Canal Tour';

INSERT INTO todo_items (trip_id, title, description, due_date, is_completed, priority)
SELECT t.id, 'Research bike routes', 'Find scenic cycling paths', '2026-09-05', FALSE, 'medium'
FROM trips t WHERE t.title = 'Amsterdam Canal Tour';

-- Vienna Music Festival (user1)
INSERT INTO expenses (trip_id, category_id, amount, currency, expense_date, description)
SELECT t.id, ec.id, 680.00, 'EUR', '2026-10-20', 'Luxury hotel 5 nights'
FROM trips t, expense_categories ec 
WHERE t.title = 'Vienna Music Festival' AND ec.name = 'Accommodation';

INSERT INTO expenses (trip_id, category_id, amount, currency, expense_date, description)
SELECT t.id, ec.id, 280.00, 'EUR', '2026-10-22', 'Concert tickets x2'
FROM trips t, expense_categories ec 
WHERE t.title = 'Vienna Music Festival' AND ec.name = 'Entertainment';

INSERT INTO packing_items (trip_id, category_id, name, quantity, is_packed, priority)
SELECT t.id, pc.id, 'Formal dress', 1, FALSE, 'high'
FROM trips t, packing_categories pc 
WHERE t.title = 'Vienna Music Festival' AND pc.name = 'Clothing';

INSERT INTO packing_items (trip_id, category_id, name, quantity, is_packed, priority)
SELECT t.id, pc.id, 'Dress shoes', 1, FALSE, 'high'
FROM trips t, packing_categories pc 
WHERE t.title = 'Vienna Music Festival' AND pc.name = 'Clothing';

INSERT INTO todo_items (trip_id, title, description, due_date, is_completed, priority)
SELECT t.id, 'Book concert tickets', 'Purchase tickets for Musikverein', '2026-09-20', TRUE, 'high'
FROM trips t WHERE t.title = 'Vienna Music Festival';

INSERT INTO todo_items (trip_id, title, description, due_date, is_completed, priority)
SELECT t.id, 'Reserve restaurant', 'Book at Michelin-starred restaurant', '2026-10-10', FALSE, 'medium'
FROM trips t WHERE t.title = 'Vienna Music Festival';

-- Dubai Shopping Festival (user2)
INSERT INTO expenses (trip_id, category_id, amount, currency, expense_date, description)
SELECT t.id, ec.id, 2200.00, 'EUR', '2027-01-10', '5-star hotel 8 nights'
FROM trips t, expense_categories ec 
WHERE t.title = 'Dubai Shopping Festival' AND ec.name = 'Accommodation';

INSERT INTO expenses (trip_id, category_id, amount, currency, expense_date, description)
SELECT t.id, ec.id, 850.00, 'EUR', '2027-01-12', 'Shopping spree at Dubai Mall'
FROM trips t, expense_categories ec 
WHERE t.title = 'Dubai Shopping Festival' AND ec.name = 'Shopping';

INSERT INTO expenses (trip_id, category_id, amount, currency, expense_date, description)
SELECT t.id, ec.id, 180.00, 'EUR', '2027-01-14', 'Burj Khalifa tickets'
FROM trips t, expense_categories ec 
WHERE t.title = 'Dubai Shopping Festival' AND ec.name = 'Activities';

INSERT INTO packing_items (trip_id, category_id, name, quantity, is_packed, priority)
SELECT t.id, pc.id, 'Sunglasses', 1, FALSE, 'high'
FROM trips t, packing_categories pc 
WHERE t.title = 'Dubai Shopping Festival' AND pc.name = 'Accessories';

INSERT INTO packing_items (trip_id, category_id, name, quantity, is_packed, priority)
SELECT t.id, pc.id, 'Light clothing', 5, FALSE, 'high'
FROM trips t, packing_categories pc 
WHERE t.title = 'Dubai Shopping Festival' AND pc.name = 'Clothing';

INSERT INTO todo_items (trip_id, title, description, due_date, is_completed, priority)
SELECT t.id, 'Apply for UAE visa', 'Get tourist visa online', '2026-12-15', FALSE, 'high'
FROM trips t WHERE t.title = 'Dubai Shopping Festival';

INSERT INTO todo_items (trip_id, title, description, due_date, is_completed, priority)
SELECT t.id, 'Research shopping areas', 'Find best malls and souks', '2026-12-20', FALSE, 'medium'
FROM trips t WHERE t.title = 'Dubai Shopping Festival';

-- Bali Yoga Retreat (user2)
INSERT INTO expenses (trip_id, category_id, amount, currency, expense_date, description)
SELECT t.id, ec.id, 1600.00, 'EUR', '2026-08-01', 'Yoga retreat package 14 days'
FROM trips t, expense_categories ec 
WHERE t.title = 'Bali Yoga Retreat' AND ec.name = 'Accommodation';

INSERT INTO expenses (trip_id, category_id, amount, currency, expense_date, description)
SELECT t.id, ec.id, 340.00, 'EUR', '2026-08-03', 'Spa and massage treatments'
FROM trips t, expense_categories ec 
WHERE t.title = 'Bali Yoga Retreat' AND ec.name = 'Activities';

INSERT INTO packing_items (trip_id, category_id, name, quantity, is_packed, priority)
SELECT t.id, pc.id, 'Yoga mat', 1, FALSE, 'high'
FROM trips t, packing_categories pc 
WHERE t.title = 'Bali Yoga Retreat' AND pc.name = 'Sports & Recreation';

INSERT INTO packing_items (trip_id, category_id, name, quantity, is_packed, priority)
SELECT t.id, pc.id, 'Meditation cushion', 1, FALSE, 'medium'
FROM trips t, packing_categories pc 
WHERE t.title = 'Bali Yoga Retreat' AND pc.name = 'Sports & Recreation';

INSERT INTO todo_items (trip_id, title, description, due_date, is_completed, priority)
SELECT t.id, 'Book yoga classes', 'Reserve spots in daily sessions', '2026-07-20', TRUE, 'high'
FROM trips t WHERE t.title = 'Bali Yoga Retreat';

INSERT INTO todo_items (trip_id, title, description, due_date, is_completed, priority)
SELECT t.id, 'Get travel insurance', 'Purchase comprehensive coverage', '2026-07-25', FALSE, 'high'
FROM trips t WHERE t.title = 'Bali Yoga Retreat';

-- Scottish Highlands (user2)
INSERT INTO expenses (trip_id, category_id, amount, currency, expense_date, description)
SELECT t.id, ec.id, 620.00, 'EUR', '2026-07-12', 'B&B accommodations 8 nights'
FROM trips t, expense_categories ec 
WHERE t.title = 'Scottish Highlands' AND ec.name = 'Accommodation';

INSERT INTO expenses (trip_id, category_id, amount, currency, expense_date, description)
SELECT t.id, ec.id, 380.00, 'EUR', '2026-07-13', 'Car rental for 9 days'
FROM trips t, expense_categories ec 
WHERE t.title = 'Scottish Highlands' AND ec.name = 'Transportation';

INSERT INTO packing_items (trip_id, category_id, name, quantity, is_packed, priority)
SELECT t.id, pc.id, 'Hiking boots', 1, FALSE, 'high'
FROM trips t, packing_categories pc 
WHERE t.title = 'Scottish Highlands' AND pc.name = 'Clothing';

INSERT INTO packing_items (trip_id, category_id, name, quantity, is_packed, priority)
SELECT t.id, pc.id, 'Waterproof backpack', 1, FALSE, 'high'
FROM trips t, packing_categories pc 
WHERE t.title = 'Scottish Highlands' AND pc.name = 'Accessories';

INSERT INTO todo_items (trip_id, title, description, due_date, is_completed, priority)
SELECT t.id, 'Plan hiking routes', 'Research Ben Nevis and other trails', '2026-07-01', FALSE, 'high'
FROM trips t WHERE t.title = 'Scottish Highlands';

INSERT INTO todo_items (trip_id, title, description, due_date, is_completed, priority)
SELECT t.id, 'Book castle tours', 'Reserve Edinburgh Castle tour', '2026-07-05', FALSE, 'medium'
FROM trips t WHERE t.title = 'Scottish Highlands';

-- Prague Christmas Markets (user3)
INSERT INTO expenses (trip_id, category_id, amount, currency, expense_date, description)
SELECT t.id, ec.id, 440.00, 'EUR', '2026-12-10', 'Old Town hotel 7 nights'
FROM trips t, expense_categories ec 
WHERE t.title = 'Prague Christmas Markets' AND ec.name = 'Accommodation';

INSERT INTO expenses (trip_id, category_id, amount, currency, expense_date, description)
SELECT t.id, ec.id, 150.00, 'EUR', '2026-12-12', 'Christmas market shopping'
FROM trips t, expense_categories ec 
WHERE t.title = 'Prague Christmas Markets' AND ec.name = 'Shopping';

INSERT INTO packing_items (trip_id, category_id, name, quantity, is_packed, priority)
SELECT t.id, pc.id, 'Winter coat', 1, FALSE, 'high'
FROM trips t, packing_categories pc 
WHERE t.title = 'Prague Christmas Markets' AND pc.name = 'Clothing';

INSERT INTO packing_items (trip_id, category_id, name, quantity, is_packed, priority)
SELECT t.id, pc.id, 'Gloves and scarf', 2, FALSE, 'high'
FROM trips t, packing_categories pc 
WHERE t.title = 'Prague Christmas Markets' AND pc.name = 'Clothing';

INSERT INTO todo_items (trip_id, title, description, due_date, is_completed, priority)
SELECT t.id, 'Research Christmas markets', 'Find best markets in Prague', '2026-11-20', FALSE, 'medium'
FROM trips t WHERE t.title = 'Prague Christmas Markets';

INSERT INTO todo_items (trip_id, title, description, due_date, is_completed, priority)
SELECT t.id, 'Book Christmas dinner', 'Reserve traditional Czech restaurant', '2026-12-01', FALSE, 'high'
FROM trips t WHERE t.title = 'Prague Christmas Markets';

-- Portugal Wine Tour (user3)
INSERT INTO expenses (trip_id, category_id, amount, currency, expense_date, description)
SELECT t.id, ec.id, 560.00, 'EUR', '2026-05-15', 'Douro Valley hotel 7 nights'
FROM trips t, expense_categories ec 
WHERE t.title = 'Portugal Wine Tour' AND ec.name = 'Accommodation';

INSERT INTO expenses (trip_id, category_id, amount, currency, expense_date, description)
SELECT t.id, ec.id, 320.00, 'EUR', '2026-05-16', 'Wine tasting tours'
FROM trips t, expense_categories ec 
WHERE t.title = 'Portugal Wine Tour' AND ec.name = 'Activities';

INSERT INTO packing_items (trip_id, category_id, name, quantity, is_packed, priority)
SELECT t.id, pc.id, 'Casual clothing', 5, FALSE, 'medium'
FROM trips t, packing_categories pc 
WHERE t.title = 'Portugal Wine Tour' AND pc.name = 'Clothing';

INSERT INTO packing_items (trip_id, category_id, name, quantity, is_packed, priority)
SELECT t.id, pc.id, 'Sunhat', 1, FALSE, 'medium'
FROM trips t, packing_categories pc 
WHERE t.title = 'Portugal Wine Tour' AND pc.name = 'Accessories';

INSERT INTO todo_items (trip_id, title, description, due_date, is_completed, priority)
SELECT t.id, 'Book winery tours', 'Reserve visits to 3 wineries', '2026-05-01', TRUE, 'high'
FROM trips t WHERE t.title = 'Portugal Wine Tour';

INSERT INTO todo_items (trip_id, title, description, due_date, is_completed, priority)
SELECT t.id, 'Learn about Portuguese wine', 'Research Port and Douro wines', '2026-05-10', FALSE, 'low'
FROM trips t WHERE t.title = 'Portugal Wine Tour';

-- Croatian Coast (user3)
INSERT INTO expenses (trip_id, category_id, amount, currency, expense_date, description)
SELECT t.id, ec.id, 1280.00, 'EUR', '2026-07-25', 'Sailing boat rental 12 days'
FROM trips t, expense_categories ec 
WHERE t.title = 'Croatian Coast' AND ec.name = 'Transportation';

INSERT INTO expenses (trip_id, category_id, amount, currency, expense_date, description)
SELECT t.id, ec.id, 420.00, 'EUR', '2026-07-27', 'Marina fees and fuel'
FROM trips t, expense_categories ec 
WHERE t.title = 'Croatian Coast' AND ec.name = 'Transportation';

INSERT INTO packing_items (trip_id, category_id, name, quantity, is_packed, priority)
SELECT t.id, pc.id, 'Swimming gear', 3, FALSE, 'high'
FROM trips t, packing_categories pc 
WHERE t.title = 'Croatian Coast' AND pc.name = 'Sports & Recreation';

INSERT INTO packing_items (trip_id, category_id, name, quantity, is_packed, priority)
SELECT t.id, pc.id, 'Seasickness medication', 1, FALSE, 'medium'
FROM trips t, packing_categories pc 
WHERE t.title = 'Croatian Coast' AND pc.name = 'Medicine';

INSERT INTO todo_items (trip_id, title, description, due_date, is_completed, priority)
SELECT t.id, 'Get sailing license', 'Verify license is valid', '2026-07-10', TRUE, 'high'
FROM trips t WHERE t.title = 'Croatian Coast';

INSERT INTO todo_items (trip_id, title, description, due_date, is_completed, priority)
SELECT t.id, 'Plan sailing route', 'Map out island stops', '2026-07-15', FALSE, 'high'
FROM trips t WHERE t.title = 'Croatian Coast';

-- Kenya Safari (user4)
INSERT INTO expenses (trip_id, category_id, amount, currency, expense_date, description)
SELECT t.id, ec.id, 3200.00, 'EUR', '2026-11-01', 'Safari lodge 14 nights'
FROM trips t, expense_categories ec 
WHERE t.title = 'Kenya Safari' AND ec.name = 'Accommodation';

INSERT INTO expenses (trip_id, category_id, amount, currency, expense_date, description)
SELECT t.id, ec.id, 1800.00, 'EUR', '2026-11-03', 'Guided safari tours'
FROM trips t, expense_categories ec 
WHERE t.title = 'Kenya Safari' AND ec.name = 'Activities';

INSERT INTO packing_items (trip_id, category_id, name, quantity, is_packed, priority)
SELECT t.id, pc.id, 'Binoculars', 1, FALSE, 'high'
FROM trips t, packing_categories pc 
WHERE t.title = 'Kenya Safari' AND pc.name = 'Electronics';

INSERT INTO packing_items (trip_id, category_id, name, quantity, is_packed, priority)
SELECT t.id, pc.id, 'Safari hat', 1, FALSE, 'high'
FROM trips t, packing_categories pc 
WHERE t.title = 'Kenya Safari' AND pc.name = 'Accessories';

INSERT INTO todo_items (trip_id, title, description, due_date, is_completed, priority)
SELECT t.id, 'Get vaccinations', 'Yellow fever and malaria prevention', '2026-10-01', FALSE, 'high'
FROM trips t WHERE t.title = 'Kenya Safari';

INSERT INTO todo_items (trip_id, title, description, due_date, is_completed, priority)
SELECT t.id, 'Book safari package', 'Reserve Masai Mara tour', '2026-09-15', TRUE, 'high'
FROM trips t WHERE t.title = 'Kenya Safari';

-- Peru Machu Picchu (user4)
INSERT INTO expenses (trip_id, category_id, amount, currency, expense_date, description)
SELECT t.id, ec.id, 980.00, 'EUR', '2026-09-20', 'Hotels in Cusco and Aguas Calientes'
FROM trips t, expense_categories ec 
WHERE t.title = 'Peru Machu Picchu' AND ec.name = 'Accommodation';

INSERT INTO expenses (trip_id, category_id, amount, currency, expense_date, description)
SELECT t.id, ec.id, 680.00, 'EUR', '2026-09-22', 'Inca Trail permit and guide'
FROM trips t, expense_categories ec 
WHERE t.title = 'Peru Machu Picchu' AND ec.name = 'Activities';

INSERT INTO packing_items (trip_id, category_id, name, quantity, is_packed, priority)
SELECT t.id, pc.id, 'Trekking poles', 2, FALSE, 'high'
FROM trips t, packing_categories pc 
WHERE t.title = 'Peru Machu Picchu' AND pc.name = 'Sports & Recreation';

INSERT INTO packing_items (trip_id, category_id, name, quantity, is_packed, priority)
SELECT t.id, pc.id, 'Altitude sickness pills', 1, FALSE, 'high'
FROM trips t, packing_categories pc 
WHERE t.title = 'Peru Machu Picchu' AND pc.name = 'Medicine';

INSERT INTO todo_items (trip_id, title, description, due_date, is_completed, priority)
SELECT t.id, 'Book Inca Trail permit', 'Reserve trek 6 months in advance', '2026-03-20', TRUE, 'high'
FROM trips t WHERE t.title = 'Peru Machu Picchu';

INSERT INTO todo_items (trip_id, title, description, due_date, is_completed, priority)
SELECT t.id, 'Train fitness', 'Prepare for high altitude hiking', '2026-08-01', FALSE, 'high'
FROM trips t WHERE t.title = 'Peru Machu Picchu';

-- Canadian Rockies (user4)
INSERT INTO expenses (trip_id, category_id, amount, currency, expense_date, description)
SELECT t.id, ec.id, 1480.00, 'EUR', '2026-08-10', 'Mountain lodges 12 nights'
FROM trips t, expense_categories ec 
WHERE t.title = 'Canadian Rockies' AND ec.name = 'Accommodation';

INSERT INTO expenses (trip_id, category_id, amount, currency, expense_date, description)
SELECT t.id, ec.id, 520.00, 'EUR', '2026-08-11', 'National park passes and tours'
FROM trips t, expense_categories ec 
WHERE t.title = 'Canadian Rockies' AND ec.name = 'Activities';

INSERT INTO packing_items (trip_id, category_id, name, quantity, is_packed, priority)
SELECT t.id, pc.id, 'Bear spray', 1, FALSE, 'high'
FROM trips t, packing_categories pc 
WHERE t.title = 'Canadian Rockies' AND pc.name = 'Medicine';

INSERT INTO packing_items (trip_id, category_id, name, quantity, is_packed, priority)
SELECT t.id, pc.id, 'Camping gear', 1, FALSE, 'medium'
FROM trips t, packing_categories pc 
WHERE t.title = 'Canadian Rockies' AND pc.name = 'Other';

INSERT INTO todo_items (trip_id, title, description, due_date, is_completed, priority)
SELECT t.id, 'Reserve campground', 'Book spots at Lake Louise', '2026-07-15', FALSE, 'high'
FROM trips t WHERE t.title = 'Canadian Rockies';

INSERT INTO todo_items (trip_id, title, description, due_date, is_completed, priority)
SELECT t.id, 'Research wildlife safety', 'Learn about bear encounters', '2026-08-01', FALSE, 'medium'
FROM trips t WHERE t.title = 'Canadian Rockies';


