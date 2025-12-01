const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkProduct() {
  const { data: product, error: pError } = await supabase
    .from('products')
    .select('*')
    .eq('id', 4)
    .single();

  if (pError) console.error('Product Error:', pError);
  else console.log('Product:', product);

  const { data: variants, error: vError } = await supabase
    .from('product_variants')
    .select('*')
    .eq('product_id', 4);

  if (vError) console.error('Variant Error:', vError);
  else console.log('Variants:', variants);
}

checkProduct();
