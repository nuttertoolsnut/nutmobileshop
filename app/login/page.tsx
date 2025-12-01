"use client";
import { useState, useEffect } from 'react';
import { Form, Input, Button, Tabs, App, Divider } from 'antd';
import { UserOutlined, LockOutlined, MailOutlined, GoogleOutlined, FacebookFilled } from '@ant-design/icons';
import { supabase } from '@/lib/supabaseClient';
import { useRouter, useSearchParams } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { message } = App.useApp();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const returnUrl = searchParams.get('returnUrl');
    if (returnUrl) {
      // Optional: You could store this or just let the onLogin handle it
    }
    
    const errorMsg = searchParams.get('error');
    const debugMsg = searchParams.get('debug');
    if (errorMsg) {
      message.error(`Login Failed: ${errorMsg} ${debugMsg ? `(Debug: ${debugMsg})` : ''}`);
    }
  }, [searchParams, message]);

  const onLogin = async (values: Record<string, string>) => {
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: values.email,
      password: values.password,
    });

    if (error) {
      message.error(error.message);
    } else {
      message.success('เข้าสู่ระบบสำเร็จ');
      const returnUrl = searchParams.get('returnUrl');
      // Force full reload to ensure cookies are synced with middleware
      window.location.href = returnUrl || '/account'; 
    }
    setLoading(false);
  };

  const onRegister = async (values: Record<string, string>) => {
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email: values.email,
      password: values.password,
      options: {
        data: {
          full_name: values.fullname,
        },
      },
    });

    if (error) {
      message.error(error.message);
    } else {
      message.success('สมัครสมาชิกสำเร็จ! กรุณาตรวจสอบอีเมลเพื่อยืนยันตัวตน');
    }
    setLoading(false);
  };

  const handleSocialLogin = async (provider: 'google' | 'facebook') => {
    setLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: provider,
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      message.error(error.message);
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-20 flex justify-center">
      <div className="w-full max-w-md bg-white p-8 rounded-xl border border-border shadow-sm">
        <h1 className="text-2xl font-bold text-center mb-6">ยินดีต้อนรับสู่ Nut MobileShop</h1>
        
        <Tabs
          defaultActiveKey="login"
          items={[
            {
              key: 'login',
              label: 'เข้าสู่ระบบ',
              children: (
                <div className="mt-4">
                  <Form layout="vertical" onFinish={onLogin}>
                    <Form.Item name="email" rules={[{ required: true, message: 'กรุณากรอกอีเมล' }]}>
                      <Input prefix={<MailOutlined />} placeholder="อีเมล" size="large" />
                    </Form.Item>
                    <Form.Item name="password" rules={[{ required: true, message: 'กรุณากรอกรหัสผ่าน' }]}>
                      <Input.Password prefix={<LockOutlined />} placeholder="รหัสผ่าน" size="large" />
                    </Form.Item>
                    <Button type="primary" htmlType="submit" block size="large" loading={loading}>
                      เข้าสู่ระบบ
                    </Button>
                  </Form>

                  <Divider plain>หรือเข้าสู่ระบบด้วย</Divider>

                  <div className="space-y-3">
                    <Button 
                      block 
                      size="large" 
                      icon={<GoogleOutlined />} 
                      onClick={() => handleSocialLogin('google')}
                      loading={loading}
                    >
                      Google
                    </Button>
                    <Button 
                      block 
                      size="large" 
                      icon={<FacebookFilled />} 
                      className="bg-[#1877F2] text-white hover:!bg-[#1877F2]/90 hover:!text-white border-none"
                      onClick={() => handleSocialLogin('facebook')}
                      loading={loading}
                    >
                      Facebook
                    </Button>
                  </div>
                </div>
              ),
            },
            {
              key: 'register',
              label: 'สมัครสมาชิก',
              children: (
                <Form layout="vertical" onFinish={onRegister} className="mt-4">
                  <Form.Item name="fullname" rules={[{ required: true, message: 'กรุณากรอกชื่อ-นามสกุล' }]}>
                    <Input prefix={<UserOutlined />} placeholder="ชื่อ-นามสกุล" size="large" />
                  </Form.Item>
                  <Form.Item name="email" rules={[{ required: true, message: 'กรุณากรอกอีเมล' }]}>
                    <Input prefix={<MailOutlined />} placeholder="อีเมล" size="large" />
                  </Form.Item>
                  <Form.Item name="password" rules={[{ required: true, message: 'กรุณากรอกรหัสผ่าน' }]}>
                    <Input.Password prefix={<LockOutlined />} placeholder="รหัสผ่าน" size="large" />
                  </Form.Item>
                  <Button type="primary" htmlType="submit" block size="large" loading={loading}>
                    สมัครสมาชิก
                  </Button>
                </Form>
              ),
            },
          ]}
        />
      </div>
    </div>
  );
}
