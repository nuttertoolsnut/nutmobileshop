/* eslint-disable @typescript-eslint/no-require-imports */
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Missing env vars');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkProductColumns() {
  const { data, error } = await supabase.from('products').select('*').limit(1);
  if (error) {
    console.error('Error:', error);
  } else {
    console.log('Products columns:', data.length > 0 ? Object.keys(data[0]) : 'No data (but query worked)');
    // If no data, we can try to select specific columns to see if they error
    if (data.length === 0) {
        const { error: catError } = await supabase.from('products').select('category').limit(1);
        console.log('Category column exists:', !catError);
        const { error: brandError } = await supabase.from('products').select('brand').limit(1);
        console.log('Brand column exists:', !brandError);
    }
  }
}

checkProductColumns();
