"use client";
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Layout, Spin, message } from 'antd';
import AdminSidebar from '@/components/AdminSidebar';
import { supabase } from '@/lib/supabaseClient';

const { Content } = Layout;

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    const checkAdmin = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      console.log('Current User:', user);
      
      if (!user) {
        console.log('No user found, redirecting to login');
        message.error('Please login first');
        router.push('/login');
        return;
      }

      const { data: profile, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();
      
      console.log('Profile Check:', { profile, error });

      if (error || profile?.role !== 'admin') {
        console.log('Access Denied. Role:', profile?.role, 'Error:', error);
        message.error('Access Denied: Admin only');
        router.push('/');
      } else {
        console.log('Access Granted');
        setAuthorized(true);
      }
      setLoading(false);
    };

    void checkAdmin();
  }, [router]);

  if (loading) {
    return <div className="h-screen flex items-center justify-center"><Spin size="large" tip="Verifying Admin Access..."><div className="p-12" /></Spin></div>;
  }

  if (!authorized) return null;

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <AdminSidebar />
      <Layout>
        <Content style={{ margin: '24px 16px', padding: 24, background: '#fff', borderRadius: 8 }}>
          {children}
        </Content>
      </Layout>
    </Layout>
  );
}
