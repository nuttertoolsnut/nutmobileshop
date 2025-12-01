"use client";
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Card, Descriptions, Tag, Button, Select, Divider, List, Image as AntImage, App, Spin, Space, Input } from 'antd';
import { ArrowLeftOutlined, SaveOutlined, PlusOutlined, DeleteOutlined, PrinterOutlined } from '@ant-design/icons';
import { supabase } from '@/lib/supabaseClient';
import Link from 'next/link';

interface OrderItem {
  name: string;
  variant: string;
  quantity: number;
  price: number;
}

interface OrderDetail {
  id: number;
  status: string;
  items: OrderItem[];
  total_price: number;
  payment_method: string;
  shipping_address: string;
  created_at: string;
  slip_url?: string;
  tracking_number?: string;
  carrier_name?: string;
  shipped_at?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  slip_data?: any;
}

export default function AdminOrderDetailPage() {
  const { message, modal } = App.useApp();
  const params = useParams();
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [status, setStatus] = useState('');
  const [trackingNumber, setTrackingNumber] = useState('');
  const [carrierName, setCarrierName] = useState('');

  const [carriers, setCarriers] = useState<{ id: number; name: string }[]>([]);
  const [newCarrierName, setNewCarrierName] = useState('');

  useEffect(() => {
    if (params.id) {
      void fetchOrder();
    }
    void fetchCarriers();
  }, [params.id]);

  const fetchCarriers = async () => {
    const { data } = await supabase.from('carriers').select('*').order('name');
    if (data) setCarriers(data);
  };

  const handleAddCarrier = async (e: React.MouseEvent<HTMLButtonElement | HTMLAnchorElement>) => {
    e.preventDefault();
    if (!newCarrierName) return;
    
    const { error } = await supabase.from('carriers').insert([{ name: newCarrierName }]);
    if (error) {
      message.error('Failed to add carrier: ' + error.message);
    } else {
      message.success('Carrier added');
      setNewCarrierName('');
      void fetchCarriers();
    }
  };

  const handleDeleteCarrier = async (id: number) => {
    const { error } = await supabase.from('carriers').delete().eq('id', id);
    if (error) {
      message.error('Failed to delete carrier');
    } else {
      message.success('Carrier deleted');
      void fetchCarriers();
    }
  };

  const fetchOrder = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('id', params.id)
      .single();

    if (error) {
      message.error('Error fetching order');
    } else {
      setOrder(data);
      setStatus(data.status);
      setTrackingNumber(data.tracking_number || '');
      setCarrierName(data.carrier_name || '');
    }
    setLoading(false);
  };

  const handleUpdateStatus = async (newStatus?: string) => {
    if (!order) return;
    const statusToUpdate = newStatus || status;
    
    setUpdating(true);
    const updateData: any = { status: statusToUpdate };
    
    if (statusToUpdate === 'shipped') {
      updateData.tracking_number = trackingNumber;
      updateData.carrier_name = carrierName;
      updateData.shipped_at = new Date().toISOString();
    }

    const { error } = await supabase
      .from('orders')
      .update(updateData)
      .eq('id', order.id);

    if (error) {
      message.error('Update failed: ' + error.message);
    } else {
      message.success('Order status updated');
      void fetchOrder();
    }
    setUpdating(false);
  };

  // ... (lines 77-234)



  const handleReverify = async () => {
    if (!order || !order.slip_url) return;
    
    const loadingMessage = message.loading('Re-verifying slip...', 0);
    try {
      const response = await fetch('/api/reverify-slip', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          slipUrl: order.slip_url,
          amount: order.total_price 
        }),
      });

      const result = await response.json();
      loadingMessage(); // Dismiss loading

      if (result.success) {
        message.success('Slip re-verified successfully!');
        
        // Update local state
        const newSlipData = { success: true, data: result.data };
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        setOrder({ ...order, slip_data: newSlipData } as any);

        // Update database
        await supabase
          .from('orders')
          .update({ 
            slip_data: newSlipData,
            status: 'preparing' 
          })
          .eq('id', order.id);
          
        setStatus('preparing');
        setOrder({ ...order, slip_data: newSlipData, status: 'preparing' } as any);
          
      } else {
        message.error('Re-verification failed: ' + result.message);
        // Optionally update with error info
        const errorSlipData = { success: false, message: result.message };
         // eslint-disable-next-line @typescript-eslint/no-explicit-any
        setOrder({ ...order, slip_data: errorSlipData } as any);
        
        await supabase
          .from('orders')
          .update({ slip_data: errorSlipData })
          .eq('id', order.id);
      }
    } catch (error) {
      loadingMessage();
      console.error('Re-verify error:', error);
      message.error('Failed to connect to re-verification service');
    }
  };

  if (loading) return <div className="flex justify-center py-20"><Spin size="large" /></div>;
  if (!order) return <div>Order not found</div>;

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <Link href="/admin/orders">
          <Button icon={<ArrowLeftOutlined />}>Back</Button>
        </Link>
        <h1 className="text-2xl font-bold m-0">Order #{order.id}</h1>
        <Tag color="blue" className="text-lg px-3 py-1">
          {order.status === 'pending' && 'รอชำระเงิน'}
          {order.status === 'paid' && 'ชำระเงินแล้ว'}
          {order.status === 'preparing' && 'กำลังเตรียมจัดส่ง'}
          {order.status === 'shipped' && 'จัดส่งแล้ว'}
          {order.status === 'completed' && 'สำเร็จ'}
          {order.status === 'cancelled' && 'ยกเลิก'}
          {order.status === 'returned' && 'ตีกลับ'}
          {order.status === 'refunded' && 'คืนเงิน'}
          {!['pending', 'paid', 'preparing', 'shipped', 'completed', 'cancelled', 'returned', 'refunded'].includes(order.status) && order.status}
        </Tag>
        <Link href={`/admin/orders/${order.id}/label`} target="_blank">
          <Button icon={<PrinterOutlined />}>Print Label</Button>
        </Link>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Left Column: Order Info */}
        <div className="md:col-span-2 space-y-6">
          <Card title="Order Items">
            <div className="divide-y divide-gray-100">
              {(order.items || []).map((item, index) => (
                <div key={index} className="flex justify-between py-3">
                  <div>
                    <div className="font-medium">{item.name}</div>
                    <div className="text-sm text-muted-foreground">{item.variant} x {item.quantity}</div>
                  </div>
                  <div className="font-bold">฿{(item.price * item.quantity).toLocaleString()}</div>
                </div>
              ))}
            </div>
            <Divider />
            <div className="flex justify-between text-lg font-bold">
              <span>Total</span>
              <span className="text-primary">฿{order.total_price.toLocaleString()}</span>
            </div>
          </Card>

          <Card title="Payment Slip (Verification)">
            {order.payment_method === 'transfer' ? (
              <div className="text-center">
                {/* Placeholder for slip image - in real app would be order.slip_url */}
                <AntImage 
                  width={300}
                  src={order.slip_url || "https://via.placeholder.com/300x500?text=No+Slip"} 
                  alt="Payment Slip"
                />
                
                {/* Slip Data Display */}
                {order.slip_data && (
                  <div className="mt-4 text-left bg-gray-50 p-3 rounded border">
                    <div className="flex justify-between items-center mb-2">
                       <span className="font-bold text-sm">Verification Status:</span>
                       {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                       {(order.slip_data as any).success !== false ? <Tag color="green">Verified</Tag> : <Tag color="red">Error</Tag>}
                    </div>
                    {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                    {(order.slip_data as any).message && <div className="text-xs text-red-500 mb-2">{(order.slip_data as any).message}</div>}
                    
                    {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                    {(order.slip_data as any).data && (
                      <div className="text-sm space-y-1">
                        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                        <p><span className="text-muted-foreground">Sender:</span> {(order.slip_data as any).data.sender?.displayName}</p>
                        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                        <p><span className="text-muted-foreground">Receiver:</span> {(order.slip_data as any).data.receiver?.displayName}</p>
                        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                        <p><span className="text-muted-foreground">Amount:</span> ฿{(order.slip_data as any).data.amount?.toLocaleString()}</p>
                        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                        <p><span className="text-muted-foreground">Bank:</span> {(order.slip_data as any).data.receivingBank}</p>
                        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                        <p><span className="text-muted-foreground">Date:</span> {(order.slip_data as any).data.transDate} {(order.slip_data as any).data.transTime}</p>
                      </div>
                    )}

                    <Button 
                      type="dashed" 
                      size="small" 
                      block 
                      className="mt-3"
                      onClick={() => {
                        modal.info({
                          title: 'Slip Data (JSON)',
                          width: 600,
                          content: (
                            <div className="max-h-[400px] overflow-auto">
                              <pre className="text-xs bg-gray-50 p-2 rounded border">
                                {JSON.stringify(order.slip_data, null, 2)}
                              </pre>
                            </div>
                          ),
                          maskClosable: true,
                        });
                      }}
                    >
                      View Raw JSON
                    </Button>
                  </div>
                )}
                
                <div className="mt-4">
                   <Button type="default" block onClick={handleReverify} className="mb-4">
                     Re-verify Slip (Check Again)
                   </Button>
                </div>

                <div className="mt-4">
                  <p className="text-muted-foreground mb-2">Verify the amount and date before approving.</p>
                  <Space>
                    <Button type="primary" onClick={() => { setStatus('preparing'); handleUpdateStatus('preparing'); }}>Approve (Preparing)</Button>
                    <Button danger onClick={() => { setStatus('cancelled'); handleUpdateStatus('cancelled'); }}>Reject</Button>
                  </Space>
                </div>
              </div>
            ) : (
              <div className="text-center text-muted-foreground py-8">
                Payment Method: {order.payment_method === 'cod' ? 'Cash on Delivery' : order.payment_method}
              </div>
            )}
          </Card>
        </div>

        {/* Right Column: Actions & Customer */}
        <div className="space-y-6">
          <Card title="Update Status">
            <div className="space-y-4">
              <div className="flex gap-2">
                <Select 
                  value={status} 
                  onChange={setStatus} 
                  style={{ width: '100%' }}
                  options={[
                    { value: 'pending', label: 'รอชำระเงิน (Pending)' },
                  { value: 'paid', label: 'ชำระเงินแล้ว (Paid)' },
                  { value: 'preparing', label: 'กำลังเตรียมจัดส่ง (Preparing)' },
                  { value: 'shipped', label: 'จัดส่งแล้ว (Shipped)' },
                  { value: 'completed', label: 'สำเร็จ (Completed)' },
                  { value: 'cancelled', label: 'ยกเลิก (Cancelled)' },
                  { value: 'returned', label: 'ตีกลับ (Returned)' },
                  { value: 'refunded', label: 'คืนเงิน (Refunded)' },
                  ]}
                />
                <Button type="primary" icon={<SaveOutlined />} loading={updating} onClick={() => handleUpdateStatus()} />
              </div>

              {status === 'shipped' && (
                <div className="space-y-2 p-4 bg-gray-50 rounded border">
                  <h4 className="font-bold text-sm">Shipping Details</h4>
                  <Select 
                    placeholder="Select Carrier" 
                    value={carrierName}
                    onChange={setCarrierName}
                    style={{ width: '100%' }}
                    popupRender={(menu) => (
                      <>
                        {menu}
                        <Divider style={{ margin: '8px 0' }} />
                        <Space style={{ padding: '0 8px 4px' }}>
                          <Input
                            placeholder="New carrier name"
                            value={newCarrierName}
                            onChange={(e) => setNewCarrierName(e.target.value)}
                            onKeyDown={(e) => e.stopPropagation()}
                          />
                          <Button type="text" icon={<PlusOutlined />} onClick={handleAddCarrier}>
                            Add
                          </Button>
                        </Space>
                      </>
                    )}
                    options={carriers.map((item) => ({
                      label: (
                        <div className="flex justify-between items-center">
                          <span>{item.name}</span>
                          <Button 
                            type="text" 
                            size="small" 
                            icon={<DeleteOutlined />} 
                            danger
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteCarrier(item.id);
                            }}
                          />
                        </div>
                      ),
                      value: item.name,
                    }))}
                  />
                  <Input 
                    placeholder="Tracking Number" 
                    value={trackingNumber}
                    onChange={(e) => setTrackingNumber(e.target.value)}
                  />
                  {order.shipped_at && (
                    <div className="text-xs text-gray-500 pt-2">
                      Shipped at: {new Date(order.shipped_at).toLocaleString('th-TH', { 
                        year: 'numeric', month: 'short', day: 'numeric', 
                        hour: '2-digit', minute: '2-digit' 
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>
          </Card>

          <Card title="Customer Info">
            <Descriptions column={1} layout="vertical">
              <Descriptions.Item label="Shipping Address">
                {order.shipping_address}
              </Descriptions.Item>
              <Descriptions.Item label="Order Date">
                {new Date(order.created_at).toLocaleString('th-TH')}
              </Descriptions.Item>
            </Descriptions>
          </Card>
        </div>
      </div>
    </div>
  );
}
