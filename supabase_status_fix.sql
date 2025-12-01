-- 1. Drop the existing check constraint
ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_status_check;

-- 2. Add the new check constraint with all required statuses (lowercase)
ALTER TABLE orders 
ADD CONSTRAINT orders_status_check 
CHECK (status IN ('pending', 'paid', 'preparing', 'shipped', 'completed', 'cancelled', 'returned', 'refunded'));

-- 3. (Optional) Update existing data to lowercase if needed
UPDATE orders SET status = LOWER(status);
