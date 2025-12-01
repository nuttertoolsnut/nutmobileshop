const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase URL or Key');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkVariants() {
  const productId = 10; // From user's URL
  console.log(`Checking variants for product ID: ${productId}`);

  const { data, error } = await supabase
    .from('product_variants')
    .select('*')
    .eq('product_id', productId);

  if (error) {
    console.error('Error fetching variants:', error);
  } else {
    console.log(`Found ${data.length} variants:`);
    console.log(JSON.stringify(data, null, 2));
  }
}

checkVariants();
