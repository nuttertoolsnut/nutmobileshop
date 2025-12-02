"use client";
import { useEffect, useState, useCallback } from 'react';
import { Card, Statistic, Spin } from 'antd';
import { ShoppingOutlined, DollarOutlined, UserOutlined, RiseOutlined } from '@ant-design/icons';
import { supabase } from '@/lib/supabaseClient';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalSales: 0,
    totalOrders: 0,
    newUsers: 0,
    growth: 0
  });
  const [salesData, setSalesData] = useState<{name: string; sales: number}[]>([]);
  const [topProducts, setTopProducts] = useState<{name: string; price: number}[]>([]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    
    // 1. Fetch Orders
    const { data: orders } = await supabase
      .from('orders')
      .select('total_price, created_at, status')
      .neq('status', 'Cancelled');

    // 2. Fetch Users
    const { count: userCount } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true });

    if (orders) {
      const totalSales = orders.reduce((sum, order) => sum + order.total_price, 0);
      
      // Calculate Sales by Date (Last 7 days)
      const salesByDate: Record<string, number> = {};
      orders.forEach(order => {
        const date = new Date(order.created_at).toLocaleDateString('en-GB'); // DD/MM/YYYY
        salesByDate[date] = (salesByDate[date] || 0) + order.total_price;
      });

      const chartData = Object.keys(salesByDate).map(date => ({
        name: date,
        sales: salesByDate[date]
      })).slice(-7); // Last 7 entries

      setStats({
        totalSales,
        totalOrders: orders.length,
        newUsers: userCount || 0,
        growth: 12.5 // Mock growth for now
      });
      setSalesData(chartData);
    }

    // 3. Fetch Top Products (Mock logic as we don't have order_items aggregation easily without RPC)
    // For now, we'll just show recent products
    const { data: products } = await supabase.from('products').select('name, price').limit(5);
    setTopProducts(products || []);

    setLoading(false);
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void fetchData();
  }, [fetchData]);


  if (loading) return <div className="flex justify-center py-20"><Spin size="large" /></div>;

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard Overview</h1>
        <p className="text-gray-500">Welcome back! Here&apos;s what&apos;s happening with your store today.</p>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card bordered={false} className="shadow-sm hover:shadow-md transition-shadow">
          <Statistic 
            title={<span className="text-gray-500 font-medium">Total Sales</span>}
            value={stats.totalSales} 
            precision={2} 
            prefix={<DollarOutlined className="text-primary bg-primary/10 p-2 rounded-lg mr-2" />} 
            suffix="THB" 
            valueStyle={{ fontWeight: 600 }}
          />
        </Card>
        <Card bordered={false} className="shadow-sm hover:shadow-md transition-shadow">
          <Statistic 
            title={<span className="text-gray-500 font-medium">Total Orders</span>}
            value={stats.totalOrders} 
            prefix={<ShoppingOutlined className="text-blue-500 bg-blue-50 p-2 rounded-lg mr-2" />} 
            valueStyle={{ fontWeight: 600 }}
          />
        </Card>
        <Card bordered={false} className="shadow-sm hover:shadow-md transition-shadow">
          <Statistic 
            title={<span className="text-gray-500 font-medium">Total Users</span>}
            value={stats.newUsers} 
            prefix={<UserOutlined className="text-purple-500 bg-purple-50 p-2 rounded-lg mr-2" />} 
            valueStyle={{ fontWeight: 600 }}
          />
        </Card>
        <Card bordered={false} className="shadow-sm hover:shadow-md transition-shadow">
          <Statistic 
            title={<span className="text-gray-500 font-medium">Growth</span>}
            value={stats.growth} 
            precision={2} 
            valueStyle={{ color: '#3f8600', fontWeight: 600 }} 
            prefix={<RiseOutlined className="text-green-500 bg-green-50 p-2 rounded-lg mr-2" />} 
            suffix="%" 
          />
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card title="Sales Trend (Last 7 Days)" bordered={false} className="shadow-sm">
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={salesData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#888', fontSize: 12 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#888', fontSize: 12 }} />
                <Tooltip 
                  cursor={{ fill: '#f3f4f6' }}
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="sales" fill="#f97316" radius={[4, 4, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
        
        <Card title="Top Products (Recent)" bordered={false} className="shadow-sm">
          <div className="space-y-4">
            {topProducts.map((p, i) => (
              <div key={i} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-gray-400 font-medium border border-gray-200">
                    {i + 1}
                  </div>
                  <span className="font-medium text-gray-700">{p.name}</span>
                </div>
                <span className="font-bold text-primary">฿{p.price.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
