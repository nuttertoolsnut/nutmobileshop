"use client";
import React from 'react';
import { Card, Typography, Divider, Button } from 'antd';
import { PhoneOutlined, MailOutlined, EnvironmentOutlined, FacebookOutlined, MessageOutlined } from '@ant-design/icons';

const { Title, Paragraph, Text } = Typography;

export default function ContactPage() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <div className="text-center mb-12">
        <h1 className="text-3xl md:text-4xl font-bold mb-4">ติดต่อเรา</h1>
        <p className="text-muted-foreground text-lg">เราพร้อมดูแลและให้คำปรึกษาทุกเรื่องเกี่ยวกับมือถือ</p>
      </div>

      <div className="grid md:grid-cols-2 gap-8 mb-12">
        {/* Contact Info */}
        <div className="space-y-6">
          <Card className="h-full shadow-sm">
            <Title level={3}>ช่องทางการติดต่อ</Title>
            <Divider />
            
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xl">
                  <PhoneOutlined />
                </div>
                <div>
                  <h4 className="font-bold text-lg">เบอร์โทรศัพท์</h4>
                  <p className="text-gray-600 text-lg">080-007-7375</p>
                  <p className="text-sm text-muted-foreground">ทุกวัน 09:00 - 20:00 น.</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-600 text-xl">
                  <MessageOutlined />
                </div>
                <div>
                  <h4 className="font-bold text-lg">Line Official</h4>
                  <p className="text-gray-600 text-lg">ID: 0800077375</p>
                  <Button type="link" className="p-0 h-auto" href="https://line.me/ti/p/~0800077375" target="_blank">
                    แอดไลน์คลิกที่นี่
                  </Button>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-xl">
                  <FacebookOutlined />
                </div>
                <div>
                  <h4 className="font-bold text-lg">Facebook Page</h4>
                  <p className="text-gray-600">Nut Mobile Shop</p>
                  <Button type="link" className="p-0 h-auto" href="https://www.facebook.com/NutMobileShop" target="_blank">
                    ไปยังเพจร้าน
                  </Button>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 text-xl">
                  <EnvironmentOutlined />
                </div>
                <div>
                  <h4 className="font-bold text-lg">ที่อยู่ร้าน</h4>
                  <p className="text-gray-600">
                    ร้านนัทโมบาย (Nut Mobile Shop)<br />
                    อำเภอเมือง จังหวัดเลย<br />
                    42000
                  </p>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Map / Form Placeholder */}
        <div className="h-full">
           <Card className="h-full shadow-sm flex flex-col justify-center items-center bg-gray-50 border-dashed">
              <EnvironmentOutlined className="text-6xl text-gray-300 mb-4" />
              <Text type="secondary">แผนที่ร้าน (Google Maps)</Text>
              {/* You can embed an iframe here later */}
           </Card>
        </div>
      </div>
    </div>
  );
}
