"use client";
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Card, Spin, Alert } from 'antd';

export default function DebugAuthPage() {
  const [user, setUser] = useState<unknown>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const checkAuth = async () => {
      // 1. Check Auth User
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      setUser(user);

      if (authError) {
        setError('Auth Error: ' + authError.message);
        setLoading(false);
        return;
      }

      if (user) {
        // 2. Check Profile
        const { data, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
        
        setProfile(data);
        if (profileError) {
          setError(prev => prev + ' | Profile Error: ' + profileError.message);
        }
      }
      setLoading(false);
    };

    void checkAuth();
  }, []);

  if (loading) return <div className="p-10"><Spin /> Checking Auth...</div>;

  return (
    <div className="p-10 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Auth Debugger</h1>
      
      {error && <Alert type="error" message={error} className="mb-4" />}

      <Card title="1. Auth User (from supabase.auth.getUser())" className="mb-4">
        {user ? (
          <pre className="text-xs overflow-auto">{JSON.stringify(user, null, 2)}</pre>
        ) : (
          <p className="text-red-500">No User Logged In</p>
        )}
      </Card>

      <Card title="2. Profile (from public.profiles table)">
        {profile ? (
          <>
            <p><strong>ID:</strong> {profile.id}</p>
            <p><strong>Role:</strong> <span className="text-xl font-bold text-blue-600">{profile.role}</span></p>
            <pre className="text-xs overflow-auto mt-2">{JSON.stringify(profile, null, 2)}</pre>
          </>
        ) : (
          <p className="text-red-500">Profile Not Found (Row missing in &apos;profiles&apos; table)</p>
        )}
      </Card>
      
      <div className="mt-4 p-4 bg-gray-100 rounded">
        <p><strong>Diagnosis:</strong></p>
        <ul className="list-disc ml-5">
          <li>If <strong>User</strong> is null: You are not logged in.</li>
          <li>If <strong>Profile</strong> is null: The trigger didn&apos;t run. You need to manually insert a row in `profiles` table with ID = User ID.</li>
          <li>If <strong>Role</strong> is &apos;customer&apos;: You need to change it to &apos;admin&apos; in Supabase.</li>
        </ul>
      </div>
    </div>
  );
}
