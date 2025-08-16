-- seed.sql
-- Database schema and seed data for subscription cancellation flow
-- Does not include production-level optimizations or advanced RLS policies

-- Enable Row Level Security

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create subscriptions table
CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  monthly_price INTEGER NOT NULL, -- Price in USD cents
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'pending_cancellation', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE cancellations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  subscription_id UUID REFERENCES subscriptions(id) ON DELETE CASCADE NOT NULL,
  -- A: control (skip downsell), B: downsell ($10 off)
  downsell_variant TEXT NOT NULL CHECK (downsell_variant IN ('A','B')),
  -- user selected “main reason” (radio on “still looking” path)
  reason TEXT,                                      
  -- free text feedback (min 25 chars in UI when required)
  feedback_text TEXT,
  -- “job found” block
  found_job_with_mm BOOLEAN,                        
  roles_applied_mm INTEGER,                         -- 0, 1-5, 6-20, 20+
  companies_emailed INTEGER,                        -- 0, 1-5, 6-20, 20+
  companies_interviewed INTEGER,                    -- 0, 1-2, 3-5, 5+
  -- visa block
  company_provides_lawyer BOOLEAN,
  visa_type TEXT,
  -- downsell
  accepted_downsell BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE cancellations ENABLE ROW LEVEL SECURITY;

-- Make policy creation idempotent
DROP POLICY IF EXISTS "Users can view own data"            ON users;
DROP POLICY IF EXISTS "Users can view own subscriptions"   ON subscriptions;
DROP POLICY IF EXISTS "Users can update own subscriptions" ON subscriptions;
DROP POLICY IF EXISTS "Users can insert own cancellations" ON cancellations;
DROP POLICY IF EXISTS "Users can view own cancellations"   ON cancellations;

CREATE POLICY "Users can view own data" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can view own subscriptions" ON subscriptions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own subscriptions" ON subscriptions
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own cancellations" ON cancellations
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own cancellations" ON cancellations
  FOR SELECT USING (auth.uid() = user_id);


-- Seed data
INSERT INTO users (id, email) VALUES
  ('550e8400-e29b-41d4-a716-446655440001', 'user1@example.com'),
  ('550e8400-e29b-41d4-a716-446655440002', 'user2@example.com'),
  ('550e8400-e29b-41d4-a716-446655440003', 'user3@example.com')
ON CONFLICT (email) DO NOTHING;

-- Seed subscriptions with $25 and $29 plans
INSERT INTO subscriptions (user_id, monthly_price, status) VALUES
  ('550e8400-e29b-41d4-a716-446655440001', 2500, 'active'), -- $25.00
  ('550e8400-e29b-41d4-a716-446655440002', 2900, 'active'), -- $29.00
  ('550e8400-e29b-41d4-a716-446655440003', 2500, 'active')  -- $25.00
ON CONFLICT DO NOTHING;

-- RLS (same style as your existing policies)
CREATE POLICY "Users can insert own cancellations" ON cancellations
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own cancellations" ON cancellations
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own cancellations" ON cancellations
  FOR UPDATE USING (auth.uid() = user_id);

