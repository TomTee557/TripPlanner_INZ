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
