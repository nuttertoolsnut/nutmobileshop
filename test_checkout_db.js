const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Missing env vars');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testInsert() {
  console.log('Attempting login...');
  const { data: { user }, error: loginError } = await supabase.auth.signInWithPassword({
    email: 'admin123@gmail.com',
    password: 'nut21345'
  });

  if (loginError) {
    console.error('Login failed:', loginError);
    return;
  }

  console.log('Logged in as:', user.id);

  // Dummy Order with items
  const orderData = {
    user_id: user.id,
    total_price: 100,
    status: 'pending',
    shipping_address: 'Test Address',
    payment_method: 'transfer',
    slip_url: 'http://example.com/slip.jpg',
    items: [{ id: 1, name: 'Test Item', price: 100, quantity: 1 }]
  };

  console.log('Inserting order...');
  const { data, error } = await supabase.from('orders').insert([orderData]).select();

  if (error) {
    console.error('Insert failed:', JSON.stringify(error, null, 2));
  } else {
    console.log('Insert success:', data);
    
    // Cleanup
    console.log('Cleaning up...');
    await supabase.from('orders').delete().eq('id', data[0].id);
    console.log('Cleanup done.');
  }
}

testInsert();
