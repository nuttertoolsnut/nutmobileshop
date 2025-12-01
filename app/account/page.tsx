"use client";
import { useEffect, useState } from 'react';
import { Tabs, Table, Tag, Button, Avatar, Spin } from 'antd';
import { UserOutlined, LogoutOutlined, ShoppingOutlined } from '@ant-design/icons';
import { supabase } from '@/lib/supabaseClient';
import { useRouter, useSearchParams } from 'next/navigation';

import { Suspense } from 'react';

function AccountContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const defaultTab = searchParams.get('tab') || 'orders';
  
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const [orders, setOrders] = useState<any[]>([]);

  useEffect(() => {
    const fetchUserData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
        return;
      }

      // Fetch Profile for Role
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

      setUser({ ...user, role: profile?.role });

      // Fetch Orders
      const { data: ordersData, error } = await supabase
        .from('orders')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (!error) {
        setOrders(ordersData || []);
      }
      
      setLoading(false);
    };
    fetchUserData();
  }, [router]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  if (loading) return <div className="flex justify-center py-20"><Spin size="large" /></div>;

  const columns = [
    { title: 'หมายเลขคำสั่งซื้อ', dataIndex: 'id', key: 'id', render: (id: number) => `ORD-${id}` },
    { 
      title: 'วันที่', 
      dataIndex: 'created_at', 
      key: 'created_at',
      render: (date: string) => new Date(date).toLocaleDateString('th-TH')
    },
    { 
      title: 'สินค้า', 
      dataIndex: 'items', 
      key: 'items',
      render: (items: any[]) => Array.isArray(items) ? items.map(i => i.name).join(', ') : '-'
    },
    { title: 'ยอดรวม', dataIndex: 'total_price', key: 'total_price', render: (val: number) => `฿${val.toLocaleString()}` },
    { 
      title: 'สถานะ', 
      dataIndex: 'status', 
      key: 'status',
      render: (status: string) => {
        let color = 'default';
        let label = status;
        const s = status.toLowerCase();
        if (s === 'pending') { color = 'orange'; label = 'รอชำระเงิน'; }
        if (s === 'paid') { color = 'blue'; label = 'ชำระเงินแล้ว'; }
        if (s === 'preparing') { color = 'cyan'; label = 'กำลังเตรียมจัดส่ง'; }
        if (s === 'shipped') { color = 'purple'; label = 'จัดส่งแล้ว'; }
        if (s === 'completed') { color = 'green'; label = 'สำเร็จ'; }
        if (s === 'cancelled') { color = 'red'; label = 'ยกเลิก'; }
        if (s === 'returned') { color = 'magenta'; label = 'ตีกลับ'; }
        if (s === 'refunded') { color = 'volcano'; label = 'คืนเงิน'; }
        return <Tag color={color}>{label}</Tag>;
      }
    },
    {
      title: 'การจัดส่ง',
      key: 'shipping',
      render: (_: any, record: any) => (
        record.status === 'shipped' || record.status === 'completed' ? (
          <div className="text-sm">
            <div className="font-bold">{record.carrier_name || '-'}</div>
            <div className="text-muted-foreground">{record.tracking_number || '-'}</div>
            {record.shipped_at && (
              <div className="text-xs text-gray-500 mt-1">
                {new Date(record.shipped_at).toLocaleString('th-TH', { 
                  year: 'numeric', month: 'short', day: 'numeric', 
                  hour: '2-digit', minute: '2-digit' 
                })}
              </div>
            )}
          </div>
        ) : '-'
      )
    }
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white p-6 rounded-xl border border-border mb-8 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Avatar size={64} icon={<UserOutlined />} className="bg-primary" />
          <div>
            <h1 className="text-2xl font-bold">{user?.user_metadata?.full_name || 'User'}</h1>
            <p className="text-muted-foreground">{user?.email}</p>
            {user?.role === 'admin' && (
              <Tag color="gold" className="mt-2">Admin Account</Tag>
            )}
          </div>
        </div>
        <div className="flex gap-3">
          {user?.role === 'admin' && (
            <Button type="primary" onClick={() => router.push('/admin/dashboard')}>
              Go to Admin Dashboard
            </Button>
          )}
          <Button danger icon={<LogoutOutlined />} onClick={handleLogout}>ออกจากระบบ</Button>
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl border border-border">
        <Tabs
          defaultActiveKey={defaultTab}
          items={[
            {
              key: 'orders',
              label: (<span><ShoppingOutlined /> ประวัติการสั่งซื้อ</span>),
              children: (
                <Table dataSource={orders} columns={columns} rowKey="id" pagination={false} />
              ),
            },
            {
              key: 'profile',
              label: (<span><UserOutlined /> ข้อมูลส่วนตัว</span>),
              children: (
                <div className="py-4 text-center text-muted-foreground">
                  ยังไม่มีข้อมูลเพิ่มเติม
                </div>
              ),
            },
          ]}
        />
      </div>
    </div>
  );
}

export default function AccountPage() {
  return (
    <Suspense fallback={<div className="flex justify-center py-20"><Spin size="large" /></div>}>
      <AccountContent />
    </Suspense>
  );
}
