"use client";
import { useEffect, useState } from 'react';
import { Table, Button, Space, Input, Modal, Form, Select, InputNumber, DatePicker, Switch, Tag, App } from 'antd';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import { supabase } from '@/lib/supabaseClient';
import dayjs from 'dayjs';

interface Coupon {
  id: string;
  code: string;
  discount_type: 'fixed' | 'percent';
  discount_value: number;
  min_spend: number;
  usage_limit: number | null;
  used_count: number;
  expires_at: string | null;
  is_active: boolean;
}

export default function AdminCouponsPage() {
  const { message } = App.useApp();
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = Form.useForm();

  useEffect(() => {
    void fetchCoupons();
  }, []);

  const fetchCoupons = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('coupons')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching coupons:', error);
      // Don't show error to user immediately as table might not exist yet
    } else {
      setCoupons(data || []);
    }
    setLoading(false);
  };

  const handleSave = async (values: any) => {
    const couponData = {
      code: values.code.toUpperCase(),
      discount_type: values.discount_type,
      discount_value: values.discount_value,
      min_spend: values.min_spend || 0,
      usage_limit: values.usage_limit || null,
      expires_at: values.expires_at ? values.expires_at.toISOString() : null,
      is_active: values.is_active
    };

    const { error } = await supabase
      .from('coupons')
      .insert([couponData]);

    if (error) {
      message.error('Failed to create coupon: ' + error.message);
    } else {
      message.success('Coupon created successfully');
      setIsModalOpen(false);
      form.resetFields();
      void fetchCoupons();
    }
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase
      .from('coupons')
      .delete()
      .eq('id', id);

    if (error) {
      message.error('Failed to delete coupon');
    } else {
      message.success('Coupon deleted');
      void fetchCoupons();
    }
  };

  const columns = [
    { title: 'Code', dataIndex: 'code', key: 'code', render: (text: string) => <span className="font-bold font-mono">{text}</span> },
    { 
      title: 'Discount', 
      key: 'discount', 
      render: (_: unknown, record: Coupon) => (
        <Tag color="blue">
          {record.discount_type === 'fixed' ? `฿${record.discount_value}` : `${record.discount_value}%`}
        </Tag>
      )
    },
    { title: 'Min Spend', dataIndex: 'min_spend', key: 'min_spend', render: (val: number) => `฿${val.toLocaleString()}` },
    { 
      title: 'Usage', 
      key: 'usage', 
      render: (_: unknown, record: Coupon) => (
        <span>{record.used_count} / {record.usage_limit || '∞'}</span>
      )
    },
    { 
      title: 'Expires', 
      dataIndex: 'expires_at', 
      key: 'expires',
      render: (date: string) => date ? new Date(date).toLocaleDateString() : 'Never'
    },
    { 
      title: 'Status', 
      dataIndex: 'is_active', 
      key: 'status',
      render: (active: boolean) => active ? <Tag color="green">Active</Tag> : <Tag color="red">Inactive</Tag>
    },
    {
      title: 'Action',
      key: 'action',
      render: (_: unknown, record: Coupon) => (
        <Button danger icon={<DeleteOutlined />} size="small" onClick={() => handleDelete(record.id)} />
      )
    }
  ];

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold m-0">Coupon Management</h1>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => setIsModalOpen(true)}>
          Create Coupon
        </Button>
      </div>

      <Table 
        dataSource={coupons} 
        columns={columns} 
        rowKey="id" 
        loading={loading} 
      />

      <Modal
        title="Create New Coupon"
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        onOk={() => form.submit()}
      >
        <Form form={form} layout="vertical" onFinish={handleSave} initialValues={{ is_active: true, discount_type: 'fixed' }}>
          <Form.Item name="code" label="Coupon Code" rules={[{ required: true }]}>
            <Input placeholder="e.g. SUMMER2025" />
          </Form.Item>
          
          <Space className="w-full">
            <Form.Item name="discount_type" label="Type" rules={[{ required: true }]}>
              <Select style={{ width: 120 }}>
                <Select.Option value="fixed">Fixed (฿)</Select.Option>
                <Select.Option value="percent">Percent (%)</Select.Option>
              </Select>
            </Form.Item>
            <Form.Item name="discount_value" label="Value" rules={[{ required: true }]}>
              <InputNumber min={0} />
            </Form.Item>
          </Space>

          <Form.Item name="min_spend" label="Minimum Spend">
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item name="usage_limit" label="Usage Limit (Optional)">
            <InputNumber min={1} style={{ width: '100%' }} placeholder="Leave empty for unlimited" />
          </Form.Item>

          <Form.Item name="expires_at" label="Expiry Date">
            <DatePicker style={{ width: '100%' }} showTime />
          </Form.Item>

          <Form.Item name="is_active" label="Active Status" valuePropName="checked">
            <Switch />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
