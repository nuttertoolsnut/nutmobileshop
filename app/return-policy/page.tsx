"use client";
import React from 'react';
import { Card, Typography, Divider, Steps } from 'antd';
import { SyncOutlined, CheckCircleOutlined, DollarCircleOutlined } from '@ant-design/icons';

const { Title, Paragraph, Text } = Typography;

export default function ReturnPolicyPage() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <div className="text-center mb-12">
        <h1 className="text-3xl md:text-4xl font-bold mb-4">นโยบายการคืนสินค้า</h1>
        <p className="text-muted-foreground text-lg">เรายินดีรับประกันความพึงพอใจ และให้ความสำคัญกับสิทธิ์ของผู้ซื้อ</p>
      </div>

      <div className="mb-12">
        <Steps
          current={-1}
          items={[
            {
              title: 'แจ้งปัญหา',
              description: 'ติดต่อเราภายใน 7 วัน',
              icon: <SyncOutlined />,
            },
            {
              title: 'ตรวจสอบ',
              description: 'ส่งสินค้ากลับมาตรวจสอบ',
              icon: <CheckCircleOutlined />,
            },
            {
              title: 'คืนเงิน/เปลี่ยนของ',
              description: 'ดำเนินการภายใน 3-5 วัน',
              icon: <DollarCircleOutlined />,
            },
          ]}
        />
      </div>

      <Card className="p-6 md:p-8 shadow-sm">
        <Typography>
          <Title level={3}>เงื่อนไขการเปลี่ยน/คืนสินค้า</Title>
          <Divider />
          
          <Paragraph>
            ลูกค้าสามารถขอเปลี่ยนหรือคืนสินค้าได้ภายใน <Text strong>7 วัน</Text> นับจากวันที่ได้รับสินค้า ในกรณีดังต่อไปนี้:
          </Paragraph>

          <Title level={4}>1. สินค้ามีตำหนิหรือเสียหาย</Title>
          <Paragraph>
            <ul>
              <li>สินค้าชำรุดเสียหายจากการผลิต หรือการขนส่ง</li>
              <li>สินค้าไม่สามารถใช้งานได้ตามปกติ (Dead on Arrival)</li>
            </ul>
          </Paragraph>

          <Title level={4}>2. ได้รับสินค้าไม่ตรงตามคำสั่งซื้อ</Title>
          <Paragraph>
            <ul>
              <li>ผิดรุ่น ผิดสี หรือผิดสเปค จากที่ระบุไว้ในคำสั่งซื้อ</li>
              <li>อุปกรณ์ภายในกล่องไม่ครบถ้วน</li>
            </ul>
          </Paragraph>

          <Title level={4}>ขั้นตอนการดำเนินการ</Title>
          <Paragraph>
            <ol>
              <li>ถ่ายรูปหรือวิดีโอสินค้าที่มีปัญหา และเก็บอุปกรณ์พร้อมกล่องให้ครบถ้วน</li>
              <li>ติดต่อเจ้าหน้าที่ผ่านทาง Line หรือ Facebook Page ของร้าน พร้อมแจ้งเลขที่คำสั่งซื้อ</li>
              <li>ส่งสินค้ากลับมายังที่อยู่ของร้าน (ทางร้านรับผิดชอบค่าจัดส่งให้)</li>
              <li>เมื่อทางร้านได้รับสินค้าและตรวจสอบเรียบร้อยแล้ว จะดำเนินการเปลี่ยนเครื่องใหม่ หรือคืนเงินให้ภายใน 3-5 วันทำการ</li>
            </ol>
          </Paragraph>

          <Title level={4}>ข้อกำหนดเพิ่มเติม</Title>
          <Paragraph>
            <ul>
              <li>สินค้าต้องอยู่ในสภาพเดิม ไม่มีการตกหล่น โดนน้ำ หรือมีรอยขีดข่วนเพิ่มเติม</li>
              <li>กล่องและอุปกรณ์เสริมต้องอยู่ครบถ้วน</li>
              <li>ไม่รับคืนสินค้าในกรณีที่ลูกค้าเปลี่ยนใจ (Change of Mind) ยกเว้นกรณีที่ยังไม่ได้แกะซีลกล่องสินค้า</li>
            </ul>
          </Paragraph>

          <Divider />
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 text-blue-800">
            <Text strong className="text-blue-800">ต้องการความช่วยเหลือ?</Text> ติดต่อฝ่ายบริการลูกค้าได้ที่ Line:0800077375 หรือโทร 080-007-7375
          </div>
        </Typography>
      </Card>
    </div>
  );
}
