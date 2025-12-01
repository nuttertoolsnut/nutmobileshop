"use client";
import React from 'react';
import { Card, Typography, Divider } from 'antd';
import { SafetyCertificateOutlined, ToolOutlined, ClockCircleOutlined } from '@ant-design/icons';

const { Title, Paragraph, Text } = Typography;

export default function WarrantyPage() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <div className="text-center mb-12">
        <h1 className="text-3xl md:text-4xl font-bold mb-4">การรับประกันสินค้า</h1>
        <p className="text-muted-foreground text-lg">เงื่อนไขและรายละเอียดการรับประกันสินค้าจาก Nut Mobile Shop</p>
      </div>

      <div className="grid md:grid-cols-3 gap-6 mb-12">
        <Card className="text-center hover:shadow-md transition-shadow">
          <SafetyCertificateOutlined className="text-4xl text-primary mb-4" />
          <h3 className="text-lg font-bold mb-2">รับประกันศูนย์ไทย</h3>
          <p className="text-gray-500">สินค้ามือ 1 รับประกันศูนย์ไทย 1 ปีเต็ม เข้าศูนย์ได้ทั่วประเทศ</p>
        </Card>
        <Card className="text-center hover:shadow-md transition-shadow">
          <ToolOutlined className="text-4xl text-primary mb-4" />
          <h3 className="text-lg font-bold mb-2">รับประกันร้าน</h3>
          <p className="text-gray-500">สินค้ามือ 2 รับประกันร้าน 30 วัน ดูแลฟรีค่าแรงและค่าอะไหล่</p>
        </Card>
        <Card className="text-center hover:shadow-md transition-shadow">
          <ClockCircleOutlined className="text-4xl text-primary mb-4" />
          <h3 className="text-lg font-bold mb-2">เคลมไว</h3>
          <p className="text-gray-500">ตรวจสอบและแจ้งผลภายใน 24 ชม. ดำเนินการรวดเร็ว</p>
        </Card>
      </div>

      <Card className="p-6 md:p-8 shadow-sm">
        <Typography>
          <Title level={3}>เงื่อนไขการรับประกัน</Title>
          <Divider />
          
          <Title level={4}>1. สินค้ามือ 1 (New)</Title>
          <Paragraph>
            <ul>
              <li>สินค้ารับประกันศูนย์ไทย 1 ปี นับจากวันที่เปิดใช้งานเครื่อง</li>
              <li>สามารถนำเครื่องเข้าศูนย์บริการของแบรนด์นั้นๆ ได้ทั่วประเทศ (เช่น iCare, Samsung Service Center)</li>
              <li>เงื่อนไขการรับประกันเป็นไปตามที่ผู้ผลิตกำหนด</li>
            </ul>
          </Paragraph>

          <Title level={4}>2. สินค้ามือ 2 (Used)</Title>
          <Paragraph>
            <ul>
              <li>รับประกันร้าน 30 วัน นับจากวันที่ได้รับสินค้า</li>
              <li>ครอบคลุมการใช้งานปกติ ไม่รวมถึงความเสียหายจากอุบัติเหตุ ตกหล่น โดนน้ำ หรือการดัดแปลงซอฟต์แวร์</li>
              <li>หากเครื่องมีปัญหาภายใน 7 วัน ยินดีเปลี่ยนเครื่องใหม่หรือคืนเงินเต็มจำนวน (สภาพเครื่องต้องเหมือนเดิม)</li>
            </ul>
          </Paragraph>

          <Title level={4}>3. ข้อยกเว้นการรับประกัน</Title>
          <Paragraph>
            การรับประกันจะไม่ครอบคลุมในกรณีดังต่อไปนี้:
            <ul>
              <li>ความเสียหายที่เกิดจากการใช้งานผิดประเภท หรือไม่ปฏิบัติตามคู่มือการใช้งาน</li>
              <li>ความเสียหายจากอุบัติเหตุ เช่น ตกพื้น ตกน้ำ ไฟไหม้ ภัยธรรมชาติ</li>
              <li>รอยขีดข่วน หรือความเสียหายภายนอกที่เกิดขึ้นหลังจากการซื้อ</li>
              <li>การแกะ ซ่อมแซม หรือดัดแปลงเครื่องโดยไม่ได้รับอนุญาตจากทางร้าน</li>
              <li>หน้าจอแตก หรือมีความชื้นเข้าสู่ตัวเครื่อง</li>
            </ul>
          </Paragraph>

          <Divider />
          <div className="bg-gray-50 p-4 rounded-lg mb-4">
            <Text strong>หมายเหตุ:</Text> โปรดเก็บใบเสร็จรับเงินหรือหลักฐานการซื้อไว้เพื่อใช้สิทธิ์ในการรับประกัน
          </div>

          <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 text-blue-800">
            <Text strong className="text-blue-800">ต้องการความช่วยเหลือ?</Text> ติดต่อฝ่ายบริการลูกค้าได้ที่ Line: 0800077375 หรือโทร 080-007-7375
          </div>
        </Typography>
      </Card>
    </div>
  );
}
