"use client";
import { useEffect, useState, useCallback } from 'react';
import { Table, Tag, Button, Space, Input, Modal, Avatar } from 'antd';
import { UserOutlined, ShoppingOutlined } from '@ant-design/icons';
import { supabase } from '@/lib/supabaseClient';

interface Profile {
  id: string;
  full_name: string;
  email: string; // Assuming email is in profiles or we fetch it from auth (but auth is hard to fetch in bulk). 
                 // Actually, profiles usually stores email or we might not have it easily if not in profiles.
                 // Let's check if profiles has email. If not, we might just use full_name.
  avatar_url?: string;
  address?: string;
  phone?: string;
}

interface Order {
  id: number;
  user_id: string;
  total_price: number;
  created_at: string;
  status: string;
}

interface CustomerStat extends Profile {
  totalOrders: number;
  totalSpent: number;
  lastOrderDate: string | null;
}

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<CustomerStat[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerStat | null>(null);
  const [customerOrders, setCustomerOrders] = useState<Order[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    
    // Fetch Profiles
    const { data: profiles, error: profileError } = await supabase
      .from('profiles')
      .select('*');

    if (profileError) {
      console.error('Error fetching profiles:', profileError);
    }

    // Fetch Orders
    const { data: orders, error: orderError } = await supabase
      .from('orders')
      .select('id, user_id, total_price, created_at, status')
      .order('created_at', { ascending: false });

    if (orderError) {
      console.error('Error fetching orders:', orderError);
    }

    if (profiles && orders) {
      const stats = profiles.map(profile => {
        const userOrders = orders.filter(o => o.user_id === profile.id);
        const totalSpent = userOrders.reduce((sum, o) => sum + (o.status !== 'cancelled' ? o.total_price : 0), 0);
        const lastOrder = userOrders.length > 0 ? userOrders[0].created_at : null;

        return {
          ...profile,
          totalOrders: userOrders.length,
          totalSpent,
          lastOrderDate: lastOrder
        };
      });
      setCustomers(stats);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void fetchData();
  }, [fetchData]);


  const handleViewHistory = (customer: CustomerStat) => {
    setSelectedCustomer(customer);
    // Fetch specific orders for this customer (or filter from existing if we have all)
    // We already fetched all orders, so let's just filter again or fetch fresh if needed.
    // For scalability, fetching fresh is better, but for now filtering is fine.
    // Let's fetch fresh to be safe and get more details if needed.
    
    const fetchCustomerOrders = async () => {
      const { data } = await supabase
        .from('orders')
        .select('*')
        .eq('user_id', customer.id)
        .order('created_at', { ascending: false });
      setCustomerOrders(data || []);
    };
    void fetchCustomerOrders();
    setIsModalOpen(true);
  };

  const filteredCustomers = customers.filter(c => 
    c.full_name?.toLowerCase().includes(searchText.toLowerCase()) ||
    c.id.toLowerCase().includes(searchText.toLowerCase())
  );

  const columns = [
    {
      title: 'Customer',
      key: 'customer',
      render: (_: unknown, record: CustomerStat) => (
        <Space>
          <Avatar icon={<UserOutlined />} src={record.avatar_url} />
          <div>
            <div className="font-bold">{record.full_name || 'Unknown'}</div>
            <div className="text-xs text-gray-500">{record.id.slice(0, 8)}...</div>
          </div>
        </Space>
      )
    },
    { 
      title: 'Total Orders', 
      dataIndex: 'totalOrders', 
      key: 'totalOrders', 
      sorter: (a: CustomerStat, b: CustomerStat) => a.totalOrders - b.totalOrders 
    },
    { 
      title: 'Total Spent', 
      dataIndex: 'totalSpent', 
      key: 'totalSpent', 
      render: (val: number) => `฿${val.toLocaleString()}`,
      sorter: (a: CustomerStat, b: CustomerStat) => a.totalSpent - b.totalSpent
    },
    { 
      title: 'Last Order', 
      dataIndex: 'lastOrderDate', 
      key: 'lastOrderDate',
      render: (date: string) => date ? new Date(date).toLocaleDateString('th-TH') : '-',
      sorter: (a: CustomerStat, b: CustomerStat) => new Date(a.lastOrderDate || 0).getTime() - new Date(b.lastOrderDate || 0).getTime()
    },
    {
      title: 'Action',
      key: 'action',
      render: (_: unknown, record: CustomerStat) => (
        <Button icon={<ShoppingOutlined />} onClick={() => handleViewHistory(record)}>
          History
        </Button>
      )
    }
  ];

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold m-0">Customer Management</h1>
        <Input.Search 
          placeholder="Search Name or ID..." 
          allowClear 
          value={searchText}
          onChange={e => setSearchText(e.target.value)}
          style={{ width: 300 }}
        />
      </div>

      <Table 
        dataSource={filteredCustomers} 
        columns={columns} 
        rowKey="id" 
        loading={loading} 
      />

      <Modal
        title={`Order History: ${selectedCustomer?.full_name}`}
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        width={800}
        footer={null}
      >
        <Table
          dataSource={customerOrders}
          rowKey="id"
          pagination={{ pageSize: 5 }}
          columns={[
            { title: 'Order ID', dataIndex: 'id', render: (id) => `ORD-${id}` },
            { title: 'Date', dataIndex: 'created_at', render: (d) => new Date(d).toLocaleDateString('th-TH') },
            { title: 'Amount', dataIndex: 'total_price', render: (v) => `฿${v.toLocaleString()}` },
            { 
              title: 'Status', 
              dataIndex: 'status',
              render: (status) => {
                let color = 'default';
                if (status === 'paid') color = 'blue';
                if (status === 'completed') color = 'green';
                if (status === 'cancelled') color = 'red';
                return <Tag color={color}>{status}</Tag>;
              }
            }
          ]}
        />
      </Modal>
    </div>
  );
}
