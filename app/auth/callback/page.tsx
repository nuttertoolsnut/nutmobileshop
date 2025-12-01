'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { Spin, message } from 'antd';

export default function AuthCallbackPage() {
  const router = useRouter();

  useEffect(() => {
    const handleAuthCallback = async () => {
      // The supabase client automatically detects the hash fragment and sets the session
      const { data: { session }, error } = await supabase.auth.getSession();

      if (error) {
        console.error('Auth callback error:', error);
        router.push(`/login?error=${encodeURIComponent(error.message)}`);
        return;
      }

      if (session) {
        // Successful login
        router.push('/cart?login=success');
      } else {
        // No session found, but also no error? 
        // Wait a bit, sometimes the hash processing takes a moment
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
          if (event === 'SIGNED_IN' && session) {
            router.push('/cart?login=success');
            subscription.unsubscribe();
          }
        });
      }
    };

    handleAuthCallback();
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <Spin size="large" />
        <p className="mt-4 text-gray-500">กำลังยืนยันตัวตน...</p>
      </div>
    </div>
  );
}
