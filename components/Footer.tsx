import Link from 'next/link';
import Image from 'next/image';

export default function Footer() {
  return (
    <footer className="bg-muted py-12 mt-auto">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand & Description */}
          <div className="space-y-4">
            <div className="relative h-12 w-48">
              <Image 
                src="/products/img_3565.png" 
                alt="นัทโมบายจังหวัดเลย" 
                fill
                className="object-contain object-left"
              />
            </div>
            <p className="text-muted-foreground leading-relaxed">
              ศูนย์รวมมือถือและอุปกรณ์เสริมครบวงจร <br/>
              คุณภาพดี ราคาเป็นกันเอง พร้อมบริการหลังการขายที่คุณวางใจ
            </p>
          </div>
          
          <div>
            <h4 className="font-bold mb-4">สินค้า</h4>
            <ul className="space-y-2 text-muted-foreground">
              <li><Link href="/shop" className="hover:text-primary">โทรศัพท์มือถือ</Link></li>
              <li><Link href="/shop" className="hover:text-primary">แท็บเล็ต</Link></li>
              <li><Link href="/shop" className="hover:text-primary">อุปกรณ์เสริม</Link></li>
              <li><Link href="/shop" className="hover:text-primary">สินค้าลดราคา</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold mb-4">บริการลูกค้า</h4>
            <ul className="space-y-2 text-muted-foreground">
              <li><Link href="/account" className="hover:text-primary">สถานะคำสั่งซื้อ</Link></li>
              <li><Link href="/warranty" className="hover:text-primary">การรับประกัน</Link></li>
              <li><Link href="/return-policy" className="hover:text-primary">นโยบายการคืนสินค้า</Link></li>
              <li><Link href="/contact" className="hover:text-primary">ติดต่อเรา</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold mb-4"><a href="https://nutmobile-e7176.web.app/">ติดตามเรา</a></h4>
            <div className="flex gap-4">
              {/* Social Icons Placeholder */}
              <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">F</div>
              <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">L</div>
              <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">I</div>
            </div>
          </div>
        </div>
        
        <div className="border-t border-border mt-12 pt-8 text-center text-muted-foreground text-sm">
          © 2025 NutMobileShop. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
