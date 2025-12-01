"use client";
import { Radio, Space, Card } from 'antd';
import { BankOutlined, WalletOutlined } from '@ant-design/icons';
import Image from 'next/image';

interface PaymentMethodProps {
  value: string;
  onChange: (value: string) => void;
  codDisabled?: boolean;
  codDisabledReason?: string;
}

export default function PaymentMethod({ value, onChange, codDisabled = false, codDisabledReason }: PaymentMethodProps) {
  return (
    <div className="space-y-4">
      <h3 className="font-bold text-lg">วิธีการชำระเงิน</h3>
      <Radio.Group onChange={(e) => onChange(e.target.value)} value={value} className="w-full">
        <div className="flex flex-col gap-4 w-full">
          
          <Card 
            className={`cursor-pointer border-2 transition-colors ${value === 'transfer' ? 'border-primary' : 'border-border'}`}
            styles={{ body: { padding: '16px' } }}
            onClick={() => onChange('transfer')}
          >
            <Radio value="transfer" className="w-full">
              <div className="flex items-start gap-3 w-full pt-1">
                <BankOutlined className="text-xl text-blue-600 mt-1" />
                <div>
                  <div className="font-bold text-base">โอนเงินผ่านธนาคาร / QR Code</div>
                  <div className="text-sm text-muted-foreground leading-snug">แนบสลิปหลักฐานการโอนเงิน</div>
                </div>
              </div>
            </Radio>
            {value === 'transfer' && (
              <div className="mt-4 pl-8">
                <div className="text-sm text-muted-foreground bg-gray-50 p-3 rounded-lg border border-gray-100">
                  ระบบจะสร้าง QR Code สำหรับยอดชำระเงินให้ในขั้นตอนถัดไป
                </div>
              </div>
            )}
          </Card>

          <Card 
            className={`cursor-pointer border-2 transition-colors ${value === 'cod' ? 'border-primary' : 'border-border'} ${codDisabled ? 'opacity-50 cursor-not-allowed bg-gray-50' : ''}`}
            styles={{ body: { padding: '16px' } }}
            onClick={() => !codDisabled && onChange('cod')}
          >
            <Radio value="cod" className="w-full" disabled={codDisabled}>
              <div className="flex items-start gap-3 pt-1">
                <WalletOutlined className="text-xl text-green-600 mt-1" />
                <div>
                  <div className="font-bold text-base">เก็บเงินปลายทาง (COD)</div>
                  <div className="text-sm text-muted-foreground leading-snug">ชำระเงินเมื่อได้รับสินค้า (+3%)</div>
                  {codDisabled && codDisabledReason && (
                    <div className="text-xs text-red-500 mt-1">{codDisabledReason}</div>
                  )}
                </div>
              </div>
            </Radio>
          </Card>

        </div>
      </Radio.Group>
    </div>
  );
}
