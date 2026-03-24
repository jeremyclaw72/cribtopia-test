-- Cribtopia Database Schema
-- Based on Base44 entity structure

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  full_name VARCHAR(255),
  phone VARCHAR(50),
  role VARCHAR(50) DEFAULT 'buyer',
  two_factor_enabled BOOLEAN DEFAULT false,
  oauth_provider VARCHAR(50),
  oauth_id VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Listings table
CREATE TABLE IF NOT EXISTS listings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  address VARCHAR(500) NOT NULL,
  city VARCHAR(255) NOT NULL,
  state VARCHAR(2) NOT NULL,
  zip VARCHAR(20),
  price DECIMAL(12,2) NOT NULL,
  bedrooms DECIMAL(4,1),
  bathrooms DECIMAL(4,1),
  sqft DECIMAL(10,0),
  description TEXT,
  photos JSONB DEFAULT '[]',
  listing_type VARCHAR(50) DEFAULT 'FSBO',
  seller_name VARCHAR(255),
  seller_email VARCHAR(255),
  seller_phone VARCHAR(50),
  status VARCHAR(50) DEFAULT 'Active',
  verified BOOLEAN DEFAULT false,
  premium_listing BOOLEAN DEFAULT false,
  premium_expires TIMESTAMP,
  restaging_unlocked BOOLEAN DEFAULT false,
  amenities JSONB DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Offers table
CREATE TABLE IF NOT EXISTS offers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id UUID REFERENCES listings(id),
  buyer_name VARCHAR(255) NOT NULL,
  buyer_email VARCHAR(255) NOT NULL,
  buyer_phone VARCHAR(50),
  offer_amount DECIMAL(12,2) NOT NULL,
  earnest_money DECIMAL(12,2),
  financing_type VARCHAR(100),
  closing_date DATE,
  contingencies TEXT,
  message TEXT,
  status VARCHAR(50) DEFAULT 'pending',
  seller_response TEXT,
  counter_amount DECIMAL(12,2),
  stripe_payment_id VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Closing Workflows table
CREATE TABLE IF NOT EXISTS closing_workflows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  offer_id UUID REFERENCES offers(id),
  listing_id UUID REFERENCES listings(id),
  buyer_email VARCHAR(255),
  seller_email VARCHAR(255),
  workflow_type VARCHAR(100),
  status VARCHAR(50) DEFAULT 'pending',
  current_step INTEGER DEFAULT 0,
  steps JSONB DEFAULT '[]',
  target_closing_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_listings_status ON listings(status);
CREATE INDEX IF NOT EXISTS idx_listings_type ON listings(listing_type);
CREATE INDEX IF NOT EXISTS idx_listings_city_state ON listings(city, state);
CREATE INDEX IF NOT EXISTS idx_offers_listing ON offers(listing_id);
CREATE INDEX IF NOT EXISTS idx_offers_status ON offers(status);

-- Insert sample listings
INSERT INTO listings (address, city, state, zip, price, bedrooms, bathrooms, sqft, description, listing_type, status, seller_name, seller_email)
VALUES
  ('123 Main Street', 'Denver', 'CO', '80202', 450000, 3, 2, 1800, 'Beautiful home in downtown Denver with mountain views', 'FSBO', 'Active', 'John Seller', 'john@example.com'),
  ('456 Oak Avenue', 'Aurora', 'CO', '80013', 320000, 2, 1, 1200, 'Cozy starter home perfect for first-time buyers', 'FSBO', 'Active', 'Jane Seller', 'jane@example.com'),
  ('789 Pine Lane', 'Boulder', 'CO', '80301', 2500, 2, 1, 900, 'Charming rental in Boulder near hiking trails', 'Rental', 'Active', 'Bob Landlord', 'bob@example.com')
ON CONFLICT DO NOTHING;

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply triggers
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_listings_updated_at BEFORE UPDATE ON listings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_offers_updated_at BEFORE UPDATE ON offers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_workflows_updated_at BEFORE UPDATE ON closing_workflows FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();