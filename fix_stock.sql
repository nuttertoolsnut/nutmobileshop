-- Fix stock for product ID 4
UPDATE products SET stock = 10 WHERE id = 4;

-- Optional: Add variants if you want to test variant selection
-- INSERT INTO product_variants (product_id, color, storage, price, stock)
-- VALUES (4, 'Black', '128GB', 4000, 10);
