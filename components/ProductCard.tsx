import Link from 'next/link';
import Image from 'next/image';
import { ShoppingCartOutlined, HeartOutlined } from '@ant-design/icons';
import { Button, Tag, Rate } from 'antd';
import { useCartStore } from '@/store/useCartStore';

interface ProductCardProps {
  id: number;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  condition: 'New' | 'Used';
  rating?: number;
  reviews?: number;
  isNew?: boolean;
  stock?: number;
  categoryId?: number;
}

export default function ProductCard({ 
  id, 
  name, 
  price, 
  originalPrice, 
  image, 
  condition,
  rating = 5,
  reviews = 0,
  isNew = false,
  stock = 0,
  categoryId
}: ProductCardProps) {
  return (
    <div className="group bg-white rounded-xl border border-border overflow-hidden hover:shadow-lg transition-all duration-300 relative">
      {/* Badges */}
      <div className="absolute top-2 left-2 md:top-3 md:left-3 z-10 flex flex-col gap-1 md:gap-2">
        {condition === 'New' ? (
          <Tag color="green" className="m-0 border-none px-1.5 py-0 text-[10px] md:text-xs md:px-2 md:py-0.5 font-medium">มือ 1</Tag>
        ) : (
          <Tag color="orange" className="m-0 border-none px-1.5 py-0 text-[10px] md:text-xs md:px-2 md:py-0.5 font-medium">มือ 2</Tag>
        )}
        {isNew && <Tag color="blue" className="m-0 border-none px-1.5 py-0 text-[10px] md:text-xs md:px-2 md:py-0.5 font-medium">มาใหม่</Tag>}
      </div>

      {/* Wishlist Button */}
      <button className="absolute top-2 right-2 md:top-3 md:right-3 z-10 w-7 h-7 md:w-8 md:h-8 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center text-gray-500 hover:text-red-500 hover:bg-white transition-colors text-sm md:text-base">
        <HeartOutlined />
      </button>

      {/* Image */}
      <Link href={`/shop/${id}`} className="block relative h-40 md:h-64 overflow-hidden bg-gray-50">
        <Image 
          src={image} 
          alt={name}
          fill
          className="object-cover group-hover:scale-110 transition-transform duration-500"
        />
      </Link>

      {/* Content */}
      <div className="p-3 md:p-4 space-y-2 md:space-y-3">
        {/* Rating */}
        <div className="flex items-center gap-1">
          <Rate disabled defaultValue={rating} className="text-[10px] md:text-xs text-yellow-400" />
          <span className="text-[10px] md:text-xs text-muted-foreground">({reviews})</span>
        </div>

        {/* Title */}
        <Link href={`/shop/${id}`}>
          <h3 className="font-bold text-foreground line-clamp-2 min-h-[2.5rem] md:min-h-[3rem] text-sm md:text-base hover:text-primary transition-colors leading-tight">
            {name}
          </h3>
        </Link>

        {/* Price & Stock */}
        <div className="flex items-end justify-between gap-2">
          <div className="min-w-0">
            {originalPrice && (
              <div className="text-[10px] md:text-xs text-muted-foreground line-through">฿{originalPrice.toLocaleString()}</div>
            )}
            <div className="text-base md:text-lg font-bold text-primary truncate">฿{price.toLocaleString()}</div>
            <div className={`text-[10px] md:text-xs mt-0.5 ${stock > 0 ? 'text-green-600' : 'text-red-500'}`}>
              {stock > 0 ? `เหลือ ${stock}` : 'หมด'}
            </div>
          </div>
          <Button 
            type="primary" 
            shape="circle" 
            icon={<ShoppingCartOutlined />} 
            disabled={stock === 0}
            size="small"
            className={`flex-shrink-0 border-none shadow-md md:w-8 md:h-8 ${stock === 0 ? 'bg-gray-300' : 'bg-primary hover:bg-orange-600'}`}
            onClick={(e) => {
              e.preventDefault(); // Prevent link navigation
              const success = useCartStore.getState().addItem({
                id,
                name,
                price,
                image,
                quantity: 1,
                maxStock: stock,
                categoryId
              });
              if (!success) {
                alert('ไม่สามารถเพิ่มสินค้าได้เกินจำนวนที่มีในคลัง');
              }
            }}
          />
        </div>
      </div>
    </div>
  );
}
