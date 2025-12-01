"use client";
import { useEffect, useState } from 'react';
import { Card, Statistic, Row, Col, Spin } from 'antd';
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
  const [salesData, setSalesData] = useState<any[]>([]);
  const [topProducts, setTopProducts] = useState<any[]>([]);

  useEffect(() => {
    void fetchData();
  }, []);

  const fetchData = async () => {
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
  };

  if (loading) return <div className="p-10 text-center"><Spin size="large" /></div>;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Dashboard Overview</h1>
      
      <Row gutter={16}>
        <Col span={6}>
          <Card>
            <Statistic 
              title="Total Sales" 
              value={stats.totalSales} 
              precision={2} 
              prefix={<DollarOutlined />} 
              suffix="THB" 
              valueStyle={{ color: '#3f8600' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic 
              title="Orders" 
              value={stats.totalOrders} 
              prefix={<ShoppingOutlined />} 
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic 
              title="Total Users" 
              value={stats.newUsers} 
              prefix={<UserOutlined />} 
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic 
              title="Growth" 
              value={stats.growth} 
              precision={2} 
              valueStyle={{ color: '#cf1322' }} 
              prefix={<RiseOutlined />} 
              suffix="%" 
            />
          </Card>
        </Col>
      </Row>

      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card title="Sales Trend (Last 7 Days)">
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={salesData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="sales" fill="#f97316" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
        
        <Card title="Top Products (Recent)">
          <ul>
            {topProducts.map((p, i) => (
              <li key={i} className="flex justify-between py-2 border-b last:border-0">
                <span>{p.name}</span>
                <span className="font-bold">฿{p.price.toLocaleString()}</span>
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </div>
  );
}
