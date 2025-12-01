"use client";
import { useState, useEffect } from 'react';
import { Form, Input, Button, Steps, App, Upload, Card, Alert } from 'antd';
import { UploadOutlined, HomeOutlined, CreditCardOutlined, CheckCircleOutlined, QrcodeOutlined } from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import { useCartStore } from '@/store/useCartStore';
import { supabase } from '@/lib/supabaseClient';
import Image from 'next/image';

import PaymentMethod from '@/components/PaymentMethod';

function CheckoutForm() {
  const { message, modal } = App.useApp();
  const router = useRouter();
  const { items, getTotalPrice, clearCart, getDiscountAmount, coupon, getFinalPrice } = useCartStore();
  const [currentStep, setCurrentStep] = useState(0);
  const [form] = Form.useForm();
  const [paymentMethod, setPaymentMethod] = useState('transfer');
  const [uploading, setUploading] = useState(false);
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  
  const totalPrice = getTotalPrice();
  const discountAmount = getDiscountAmount();
  const shippingCost = totalPrice > 5000 ? 0 : 50;
  
  // COD Logic
  const isAllAccessories = items.every(item => item.categoryId === 3);
  const codSurcharge = paymentMethod === 'cod' ? Math.ceil((totalPrice - discountAmount + shippingCost) * 0.03) : 0;
  
  const finalTotal = getFinalPrice() + shippingCost + codSurcharge;

  // PromptPay ID (Phone or Tax ID)
  const promptPayId = process.env.NEXT_PUBLIC_PROMPTPAY_ID || '0800077375';

  // Auto-fill address from user_metadata
  useEffect(() => {
    const fetchUserProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user?.user_metadata) {
        const { full_name, phone, address, province, zipcode } = user.user_metadata;
        form.setFieldsValue({
          fullname: full_name,
          phone: phone,
          address: address,
          province: province,
          zipcode: zipcode
        });
      }
    };
    fetchUserProfile();
  }, [form]);

  const onFinish = async (values: Record<string, unknown>) => {
    try {
      setUploading(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        message.error('กรุณาเข้าสู่ระบบก่อนสั่งซื้อ');
        router.push('/login');
        return;
      }

      // Save address to user_metadata for next time
      await supabase.auth.updateUser({
        data: {
          full_name: values.fullname,
          phone: values.phone,
          address: values.address,
          province: values.province,
          zipcode: values.zipcode
        }
      });

      let slipUrl = '';
      let slipData = null;

      // ... (rest of the existing logic)
      if (paymentMethod === 'transfer') {
        if (fileList.length === 0) {
          message.error('กรุณาอัพโหลดสลิปโอนเงิน');
          setUploading(false);
          return;
        }

        const file = fileList[0].originFileObj;
        
        // 1. Verify Slip with API
        const formData = new FormData();
        formData.append('file', file);
        formData.append('amount', finalTotal.toString());

        // Upload to Supabase
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}.${fileExt}`;
        const filePath = `${user.id}/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('slips')
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('slips')
          .getPublicUrl(filePath);
        
        slipUrl = publicUrl;

        // 2. Call Verification API
        const verifyResponse = await fetch('/api/verify-slip', {
          method: 'POST',
          body: formData,
        });

        const verifyResult = await verifyResponse.json();
        console.log('Verify Result:', verifyResult);
        
        slipData = verifyResult.data || verifyResult; // Store full response

        // Show Verification Popup
        await new Promise((resolve, reject) => {
          modal.confirm({
            title: verifyResult.success ? 'ตรวจสอบสลิปสำเร็จ (Slip Verified)' : 'ตรวจสอบสลิปไม่ผ่าน (Slip Verification Failed)',
            icon: verifyResult.success ? <CheckCircleOutlined style={{ color: '#52c41a' }} /> : undefined,
            content: (
              <div>
                <p><strong>สถานะ:</strong> {verifyResult.success ? <span className="text-green-600">ปกติ (Valid)</span> : <span className="text-red-500">ผิดปกติ ({verifyResult.message})</span>}</p>
                {verifyResult.data && (
                  <div className="mt-2 text-sm bg-gray-50 p-2 rounded border">
                    <p><strong>ผู้โอน:</strong> {verifyResult.data.sender?.displayName || '-'}</p>
                    <p><strong>ผู้รับ:</strong> {verifyResult.data.receiver?.displayName || '-'}</p>
                    <p><strong>จำนวนเงิน:</strong> {verifyResult.data.amount?.toLocaleString()} THB</p>
                    <p><strong>ธนาคาร:</strong> {verifyResult.data.receivingBank || '-'}</p>
                    <p><strong>เวลา:</strong> {verifyResult.data.transDate} {verifyResult.data.transTime}</p>
                  </div>
                )}
                <p className="mt-4 text-gray-500 text-xs">กด &quot;ตกลง&quot; เพื่อยืนยันคำสั่งซื้อ</p>
              </div>
            ),
            okText: 'ยืนยันคำสั่งซื้อ (Confirm Order)',
            cancelText: 'ยกเลิก (Cancel)',
            onOk: () => resolve(true),
            onCancel: () => reject(new Error('User cancelled order')),
          });
        });
      }

      const orderData = {
        user_id: user.id,
        total_price: finalTotal,
        status: (paymentMethod === 'transfer' && slipData?.success) ? 'preparing' : 'pending', 
        shipping_address: `${values.fullname} ${values.phone} ${values.address} ${values.province} ${values.zipcode}`,
        payment_method: paymentMethod,
        // cod_surcharge: codSurcharge, // Removed: Column missing in DB
        slip_url: slipUrl,
        slip_data: {
          ...(paymentMethod === 'cod' ? { cod_surcharge: codSurcharge } : slipData),
          coupon_data: coupon
        },
        items: items,
        // coupon_data: coupon // Removed: Column missing in DB
      };

      console.log('Creating order with data:', orderData);

      const { data: order, error } = await supabase.from('orders').insert([orderData]).select();

      if (error) {
        console.error('Order creation error:', JSON.stringify(error, null, 2));
        throw error;
      }
      
      // Update coupon usage count
      if (coupon) {
        await supabase.rpc('increment_coupon_usage', { coupon_code: coupon.code });
      }
      
      console.log('Order created:', order);

      message.success('สั่งซื้อสำเร็จ! กำลังไปที่ประวัติการสั่งซื้อ...');
      clearCart();
      router.push('/account?tab=orders');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';

      if (errorMessage === 'User cancelled order') {
        console.log('User cancelled the order verification.');
        return;
      }

      console.error('Checkout error:', error);
      if (typeof error === 'object' && error !== null) {
        console.error('Detailed error:', JSON.stringify(error, null, 2));
      }
      
      message.error('เกิดข้อผิดพลาด: ' + errorMessage);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-8 text-center">ชำระเงิน</h1>

      <Steps 
        current={currentStep} 
        size="small"
        className="mb-6 md:mb-12"
        items={[
          { title: 'ที่อยู่จัดส่ง', icon: <HomeOutlined /> },
          { title: 'ชำระเงิน', icon: <CreditCardOutlined /> },
          { title: 'ยืนยัน', icon: <CheckCircleOutlined /> },
        ]}
      />

      <div className="grid md:grid-cols-3 gap-8">
        {/* Main Form */}
        <div className="md:col-span-2 space-y-6">
          <Form 
            form={form} 
            layout="vertical" 
            onFinish={onFinish}
            initialValues={{ paymentMethod: 'transfer' }}
          >
            {/* Step 1: Address */}
            <div className={currentStep === 0 ? 'block' : 'hidden'}>
              <div className="bg-white p-4 md:p-6 rounded-xl border border-border">
                <h3 className="font-bold text-lg mb-4">ที่อยู่จัดส่ง</h3>
                <Form.Item name="fullname" label="ชื่อ-นามสกุล" rules={[{ required: true, message: 'กรุณากรอกชื่อ-นามสกุล' }]}>
                  <Input size="large" />
                </Form.Item>
                <Form.Item name="phone" label="เบอร์โทรศัพท์" rules={[{ required: true, message: 'กรุณากรอกเบอร์โทรศัพท์' }]}>
                  <Input size="large" />
                </Form.Item>
                <Form.Item name="address" label="ที่อยู่" rules={[{ required: true, message: 'กรุณากรอกที่อยู่' }]}>
                  <Input.TextArea rows={3} size="large" />
                </Form.Item>
                <div className="grid grid-cols-2 gap-4">
                  <Form.Item name="province" label="จังหวัด" rules={[{ required: true, message: 'กรุณากรอกจังหวัด' }]}>
                    <Input size="large" />
                  </Form.Item>
                  <Form.Item name="zipcode" label="รหัสไปรษณีย์" rules={[{ required: true, message: 'กรุณากรอกรหัสไปรษณีย์' }]}>
                    <Input size="large" />
                  </Form.Item>
                </div>
                <Button type="primary" size="large" block onClick={() => form.validateFields().then(() => setCurrentStep(1))}>
                  ถัดไป
                </Button>
              </div>
            </div>

            {/* Step 2: Payment */}
            <div className={currentStep === 1 ? 'block' : 'hidden'}>
              <div className="bg-white p-4 md:p-6 rounded-xl border border-border space-y-6">
                <PaymentMethod 
                  value={paymentMethod} 
                  onChange={setPaymentMethod} 
                  codDisabled={!isAllAccessories}
                  codDisabledReason="เฉพาะสินค้าหมวด Accessories เท่านั้น"
                />
                
                {paymentMethod === 'transfer' && (
                  <div className="space-y-6">
                    <Card className="bg-gray-50 border-primary/20 overflow-hidden">
                      <div className="text-center space-y-6 py-2">
                        <div className="flex justify-center">
                           <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                             {/* PromptPay QR Code */}
                             <Image 
                               src={`https://promptpay.io/${promptPayId}/${finalTotal}`} 
                               alt="PromptPay QR" 
                               width={200} 
                               height={200} 
                               className="mix-blend-multiply"
                             />
                           </div>
                        </div>
                        <div className="space-y-2">
                          <p className="text-sm text-muted-foreground">ยอดชำระทั้งหมด</p>
                          <p className="font-bold text-3xl text-primary">฿{finalTotal.toLocaleString()}</p>
                          <p className="text-xs text-muted-foreground bg-white/50 inline-block px-3 py-1 rounded-full">
                            สแกน QR Code เพื่อชำระเงิน
                          </p>
                        </div>
                      </div>
                    </Card>

                    <Form.Item label="อัพโหลดสลิปโอนเงิน" required>
                      <Upload 
                        maxCount={1} 
                        showUploadList={false}
                        fileList={fileList}
                        onChange={({ fileList }) => setFileList(fileList)}
                        beforeUpload={() => false} // Prevent auto upload
                        className="w-full block"
                      >
                        {fileList.length > 0 ? (
                          <div className="w-full h-40 border-2 border-primary border-dashed rounded-xl bg-primary/5 flex flex-col items-center justify-center cursor-pointer hover:bg-primary/10 transition-colors">
                             <CheckCircleOutlined className="text-4xl text-primary mb-2" />
                             <div className="font-bold text-primary">อัพโหลดสลิปเรียบร้อย</div>
                             <div className="text-sm text-muted-foreground mt-1">{fileList[0].name}</div>
                             <div className="text-xs text-primary mt-2 bg-white px-3 py-1 rounded-full shadow-sm">แตะเพื่อเปลี่ยนรูป</div>
                          </div>
                        ) : (
                          <div className="w-full h-40 border-2 border-dashed border-gray-300 rounded-xl bg-gray-50 flex flex-col items-center justify-center cursor-pointer hover:border-primary hover:bg-primary/5 transition-all group">
                            <div className="bg-white p-3 rounded-full shadow-sm mb-3 group-hover:scale-110 transition-transform">
                              <UploadOutlined className="text-2xl text-gray-400 group-hover:text-primary" />
                            </div>
                            <div className="font-bold text-gray-600 group-hover:text-primary">แตะเพื่ออัพโหลดสลิป</div>
                            <div className="text-xs text-muted-foreground mt-1">รองรับไฟล์ JPG, PNG</div>
                          </div>
                        )}
                      </Upload>
                    </Form.Item>
                  </div>
                )}

                <div className="flex gap-4">
                  <Button size="large" onClick={() => setCurrentStep(0)}>ย้อนกลับ</Button>
                  <Button type="primary" size="large" htmlType="submit" className="flex-1" loading={uploading}>
                    ยืนยันคำสั่งซื้อ
                  </Button>
                </div>
              </div>
            </div>
          </Form>
        </div>


        {/* Order Summary */}
        <div className="md:col-span-1">
          <div className="bg-gray-50 p-4 md:p-6 rounded-xl border border-border sticky top-24">
            <h3 className="font-bold text-lg mb-4">สรุปรายการสินค้า</h3>
            <div className="space-y-3 mb-4 max-h-60 overflow-y-auto pr-2">
              {items.map((item) => (
                <div key={`${item.id}-${item.variant}`} className="flex justify-between text-sm">
                  <div>
                    <div className="font-medium">{item.name}</div>
                    <div className="text-xs text-muted-foreground">x{item.quantity} ({item.variant})</div>
                  </div>
                  <div>฿{(item.price * item.quantity).toLocaleString()}</div>
                </div>
              ))}
            </div>
            
            <div className="border-t border-gray-200 pt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">ยอดรวม</span>
                <span>฿{totalPrice.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">ค่าจัดส่ง</span>
                <span>{shippingCost === 0 ? 'ฟรี' : `฿${shippingCost}`}</span>
              </div>
              {paymentMethod === 'cod' && (
                <div className="flex justify-between text-sm text-orange-600">
                  <span>ค่าธรรมเนียม COD (3%)</span>
                  <span>+฿{codSurcharge.toLocaleString()}</span>
                </div>
              )}
              {discountAmount > 0 && (
                <div className="flex justify-between text-sm text-green-600">
                  <span>ส่วนลด ({coupon?.code})</span>
                  <span>-฿{discountAmount.toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between font-bold text-lg pt-2 border-t border-gray-200 mt-2">
                <span>ยอดสุทธิ</span>
                <span className="text-primary">฿{finalTotal.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  const { items } = useCartStore();
  const router = useRouter();
  // We need to pass the user data to the form, but CheckoutForm fetches it again.
  // To avoid double fetching, we can let CheckoutForm handle it or pass it down.
  // Since CheckoutForm is already a client component, let's keep the logic there but we need to pass the form instance or move the logic inside.
  // Actually, CheckoutForm is defined in the same file. Let's modify CheckoutForm directly.
  
  // ... (keeping existing useEffect for auth check)
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/login?returnUrl=/checkout');
        return;
      }
      
      if (items.length === 0) {
        router.push('/cart');
      }
    };
    
    void checkAuth();
  }, [items, router]);

  if (items.length === 0) return null;

  return <CheckoutForm />;
}
