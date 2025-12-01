-- Add shipped_at column to orders table
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS shipped_at TIMESTAMP WITH TIME ZONE;
