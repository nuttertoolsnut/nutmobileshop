"use client";
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { Spin } from 'antd';
import Barcode from 'react-barcode';

export default function ShippingLabelPage() {
  const params = useParams();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (params.id) {
      void fetchOrder();
    }
  }, [params.id]);

  const fetchOrder = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('id', params.id)
      .single();

    if (error) {
      console.error('Error fetching order:', error);
    } else {
      setOrder(data);
    }
    setLoading(false);
  };

  if (loading) return <div className="flex justify-center items-center h-screen"><Spin size="large" /></div>;
  if (!order) return <div>Order not found</div>;

  // Shop Address (Hardcoded for now)
  const shopName = "NutMobile shop";
  const shopAddress = "59 หมู่7, ต.ผาอินทร์แปลง, อ.เอราวัณ จ.เลย 42220";
  const shopPhone = "080-007-7375";

  return (
    <div className="print-container w-[100mm] h-[150mm] bg-white text-black p-4 box-border relative overflow-hidden mx-auto border border-gray-200">
      <style jsx global>{`
        @page {
          size: 100mm 150mm;
          margin: 0;
        }
        body {
          margin: 0;
          padding: 0;
          background-color: #f0f0f0;
        }
        @media print {
          body {
            background-color: white;
            width: 100mm;
            height: 150mm;
          }
          .print-container {
            width: 100mm !important;
            height: 150mm !important;
            border: none !important;
            position: absolute;
            top: 0;
            left: 0;
            margin: 0;
            padding: 4mm; /* Add safe padding */
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>

      {/* Header / Carrier Logo Area */}
      <div className="flex justify-between items-start border-b-2 border-black pb-2 mb-2">
        <div>
          <h1 className="text-2xl font-bold uppercase">{order.carrier_name || 'STANDARD'}</h1>
          <div className="text-xs">Express Delivery</div>
        </div>
        <div className="text-right">
          <div className="border-2 border-black px-2 py-1 font-bold text-lg">
            PICKUP
          </div>
        </div>
      </div>

      {/* Barcode Area */}
      <div className="flex justify-center mb-4">
        <Barcode 
          value={order.tracking_number || `ORD-${order.id}`}
          width={2}
          height={50}
          fontSize={14}
          displayValue={true}
        />
      </div>

      {/* Sender & Receiver Grid */}
      <div className="grid grid-cols-1 gap-0 border-2 border-black mb-2">
        {/* Sender */}
        <div className="p-2 border-b border-black">
          <div className="text-[10px] font-bold text-gray-600 uppercase">From (Sender)</div>
          <div className="font-bold text-sm">{shopName}</div>
          <div className="text-xs leading-tight">{shopAddress}</div>
          <div className="text-xs">Tel: {shopPhone}</div>
        </div>

        {/* Receiver */}
        <div className="p-2">
          <div className="text-[10px] font-bold text-gray-600 uppercase">To (Receiver)</div>
          {/* Attempt to parse name from address or use profile name */}
          <div className="font-bold text-lg mb-1">{order.shipping_address?.split(' ')[0] || 'Customer'}</div>
          <div className="text-sm leading-tight whitespace-pre-wrap">{order.shipping_address}</div>
        </div>
      </div>

      {/* Order Details */}
      <div className="flex justify-between items-end mt-4">
        <div className="text-xs">
          <div><strong>Order ID:</strong> #{order.id}</div>
          <div><strong>Date:</strong> {new Date(order.created_at).toLocaleDateString('th-TH')}</div>
          <div className="mt-1">
            <strong>Note:</strong> Mobile Phone/Accessories
          </div>
        </div>
        
        {/* COD Badge */}
        {order.payment_method === 'cod' ? (
           <div className="text-center border-2 border-black p-2">
             <div className="text-2xl font-bold">COD</div>
             <div className="text-sm font-bold">฿{order.total_price.toLocaleString()}</div>
           </div>
        ) : (
           <div className="text-center border-2 border-black p-2 opacity-50">
             <div className="text-xl font-bold">PAID</div>
             <div className="text-xs">No Collection</div>
           </div>
        )}
      </div>

      {/* Footer / QR */}
      <div className="absolute bottom-4 right-4">
         {/* Placeholder for QR Code */}
         <div className="w-16 h-16 border border-black flex items-center justify-center text-[8px] text-center">
           QR CODE
         </div>
      </div>

      {/* Print Button (Screen Only) */}
      <div className="no-print fixed bottom-4 right-4">
        <button 
          onClick={() => window.print()}
          className="bg-blue-600 text-white px-6 py-3 rounded-full shadow-lg font-bold hover:bg-blue-700 transition-colors"
        >
          Print Label
        </button>
      </div>
    </div>
  );
}
