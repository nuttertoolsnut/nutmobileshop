"use client";
import Link from 'next/link';
import { Result, Button } from 'antd';

export default function SuccessPage() {
  return (
    <div className="container mx-auto px-4 py-20">
      <Result
        status="success"
        title="สั่งซื้อสำเร็จ!"
        subTitle="ขอบคุณที่ไว้วางใจ MobileShop คำสั่งซื้อของคุณกำลังถูกดำเนินการ"
        extra={[
          <Link href="/shop" key="buy">
            <Button type="primary" size="large">เลือกซื้อสินค้าต่อ</Button>
          </Link>,
          <Link href="/account" key="account">
            <Button size="large">ดูประวัติการสั่งซื้อ</Button>
          </Link>,
        ]}
      />
    </div>
  );
}
