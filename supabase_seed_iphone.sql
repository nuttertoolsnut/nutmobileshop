-- Seed iPhone 15 Product

DO $$
DECLARE
  v_category_id bigint;
  v_product_id bigint;
BEGIN
  -- 1. Get Category ID for 'Mobile Phones'
  SELECT id INTO v_category_id FROM categories WHERE slug = 'mobile-phones';

  -- If category doesn't exist, create it (just in case)
  IF v_category_id IS NULL THEN
    INSERT INTO categories (name, slug) VALUES ('Mobile Phones', 'mobile-phones') RETURNING id INTO v_category_id;
  END IF;

  -- 2. Insert or Update Product
  -- Check if product exists by name
  SELECT id INTO v_product_id FROM products WHERE name = 'Apple iPhone 15 (ไอโฟน15) by Studio 7';

  IF v_product_id IS NULL THEN
    INSERT INTO products (name, description, price, category_id, condition, image_url, stock, is_featured)
    VALUES (
      'Apple iPhone 15 (ไอโฟน15) by Studio 7',
      'Apple iPhone 15 (ไอโฟน15) by Studio 7 - 128GB, 256GB, 512GB. Dynamic Island, 48MP Main camera, USB-C.',
      25900,
      v_category_id,
      'New',
      '/products/iphone15_studio7.png',
      100,
      true
    ) RETURNING id INTO v_product_id;
  ELSE
    UPDATE products SET
      price = 25900,
      image_url = '/products/iphone15_studio7.png',
      stock = 100,
      is_featured = true
    WHERE id = v_product_id;
  END IF;

  -- 3. Insert Variants
  -- Clear existing variants for this product to avoid duplicates
  DELETE FROM product_variants WHERE product_id = v_product_id;

  -- Insert new variants
  INSERT INTO product_variants (product_id, color, storage, price, stock, name) VALUES
  -- Black
  (v_product_id, 'Black', '128GB', 25900, 10, 'Black - 128GB'),
  (v_product_id, 'Black', '256GB', 29900, 10, 'Black - 256GB'),
  (v_product_id, 'Black', '512GB', 33900, 10, 'Black - 512GB'),
  -- Blue
  (v_product_id, 'Blue', '128GB', 25900, 10, 'Blue - 128GB'),
  (v_product_id, 'Blue', '256GB', 29900, 10, 'Blue - 256GB'),
  (v_product_id, 'Blue', '512GB', 33900, 10, 'Blue - 512GB'),
  -- Green
  (v_product_id, 'Green', '128GB', 25900, 10, 'Green - 128GB'),
  (v_product_id, 'Green', '256GB', 29900, 10, 'Green - 256GB'),
  (v_product_id, 'Green', '512GB', 33900, 10, 'Green - 512GB'),
  -- Pink
  (v_product_id, 'Pink', '128GB', 25900, 10, 'Pink - 128GB'),
  (v_product_id, 'Pink', '256GB', 29900, 10, 'Pink - 256GB'),
  (v_product_id, 'Pink', '512GB', 33900, 10, 'Pink - 512GB'),
  -- Yellow
  (v_product_id, 'Yellow', '128GB', 25900, 10, 'Yellow - 128GB'),
  (v_product_id, 'Yellow', '256GB', 29900, 10, 'Yellow - 256GB'),
  (v_product_id, 'Yellow', '512GB', 33900, 10, 'Yellow - 512GB');

END $$;
