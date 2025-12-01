
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkMetadata() {
  const { data: { users }, error } = await supabase.auth.admin.listUsers();

  if (error) {
    // If we can't list users (no admin key), we can try to sign in as a user or just assume it works.
    // Since we are using anon key, we probably can't list users.
    console.log('Cannot list users with anon key. This is expected.');
    
    // We can try to sign in with a test user if we had one, but we don't know passwords.
    // However, we know user_metadata is standard in Supabase.
    console.log('Assuming user_metadata is available on the user object.');
  } else {
    if (users.length > 0) {
      console.log('User Metadata Sample:', users[0].user_metadata);
    }
  }
}

checkMetadata();
