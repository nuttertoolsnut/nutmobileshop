"use client";
import { useEffect, useState } from 'react';
import { Table, Tag, Button, Space, App, Input, Modal } from 'antd';
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
        }, (error) => {
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
  }, [isScanModalOpen]);

  useEffect(() => {
    void fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
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

  const filteredOrders = orders.filter(order => 
    order.id.toString().includes(searchText) ||
    order.shipping_address?.toLowerCase().includes(searchText.toLowerCase())
  );

  const columns = [
    { title: 'Order ID', dataIndex: 'id', key: 'id', render: (id: number) => `ORD-${id}` },
    { 
      title: 'Date', 
      dataIndex: 'created_at', 
      key: 'created_at',
      render: (date: string) => new Date(date).toLocaleDateString('th-TH', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
    },
    { title: 'Customer', dataIndex: 'shipping_address', key: 'customer', render: (addr: string) => addr?.split(' ')[0] || 'Guest' },
    { title: 'Total', dataIndex: 'total_price', key: 'total', render: (val: number) => `฿${val.toLocaleString()}` },
    {
      title: 'Status', 
      dataIndex: 'status', 
      key: 'status',
      render: (status: string) => {
        let color = 'default';
        const s = status.toLowerCase();
        let label = status;
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
      title: 'Shipped At',
      dataIndex: 'shipped_at',
      key: 'shipped_at',
      render: (date: string) => date ? new Date(date).toLocaleDateString('th-TH', { 
        year: 'numeric', month: 'short', day: 'numeric', 
        hour: '2-digit', minute: '2-digit' 
      }) : '-'
    },
    {
      title: 'Payment Slip (Verification)',
      key: 'slip_info',
      render: (_: unknown, record: Order) => {
        if (!record.slip_data) return <span className="text-gray-400">-</span>;
        
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const data = record.slip_data as any;
        const isSuccess = data.success !== false; // Default to true if not specified or explicitly true
        
        return (
          <div className="flex flex-col gap-0">
            <div>
               {isSuccess ? <Tag color="green">Verified</Tag> : <Tag color="red">Error</Tag>}
            </div>
            {data.message && (
               <div className="text-xs text-gray-500">
                 {data.message}
               </div>
            )}
            {data.data && (
               <div className="text-xs text-gray-500">
                 {data.data.receivingBank} • ฿{data.data.amount?.toLocaleString()}
               </div>
            )}
            <Button 
              type="link" 
              size="small" 
              className="p-0 h-auto"
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

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold m-0">Order Management</h1>
        <Space>
          <Input.Search 
            placeholder="Search Order ID or Customer..." 
            allowClear 
            value={searchText}
            onSearch={value => setSearchText(value)}
            onChange={e => setSearchText(e.target.value)}
            style={{ width: 300 }}
          />
          <Button icon={<ScanOutlined />} onClick={() => setIsScanModalOpen(true)}>Scan</Button>
        </Space>
      </div>
      
      <Modal
        title="Scan Barcode"
        open={isScanModalOpen}
        onCancel={() => setIsScanModalOpen(false)}
        footer={null}
        destroyOnHidden
      >
        <div id="reader" style={{ width: '100%' }}></div>
        <p className="text-center mt-4 text-gray-500">Point your camera at a barcode or QR code</p>
      </Modal>

      <Table 
        dataSource={filteredOrders} 
        columns={columns} 
        rowKey="id" 
        loading={loading} 
      />
    </div>
  );
}
