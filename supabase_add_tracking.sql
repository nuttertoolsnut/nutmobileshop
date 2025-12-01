-- Add tracking_number and carrier_name columns to orders table
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS tracking_number TEXT,
ADD COLUMN IF NOT EXISTS carrier_name TEXT;
