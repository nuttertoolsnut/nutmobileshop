"use client";
import { useEffect, useState } from 'react';
import { Table, Tag, Button, App, Input, Modal, Spin } from 'antd';
import { EyeOutlined, ScanOutlined } from '@ant-design/icons';
import { Html5QrcodeScanner } from 'html5-qrcode';
import Link from 'next/link';
import { supabase } from '@/lib/supabaseClient';

interface Order {
  id: number;
  created_at: string;
  shipping_address: string;
  total_price: number;
  status: string;
  shipped_at?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  slip_data?: any;
}

export default function AdminOrdersPage() {
  const { message, modal } = App.useApp();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [isScanModalOpen, setIsScanModalOpen] = useState(false);

  useEffect(() => {
    let scanner: Html5QrcodeScanner | null = null;

    if (isScanModalOpen) {
      const timer = setTimeout(() => {
        if (!document.getElementById('reader')) return;

        scanner = new Html5QrcodeScanner(
          "reader",
          { fps: 10, qrbox: { width: 250, height: 250 } },
          /* verbose= */ false
        );
        
        scanner.render((decodedText) => {
          setSearchText(decodedText);
          setIsScanModalOpen(false);
          if (scanner) {
             scanner.clear().catch(console.error);
          }
          message.success(`Scanned: ${decodedText}`);
        }, () => {
          // console.warn(error);
        });
      }, 300); // Wait for Modal animation

      return () => {
        clearTimeout(timer);
        if (scanner) {
          scanner.clear().catch(error => console.error("Failed to clear scanner", error));
        }
      };
    }
  }, [isScanModalOpen, message]);

  useEffect(() => {
    const fetchOrders = async () => {
      const { data, error } = await supabase
        .from('orders')
        .select('*, profiles(full_name)')
        .order('created_at', { ascending: false });

      if (error) {
        message.error('Error fetching orders: ' + error.message);
      } else {
        setOrders(data || []);
      }
      setLoading(false);
    };

    void fetchOrders();
  }, [message]);

  const filteredOrders = orders.filter(order => 
    order.id.toString().includes(searchText) ||
    order.shipping_address?.toLowerCase().includes(searchText.toLowerCase())
  );

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
    { title: 'Order ID', dataIndex: 'id', key: 'id', render: (id: number) => <span className="font-medium">ORD-{id}</span> },
    { 
      title: 'Date', 
      dataIndex: 'created_at', 
      key: 'created_at',
      render: (date: string) => new Date(date).toLocaleDateString('th-TH', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
    },
    { title: 'Customer', dataIndex: 'shipping_address', key: 'customer', render: (addr: string) => <span className="truncate max-w-[150px] block" title={addr}>{addr?.split(' ')[0] || 'Guest'}</span> },
    { title: 'Total', dataIndex: 'total_price', key: 'total', render: (val: number) => `฿${val.toLocaleString()}` },
    {
      title: 'Status', 
      dataIndex: 'status', 
      key: 'status',
      render: (status: string) => {
        const { color, label } = getStatusInfo(status);
        return <Tag color={color}>{label}</Tag>;
      }
    },
    {
      title: 'Shipped At',
      dataIndex: 'shipped_at',
      key: 'shipped_at',
      render: (date: string) => date ? new Date(date).toLocaleDateString('th-TH', { 
        year: 'numeric', month: 'short', day: 'numeric', 
        hour: '2-digit', minute: '2-digit' 
      }) : '-'
    },
    {
      title: 'Payment Slip',
      key: 'slip_info',
      render: (_: unknown, record: Order) => {
        if (!record.slip_data) return <span className="text-gray-400">-</span>;
        
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const data = record.slip_data as any;
        const isSuccess = data.success !== false;
        
        return (
          <div className="flex flex-col gap-1">
            <div>
               {isSuccess ? <Tag color="green">Verified</Tag> : <Tag color="red">Error</Tag>}
            </div>
            {data.data && (
               <div className="text-xs text-gray-500">
                 {data.data.receivingBank} • ฿{data.data.amount?.toLocaleString()}
               </div>
            )}
            <Button 
              type="link" 
              size="small" 
              className="p-0 h-auto text-xs text-left"
              onClick={() => {
                modal.info({
                  title: 'Slip Data (JSON)',
                  width: 600,
                  content: (
                    <div className="max-h-[400px] overflow-auto">
                      <pre className="text-xs bg-gray-50 p-2 rounded border">
                        {JSON.stringify(record.slip_data, null, 2)}
                      </pre>
                    </div>
                  ),
                  maskClosable: true,
                });
              }}
            >
              View JSON
            </Button>
          </div>
        );
      }
    },
    {
      title: 'Action',
      key: 'action',
      render: (_: unknown, record: Order) => (
        <Link href={`/admin/orders/${record.id}`}>
          <Button icon={<EyeOutlined />} size="small">View</Button>
        </Link>
      ),
    },
  ];

  const MobileOrderCard = ({ order }: { order: Order }) => {
    const { color, label } = getStatusInfo(order.status);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const slipData = order.slip_data as any;
    const isSlipVerified = slipData && slipData.success !== false;

    return (
      <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm mb-4">
        <div className="flex justify-between items-start mb-3">
          <div>
            <div className="font-bold text-gray-900 text-lg">ORD-{order.id}</div>
            <div className="text-xs text-gray-500">
              {new Date(order.created_at).toLocaleDateString('th-TH', {
                year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
              })}
            </div>
          </div>
          <Tag color={color} className="m-0 px-3 py-1 rounded-full text-xs font-medium border-0">
            {label}
          </Tag>
        </div>

        <div className="flex flex-col gap-2 mb-4">
          <div className="flex justify-between text-sm">
             <span className="text-gray-500">Customer:</span>
             <span className="font-medium text-gray-900 truncate max-w-[200px]">{order.shipping_address?.split(' ')[0] || 'Guest'}</span>
          </div>
          <div className="flex justify-between text-sm">
             <span className="text-gray-500">Total:</span>
             <span className="font-bold text-primary text-base">฿{order.total_price.toLocaleString()}</span>
          </div>
          {order.shipped_at && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Shipped:</span>
              <span className="text-gray-700">{new Date(order.shipped_at).toLocaleDateString('th-TH')}</span>
            </div>
          )}
        </div>

        {slipData && (
          <div className="bg-gray-50 p-3 rounded-lg mb-4 text-sm border border-gray-100">
            <div className="flex items-center justify-between mb-1">
              <span className="text-gray-500">Payment Slip</span>
              {isSlipVerified ? <Tag color="green" className="m-0">Verified</Tag> : <Tag color="red" className="m-0">Error</Tag>}
            </div>
            {slipData.data && (
               <div className="text-xs text-gray-600">
                 {slipData.data.receivingBank} • ฿{slipData.data.amount?.toLocaleString()}
               </div>
            )}
          </div>
        )}

        <Link href={`/admin/orders/${order.id}`} className="block">
          <Button type="primary" ghost block icon={<EyeOutlined />}>
            View Details
          </Button>
        </Link>
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 m-0">Order Management</h1>
          <p className="text-gray-500 text-sm mt-1">Manage and track all customer orders</p>
        </div>
        <div className="flex w-full md:w-auto gap-2">
          <Input.Search 
            placeholder="Search Order ID or Customer..." 
            allowClear 
            value={searchText}
            onSearch={value => setSearchText(value)}
            onChange={e => setSearchText(e.target.value)}
            className="w-full md:w-[300px]"
          />
          <Button icon={<ScanOutlined />} onClick={() => setIsScanModalOpen(true)} className="flex-shrink-0">
            Scan
          </Button>
        </div>
      </div>
      
      <Modal
        title="Scan Barcode"
        open={isScanModalOpen}
        onCancel={() => setIsScanModalOpen(false)}
        footer={null}
        destroyOnHidden
        centered
      >
        <div id="reader" className="w-full overflow-hidden rounded-lg"></div>
        <p className="text-center mt-4 text-gray-500">Point your camera at a barcode or QR code</p>
      </Modal>

      {/* Desktop View */}
      <div className="hidden md:block bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
        <Table 
          dataSource={filteredOrders} 
          columns={columns} 
          rowKey="id" 
          loading={loading} 
          pagination={{ pageSize: 10 }}
        />
      </div>

      {/* Mobile View */}
      <div className="md:hidden">
        {loading ? (
          <div className="flex justify-center py-10"><Spin size="large" /></div>
        ) : filteredOrders.length > 0 ? (
          filteredOrders.map(order => <MobileOrderCard key={order.id} order={order} />)
        ) : (
          <div className="text-center py-10 text-gray-400 bg-white rounded-xl border border-dashed">
            <p>No orders found</p>
          </div>
        )}
      </div>
    </div>
  );
}
