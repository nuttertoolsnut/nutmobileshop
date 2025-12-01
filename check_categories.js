const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Missing env vars');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkCategories() {
  const { data, error } = await supabase.from('categories').select('*').limit(5);
  if (error) {
    console.error('Error:', error.message);
  } else {
    console.log('Categories:', data);
  }
}

checkCategories();
