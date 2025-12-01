const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Missing env vars');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkStorage() {
  const { data, error } = await supabase.storage.listBuckets();
  if (error) {
    console.error('Error listing buckets:', error);
  } else {
    console.log('Buckets:', data.map(b => b.name));
    
    // Check if 'products' bucket exists
    const productsBucket = data.find(b => b.name === 'products');
    if (!productsBucket) {
        console.error("Bucket 'products' NOT found!");
    } else {
        console.log("Bucket 'products' found.");
        // Try to upload a test file
        const { data: uploadData, error: uploadError } = await supabase.storage
            .from('products')
            .upload(`test-${Date.now()}.txt`, 'test content');
            
        if (uploadError) {
            console.error('Upload test failed:', uploadError);
        } else {
            console.log('Upload test successful:', uploadData);
        }
    }
  }
}

checkStorage();
