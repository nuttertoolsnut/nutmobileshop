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
  
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
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

  const getStatusInfo = (status: string) => {
    const s = status.toLowerCase();
    switch (s) {
      case 'pending': return { color: 'orange', label: 'รอชำระเงิน' };
      case 'paid': return { color: 'blue', label: 'ชำระเงินแล้ว' };
      case 'preparing': return { color: 'cyan', label: 'กำลังเตรียมจัดส่ง' };
      case 'shipped': return { color: 'purple', label: 'จัดส่งแล้ว' };
      case 'completed': return { color: 'green', label: 'สำเร็จ' };
      case 'cancelled': return { color: 'red', label: 'ยกเลิก' };
      case 'returned': return { color: 'magenta', label: 'ตีกลับ' };
      case 'refunded': return { color: 'volcano', label: 'คืนเงิน' };
      default: return { color: 'default', label: status };
    }
  };

  const columns = [
    { title: 'หมายเลขคำสั่งซื้อ', dataIndex: 'id', key: 'id', render: (id: number) => <span className="font-medium">ORD-{id}</span> },
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
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      render: (items: any[]) => (
        <div className="max-w-[200px] truncate">
          {Array.isArray(items) ? items.map(i => i.name).join(', ') : '-'}
        </div>
      )
    },
    { title: 'ยอดรวม', dataIndex: 'total_price', key: 'total_price', render: (val: number) => `฿${val.toLocaleString()}` },
    { 
      title: 'สถานะ', 
      dataIndex: 'status', 
      key: 'status',
      render: (status: string) => {
        const { color, label } = getStatusInfo(status);
        return <Tag color={color}>{label}</Tag>;
      }
    },
    {
      title: 'การจัดส่ง',
      key: 'shipping',
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      render: (_: any, record: any) => (
        record.status === 'shipped' || record.status === 'completed' ? (
          <div className="text-sm">
            <div className="font-bold">{record.carrier_name || '-'}</div>
            <div className="text-muted-foreground">{record.tracking_number || '-'}</div>
          </div>
        ) : '-'
      )
    }
  ];

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const MobileOrderCard = ({ order }: { order: any }) => {
    const { color, label } = getStatusInfo(order.status);
    return (
      <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm mb-4 transition-all hover:shadow-md">
        <div className="flex justify-between items-start mb-4">
          <div>
            <div className="font-bold text-gray-900">ORD-{order.id}</div>
            <div className="text-xs text-gray-500 mt-1">
              {new Date(order.created_at).toLocaleDateString('th-TH', {
                year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
              })}
            </div>
          </div>
          <Tag color={color} className="m-0 px-3 py-1 rounded-full text-xs font-medium border-0">
            {label}
          </Tag>
        </div>
        
        <div className="border-t border-dashed border-gray-200 py-4 space-y-3">
          {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
          {Array.isArray(order.items) && order.items.map((item: any, idx: number) => (
            <div key={idx} className="flex justify-between items-center text-sm">
              <div className="flex-1 pr-4">
                <span className="text-gray-700 line-clamp-1">{item.name}</span>
              </div>
              <div className="text-gray-500 whitespace-nowrap">x{item.quantity || 1}</div>
            </div>
          ))}
        </div>

        <div className="border-t border-gray-100 pt-4 flex justify-between items-center">
          <div className="text-sm text-gray-500">ยอดสุทธิ</div>
          <div className="text-xl font-bold text-primary">฿{order.total_price.toLocaleString()}</div>
        </div>

        {(order.status === 'shipped' || order.status === 'completed') && (
          <div className="mt-4 bg-gray-50 p-3 rounded-lg text-sm">
            <div className="flex items-center gap-2 text-gray-700 font-medium mb-1">
              <span role="img" aria-label="truck">🚚</span> ข้อมูลการจัดส่ง
            </div>
            <div className="flex justify-between text-gray-600">
              <span>{order.carrier_name || 'ไม่ระบุขนส่ง'}</span>
              <span className="font-mono">{order.tracking_number || '-'}</span>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="container mx-auto px-4 py-6 max-w-5xl">
      {/* Profile Header */}
      <div className="bg-gradient-to-r from-white to-gray-50 p-6 rounded-2xl border border-gray-100 shadow-sm mb-8 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex flex-col md:flex-row items-center gap-5 text-center md:text-left">
          <Avatar size={80} icon={<UserOutlined />} className="bg-primary shadow-md" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{user?.user_metadata?.full_name || 'User'}</h1>
            <p className="text-gray-500">{user?.email}</p>
            {user?.role === 'admin' && (
              <Tag color="gold" className="mt-2 rounded-full px-3 border-0">Admin Account</Tag>
            )}
          </div>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          {user?.role === 'admin' && (
            <Button type="primary" onClick={() => router.push('/admin/dashboard')} className="h-10 rounded-lg">
              Admin Dashboard
            </Button>
          )}
          <Button danger icon={<LogoutOutlined />} onClick={handleLogout} className="h-10 rounded-lg">
            ออกจากระบบ
          </Button>
        </div>
      </div>

      <div className="bg-white md:p-6 rounded-2xl md:border border-gray-100 md:shadow-sm min-h-[400px]">
        <Tabs
          defaultActiveKey={defaultTab}
          items={[
            {
              key: 'orders',
              label: (
                <span className="flex items-center gap-2 text-base px-2">
                  <ShoppingOutlined /> 
                  <span>ประวัติการสั่งซื้อ</span>
                </span>
              ),
              children: (
                <div className="mt-4">
                  {/* Desktop View */}
                  <div className="hidden md:block">
                    <Table 
                      dataSource={orders} 
                      columns={columns} 
                      rowKey="id" 
                      pagination={{ pageSize: 10 }} 
                    />
                  </div>
                  
                  {/* Mobile View */}
                  <div className="md:hidden space-y-4">
                    {orders.length > 0 ? (
                      orders.map(order => <MobileOrderCard key={order.id} order={order} />)
                    ) : (
                      <div className="text-center py-10 text-gray-400">
                        <ShoppingOutlined className="text-4xl mb-2" />
                        <p>ไม่มีประวัติการสั่งซื้อ</p>
                      </div>
                    )}
                  </div>
                </div>
              ),
            },
            {
              key: 'profile',
              label: (
                <span className="flex items-center gap-2 text-base px-2">
                  <UserOutlined /> 
                  <span>ข้อมูลส่วนตัว</span>
                </span>
              ),
              children: (
                <div className="py-10 text-center text-gray-400 bg-gray-50 rounded-xl border border-dashed border-gray-200 m-4">
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
