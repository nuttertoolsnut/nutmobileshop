"use client";
import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button, Input, Divider, App } from 'antd';
import { DeleteOutlined, MinusOutlined, PlusOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { useCartStore } from '@/store/useCartStore';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';

import { Suspense } from 'react';

function CartContent() {
  const { message } = App.useApp();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { items, removeItem, updateQuantity, getTotalPrice, applyCoupon, removeCoupon, getDiscountAmount, coupon } = useCartStore();
  const [couponCode, setCouponCode] = useState('');
  const [loadingCoupon, setLoadingCoupon] = useState(false);

  const totalPrice = getTotalPrice();
  const discountAmount = getDiscountAmount();
  const shippingCost = totalPrice > 5000 ? 0 : 50; // Free shipping over 5000
  const finalTotal = Math.max(0, totalPrice + shippingCost - discountAmount);

  useEffect(() => {
    if (searchParams.get('login') === 'success') {
      message.success('เข้าสู่ระบบสำเร็จ! ยินดีต้อนรับกลับมาครับ');
      // Clean up the URL
      const newUrl = window.location.pathname;
      window.history.replaceState({}, '', newUrl);
    }
  }, [searchParams, message]);

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    setLoadingCoupon(true);

    try {
      const { data, error } = await supabase
        .from('coupons')
        .select('*')
        .eq('code', couponCode.toUpperCase())
        .eq('is_active', true)
        .single();

      if (error || !data) {
        message.error('ไม่พบโค้ดส่วนลด หรือโค้ดหมดอายุ');
        setLoadingCoupon(false);
        return;
      }

      // Validation
      if (data.expires_at && new Date(data.expires_at) < new Date()) {
        message.error('โค้ดส่วนลดหมดอายุแล้ว');
        setLoadingCoupon(false);
        return;
      }

      if (data.usage_limit && data.used_count >= data.usage_limit) {
        message.error('โค้ดส่วนลดถูกใช้ครบจำนวนแล้ว');
        setLoadingCoupon(false);
        return;
      }

      if (totalPrice < data.min_spend) {
        message.error(`ต้องมียอดซื้อขั้นต่ำ ฿${data.min_spend.toLocaleString()}`);
        setLoadingCoupon(false);
        return;
      }

      applyCoupon({
        code: data.code,
        discountType: data.discount_type,
        discountValue: data.discount_value,
        minSpend: data.min_spend
      });
      
      message.success('ใช้โค้ดส่วนลดสำเร็จ!');
      setCouponCode('');
    } catch (err) {
      console.error(err);
      message.error('เกิดข้อผิดพลาดในการใช้งานคูปอง');
    } finally {
      setLoadingCoupon(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-20 text-center space-y-6">
        <div className="text-6xl">🛒</div>
        <h1 className="text-2xl font-bold">ตะกร้าสินค้าว่างเปล่า</h1>
        <p className="text-muted-foreground">คุณยังไม่มีสินค้าในตะกร้า เลือกช้อปสินค้าเลย!</p>
        <Link href="/shop">
          <Button type="primary" size="large">เลือกซื้อสินค้า</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">ตะกร้าสินค้า ({items.length})</h1>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => (
            <div key={`${item.id}-${item.variant}`} className="bg-white p-4 rounded-xl border border-border flex gap-4 items-center">
              <div className="relative w-24 h-24 bg-gray-50 rounded-lg overflow-hidden flex-shrink-0">
                <Image src={item.image} alt={item.name} fill className="object-cover" />
              </div>
              
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-lg truncate">{item.name}</h3>
                <p className="text-sm text-muted-foreground">{item.variant}</p>
                <div className="text-primary font-bold mt-1">฿{item.price.toLocaleString()}</div>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex items-center border border-border rounded-lg">
                  <button 
                    className="px-3 py-1 hover:bg-gray-100 transition-colors"
                    onClick={() => updateQuantity(item.id, item.quantity - 1, item.variant)}
                  >
                    <MinusOutlined className="text-xs" />
                  </button>
                  <span className="w-8 text-center font-medium">{item.quantity}</span>
                  <button 
                    className="px-3 py-1 hover:bg-gray-100 transition-colors"
                    onClick={() => updateQuantity(item.id, item.quantity + 1, item.variant)}
                  >
                    <PlusOutlined className="text-xs" />
                  </button>
                </div>
                <Button 
                  type="text" 
                  danger 
                  icon={<DeleteOutlined />} 
                  onClick={() => removeItem(item.id, item.variant)}
                />
              </div>
            </div>
          ))}

          <Link href="/shop" className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary mt-4">
            <ArrowLeftOutlined /> เลือกซื้อสินค้าต่อ
          </Link>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white p-6 rounded-xl border border-border sticky top-24">
            <h2 className="text-xl font-bold mb-4">สรุปคำสั่งซื้อ</h2>
            
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">ยอดรวมสินค้า</span>
                <span>฿{totalPrice.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">ค่าจัดส่ง</span>
                <span>{shippingCost === 0 ? 'ฟรี' : `฿${shippingCost}`}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">ส่วนลด</span>
                <span className={discountAmount > 0 ? "text-green-600 font-bold" : ""}>
                  {discountAmount > 0 ? `-฿${discountAmount.toLocaleString()}` : '-'}
                </span>
              </div>
              {coupon && (
                <div className="flex justify-between items-center bg-green-50 p-2 rounded text-xs text-green-700">
                  <span>Code: <strong>{coupon.code}</strong></span>
                  <Button type="text" size="small" danger onClick={removeCoupon}>ลบ</Button>
                </div>
              )}
            </div>

            <Divider className="my-4" />

            <div className="flex justify-between items-end mb-6">
              <span className="font-bold text-lg">ยอดสุทธิ</span>
              <span className="font-bold text-2xl text-primary">฿{finalTotal.toLocaleString()}</span>
            </div>

            <div className="space-y-3">
              <div className="flex gap-2">
                <Input 
                  placeholder="โค้ดส่วนลด" 
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  disabled={!!coupon}
                />
                <Button 
                  onClick={handleApplyCoupon} 
                  loading={loadingCoupon}
                  disabled={!!coupon || !couponCode}
                >
                  ใช้
                </Button>
              </div>
              <Button 
                type="primary" 
                block 
                size="large" 
                className="h-12 text-lg font-bold"
                onClick={async () => {
                  const { data: { session } } = await supabase.auth.getSession();
                  if (session) {
                    router.push('/checkout');
                  } else {
                    router.push('/login?returnUrl=/checkout');
                  }
                }}
              >
                ดำเนินการชำระเงิน
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CartPage() {
  return (
    <Suspense fallback={
      <div className="container mx-auto px-4 py-20 text-center">
        <div className="text-6xl animate-pulse">🛒</div>
      </div>
    }>
      <CartContent />
    </Suspense>
  );
}
