"use client";
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Layout, Menu } from 'antd';
import { ShoppingOutlined, AppstoreOutlined, DashboardOutlined, HomeOutlined, UserOutlined, TagOutlined } from '@ant-design/icons';

const { Sider } = Layout;

export default function AdminSidebar() {
  const pathname = usePathname();

  const menuItems = [
    {
      key: '/admin/dashboard',
      icon: <DashboardOutlined />,
      label: <Link href="/admin/dashboard">ภาพรวม (Dashboard)</Link>,
    },
    {
      key: '/admin/products',
      icon: <AppstoreOutlined />,
      label: <Link href="/admin/products">จัดการสินค้า</Link>,
    },
    {
      key: '/admin/orders',
      icon: <ShoppingOutlined />,
      label: <Link href="/admin/orders">รายการคำสั่งซื้อ</Link>,
    },
    {
      key: '/admin/customers',
      icon: <UserOutlined />,
      label: <Link href="/admin/customers">ลูกค้า (Customers)</Link>,
    },
    {
      key: '/admin/coupons',
      icon: <TagOutlined />,
      label: <Link href="/admin/coupons">คูปอง (Coupons)</Link>,
    },
    {
      type: 'divider',
    },
    {
      key: '/',
      icon: <HomeOutlined />,
      label: <Link href="/">กลับหน้าร้าน (Home)</Link>,
    },
  ];

  // Determine selected key based on current path
  const selectedKey = menuItems.find(item => pathname.startsWith(item.key))?.key || '/admin/dashboard';

  return (
    <Sider width={250} theme="light" className="border-r border-border">
      <div className="h-16 flex items-center justify-center border-b border-border">
        <h1 className="text-xl font-bold text-primary">Admin Panel</h1>
      </div>
      <Menu
        mode="inline"
        selectedKeys={[selectedKey]}
        style={{ borderRight: 0 }}
        items={menuItems}
      />
    </Sider>
  );
}
