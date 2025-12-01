"use client";
import { useState, useEffect } from 'react';
import { Carousel, Card, Button, Tag, Rate } from 'antd';
import { RightOutlined, ThunderboltFilled, ShoppingCartOutlined } from '@ant-design/icons';
import Link from 'next/link';
import Image from 'next/image';
import { supabase } from '@/lib/supabaseClient';
import ProductCard from '@/components/ProductCard';

interface Product {
  id: number;
  name: string;
  price: number;
  original_price?: number;
  image_url: string;
  condition: 'New' | 'Used';
  is_featured?: boolean;
  stock?: number;
  category_id: number;
  brand: string;
  created_at?: string;
}

export default function Home() {
  const [bestSellers, setBestSellers] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      // Fetch 4 products for Best Sellers (mocking best sellers with just latest products for now)
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .limit(4)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching best sellers:', error);
      } else {
        setBestSellers(data || []);
      }
      setLoading(false);
    };

    void fetchProducts();
  }, []);

  return (
    <div className="space-y-12 pb-12">
      
      {/* Hero Banner */}
      <div className="relative">
        <Carousel autoplay className="bg-black">
          <div className="h-[400px] md:h-[500px] relative">
            <div className="absolute inset-0 bg-gradient-to-r from-black/80 to-transparent z-10 flex items-center">
              <div className="container mx-auto px-4 md:px-12">
                <div className="max-w-lg text-white space-y-6">
                  <Tag color="orange" className="text-lg px-3 py-1">โปรโมชั่นพิเศษ</Tag>
                  <h1 className="text-4xl md:text-6xl font-bold leading-tight">
                    iPhone 17 Pro Max <br/>
                    <span className="text-primary">ชิป A19 Pro</span>
                  </h1>
                  <p className="text-lg text-gray-300">
                    น้ำหนักเบาแต่ทนทาน มาพร้อมชิปตัวแรงที่สุดที่เคยมีบน iPhone ประสิทธิภาพลื่นไหลทุกการใช้งาน
                  </p>
                  <Button type="primary" size="large" className="h-12 px-8 text-lg bg-primary hover:bg-orange-600 border-none"href="/shop">
                    ช้อปเลย
                  </Button>
                </div>
              </div>
            </div>
            <Image src="/477741797_3339636029505715_3372530127924921022_n.jpg" fill className="object-cover opacity-60" alt="Banner 1" priority />
          </div>
          <div className="h-[400px] md:h-[500px] relative">
            <div className="absolute inset-0 bg-gradient-to-r from-black/80 to-transparent z-10 flex items-center">
              <div className="container mx-auto px-4 md:px-12">
                <div className="max-w-lg text-white space-y-6">
                  <Tag color="blue" className="text-lg px-3 py-1">สินค้ามาใหม่</Tag>
                  <h1 className="text-4xl md:text-6xl font-bold leading-tight">
                    Samsung Galaxy <br/>
                    <span className="text-blue-400">S25 Ultra</span>
                  </h1>
                  <p className="text-lg text-gray-300">
                    Galaxy AI มาแล้ว! ยกระดับการใช้งานสมาร์ทโฟนของคุณไปอีกขั้น
                  </p>
                  <Button type="primary" size="large" className="h-12 px-8 text-lg" href="/shop">
                    ดูรายละเอียด
                  </Button>
                </div>
              </div>
            </div>
            <Image src="/477741797_3339636029505715_3372530127924921022_n.jpg" fill className="object-cover opacity-60" alt="Banner 2" />
          </div>
        </Carousel>
      </div>

      <div className="container mx-auto px-4 space-y-16">
        
        {/* Featured Categories */}
        <section>
          <div className="flex justify-between items-end mb-8">
            <div>
              <h2 className="text-3xl font-bold text-foreground">หมวดหมู่ยอดฮิต</h2>
              <p className="text-muted-foreground mt-2">เลือกช้อปตามประเภทสินค้าที่คุณต้องการ</p>
            </div>
            <Link href="/shop" className="text-primary hover:text-orange-600 flex items-center gap-1 font-medium">
              ดูทั้งหมด <RightOutlined />
            </Link>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { name: 'iPhone', img: 'https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?auto=format&fit=crop&w=400&q=80' },
              { name: 'Android', img: 'https://images.unsplash.com/photo-1616348436168-de43ad0db179?auto=format&fit=crop&w=400&q=80' },
              { name: 'iPad / Tablet', img: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?auto=format&fit=crop&w=400&q=80' },
              { name: 'Accessories', img: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=400&q=80' },
            ].map((cat, idx) => (
              <Link href="/shop" key={idx} className="group relative h-48 rounded-2xl overflow-hidden cursor-pointer shadow-sm hover:shadow-md transition-all">
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors z-10" />
                <Image src={cat.img} alt={cat.name} fill className="object-cover group-hover:scale-110 transition-transform duration-500" />
                <span className="absolute bottom-4 left-4 text-white font-bold text-xl z-20">{cat.name}</span>
              </Link>
            ))}
          </div>
        </section>

        {/* Best Sellers */}
        <section>
          <div className="flex items-center gap-3 mb-8">
            <ThunderboltFilled className="text-3xl text-primary" />
            <h2 className="text-3xl font-bold text-foreground">สินค้าขายดี</h2>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
            {loading ? (
               // Skeleton loading state
               [1, 2, 3, 4].map((i) => (
                 <div key={i} className="h-[250px] md:h-[350px] bg-gray-100 rounded-xl animate-pulse" />
               ))
            ) : bestSellers.length > 0 ? (
              bestSellers.map((product) => (
                <ProductCard
                  key={product.id}
                  id={product.id}
                  name={product.name}
                  price={product.price}
                  originalPrice={product.original_price}
                  image={product.image_url}
                  condition={product.condition}
                  stock={product.stock}
                  isNew={product.condition === 'New'}
                />
              ))
            ) : (
              <div className="col-span-2 lg:col-span-4 text-center py-10 text-gray-500">
                ยังไม่มีสินค้าแนะนำในขณะนี้
              </div>
            )}
          </div>
        </section>

        {/* Financial Promo */}
        <section className="bg-gradient-to-br from-indigo-900 to-blue-800 rounded-3xl p-8 md:p-12 text-white overflow-hidden relative">
          <div className="relative z-10 grid md:grid-cols-2 gap-8 items-center">
            <div className="space-y-6">
              <Tag color="gold" className="text-lg px-3 py-1 border-none text-black font-bold">บริการใหม่!</Tag>
              <h2 className="text-3xl md:text-5xl font-bold leading-tight">
                อยากได้มือถือใหม่? <br/>
                <span className="text-blue-300">ผ่อนง่ายๆ ใช้บัตรประชาชนใบเดียว</span>
              </h2>
              <p className="text-gray-200 text-lg">
                กับ <strong>Nut Mobile Financial</strong> บริการผ่อนชำระที่เข้าใจคุณ อนุมัติไว เอกสารไม่ยุ่งยาก รับเครื่องไปใช้ก่อน ผ่อนทีหลัง
              </p>
              <ul className="space-y-2 text-gray-300">
                <li className="flex items-center gap-2"><ThunderboltFilled className="text-yellow-400" /> อนุมัติผลรวดเร็วทันใจ</li>
                <li className="flex items-center gap-2"><ThunderboltFilled className="text-yellow-400" /> ดอกเบี้ยพิเศษสำหรับลูกค้าเก่า</li>
                <li className="flex items-center gap-2"><ThunderboltFilled className="text-yellow-400" /> ผ่อนนานสูงสุด 24 เดือน</li>
              </ul>
              <Button 
                type="primary" 
                size="large" 
                className="h-12 px-8 text-lg font-bold bg-white text-blue-900 hover:bg-blue-50 border-none mt-4"
                href="https://nutmobilefinancial.web.app/"
                target="_blank"
              >
                สมัครผ่อนได้ที่นี้
              </Button>
            </div>
            <div className="flex justify-center md:justify-end relative">
               {/* Decorative Circle */}
               <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-blue-500/30 rounded-full blur-3xl" />
               
               {/* Card UI */}
               <div className="bg-white/10 backdrop-blur-md p-6 rounded-2xl border border-white/20 w-full max-w-sm relative z-10 shadow-2xl transform rotate-3 hover:rotate-0 transition-transform duration-500">
                  <div className="flex justify-between items-center mb-8">
                    <div className="font-bold text-xl">Nut Mobile Financial</div>
                    <div className="w-8 h-8 rounded-full bg-yellow-400/80" />
                  </div>
                  <div className="space-y-4 mb-8">
                    <div className="h-4 w-3/4 bg-white/20 rounded-full" />
                    <div className="h-4 w-1/2 bg-white/20 rounded-full" />
                  </div>
                  <div className="flex justify-between items-end">
                    <div className="text-sm text-gray-300">วงเงินสูงสุด</div>
                    <div className="text-2xl font-bold">฿50,000</div>
                  </div>
               </div>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
}


