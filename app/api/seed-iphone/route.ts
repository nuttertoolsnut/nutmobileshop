import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export async function GET() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  try {
    // 1. Get Category ID
    const { data: category } = await supabase
      .from('categories')
      .select('id')
      .eq('slug', 'mobile-phones')
      .single();

    if (!category) return NextResponse.json({ error: 'Category not found' }, { status: 404 });

    // 2. Upsert Product
    const productData = {
      name: 'Apple iPhone 15 (ไอโฟน15) by Studio 7',
      description: 'Apple iPhone 15 (ไอโฟน15) by Studio 7 - 128GB, 256GB, 512GB',
      price: 25900,
      category_id: category.id,
      condition: 'New',
      image_url: '/products/iphone15_studio7.png',
      stock: 100, // Default stock
      is_featured: true
    };

    // Check if exists by name to avoid duplicates or update
    const { data: existingProduct } = await supabase
      .from('products')
      .select('id')
      .eq('name', productData.name)
      .single();

    let productId;
    if (existingProduct) {
      await supabase.from('products').update(productData).eq('id', existingProduct.id);
      productId = existingProduct.id;
    } else {
      const { data: newProduct, error } = await supabase.from('products').insert(productData).select().single();
      if (error) throw error;
      productId = newProduct.id;
    }

    // 3. Upsert Variants
    const colors = ['Black', 'Blue', 'Green', 'Pink', 'Yellow'];
    const capacities = ['128GB', '256GB', '512GB'];
    
    // Base price is for 128GB. Add markup for others.
    // 128GB: 25,900
    // 256GB: +4,000 (approx 29,900)
    // 512GB: +8,000 (approx 33,900)
    
    const variants = [];
    for (const color of colors) {
      for (const storage of capacities) {
        let price = 25900;
        if (storage === '256GB') price = 29900;
        if (storage === '512GB') price = 33900;

        variants.push({
          product_id: productId,
          color,
          storage,
          price,
          stock: 10, // Default variant stock
          name: `${color} - ${storage}`
        });
      }
    }

    // Delete existing variants for this product to avoid duplicates/mess
    await supabase.from('product_variants').delete().eq('product_id', productId);
    
    // Insert new variants
    const { error: variantError } = await supabase.from('product_variants').insert(variants);
    if (variantError) throw variantError;

    return NextResponse.json({ success: true, productId, variantsCount: variants.length });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
