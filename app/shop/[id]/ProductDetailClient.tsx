"use client";
import { useState, useEffect, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Rate, Tag, Button, App, Spin, Divider } from 'antd';
import { ShoppingCartOutlined, CheckCircleFilled } from '@ant-design/icons';
import ProductGallery from '@/components/ProductGallery';
import { useCartStore } from '@/store/useCartStore';
import { supabase } from '@/lib/supabaseClient';

interface ProductDetail {
  id: number;
  name: string;
  description: string;
  price: number;
  original_price?: number;
  condition: string;
  image_url: string;
  images: string[]; // JSONB array
  specs: Record<string, string>; // JSONB object
  stock: number;
}

interface ProductVariant {
  id: number;
  color: string;
  storage: string;
  price: number;
  stock: number;
  image_url?: string;
}

export default function ProductDetailClient() {
  const { message } = App.useApp();
  const params = useParams();
  const router = useRouter(); // Use Next.js router
  const addItem = useCartStore((state) => state.addItem);
  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [variants, setVariants] = useState<ProductVariant[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [selectedStorage, setSelectedStorage] = useState<string>('');
  const [displayImage, setDisplayImage] = useState<string>('');

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      // Fetch Product
      const { data: productData, error: productError } = await supabase
        .from('products')
        .select('*')
        .eq('id', params.id)
        .single();
      
      if (productError) {
        message.error('ไม่พบสินค้า');
        setLoading(false);
        return;
      }
      setProduct(productData);
      setDisplayImage(productData.image_url);

      // Fetch Variants
      const { data: variantsData } = await supabase
        .from('product_variants')
        .select('*')
        .eq('product_id', params.id);
      
      setVariants(variantsData || []);
      
      setLoading(false);
    };

    if (params.id) {
      void fetchProduct();
    }
  }, [params.id, message]);

  // Derive unique options
  const colorOptions = useMemo(() => Array.from(new Set(variants.map(v => v.color).filter(Boolean))), [variants]);
  const storageOptions = useMemo(() => Array.from(new Set(variants.map(v => v.storage).filter(Boolean))), [variants]);

  // Find selected variant
  const currentVariant = useMemo(() => {
    return variants.find(v => {
      const colorMatch = !v.color || v.color === selectedColor;
      const storageMatch = !v.storage || v.storage === selectedStorage;
      return colorMatch && storageMatch;
    });
  }, [variants, selectedColor, selectedStorage]);

  if (loading) return <div className="flex justify-center py-20"><Spin size="large" /></div>;
  if (!product) return <div className="text-center py-20">ไม่พบสินค้า</div>;

  // Determine display price
  const displayPrice = currentVariant?.price || product.price || 0;
  
  // Fix stock logic: 
  const isOutOfStock = variants.length > 0 
    ? (currentVariant ? currentVariant.stock <= 0 : false) 
    : product.stock <= 0;

  const handleAddToCart = () => {
    if (variants.length > 0 && !currentVariant) {
      message.error('กรุณาเลือกตัวเลือกสินค้าให้ครบถ้วน');
      return;
    }

    if (isOutOfStock) {
      message.error('สินค้าหมด');
      return;
    }

    const stockLimit = currentVariant ? currentVariant.stock : product.stock;

    const success = addItem({
      id: product.id,
      name: product.name,
      price: displayPrice,
      image: product.image_url,
      variant: currentVariant ? `${selectedColor} / ${selectedStorage}` : undefined,
      quantity: 1,
      maxStock: stockLimit
    });

    if (!success) {
      message.error('ไม่สามารถเพิ่มสินค้าได้เกินจำนวนที่มีในคลัง');
      return;
    }

    message.success('เพิ่มสินค้าลงตะกร้าแล้ว');
  };

  const handleBuyNow = async () => {
    if (variants.length > 0 && !currentVariant) {
      message.error('กรุณาเลือกตัวเลือกสินค้าให้ครบถ้วน');
      return;
    }
    
    if (isOutOfStock) {
      message.error('สินค้าหมด');
      return;
    }

    const stockLimit = currentVariant ? currentVariant.stock : product.stock;

    const success = addItem({
      id: product.id,
      name: product.name,
      price: displayPrice,
      image: product.image_url,
      variant: currentVariant ? `${selectedColor} / ${selectedStorage}` : undefined,
      quantity: 1,
      maxStock: stockLimit
    });

    if (!success) {
      message.error('ไม่สามารถเพิ่มสินค้าได้เกินจำนวนที่มีในคลัง');
      return;
    }

    // Check Auth
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      router.push('/checkout');
    } else {
      router.push('/login?returnUrl=/checkout');
    }
  };

  // Ensure images array exists
  const allImages = [product.image_url, ...(product.images || [])];
  const galleryImages = Array.from(new Set(allImages.filter(Boolean)));

  return (
    <div className="container mx-auto px-4 py-8 pb-32 md:pb-8">
      <div className="grid md:grid-cols-2 gap-8 md:gap-12">
        {/* Left: Gallery */}
        <ProductGallery images={galleryImages} activeImage={displayImage} />

        {/* Right: Info */}
        <div className="space-y-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Tag color={product.condition === 'New' ? 'green' : 'orange'} className="text-sm px-2 py-0.5">
                {product.condition === 'New' ? 'สินค้าใหม่' : 'มือสอง'}
              </Tag>
              <Tag color="blue" className="text-sm px-2 py-0.5">ประกันศูนย์ 1 ปี</Tag>
            </div>
            <h1 className="text-2xl md:text-4xl font-bold text-foreground">{product.name}</h1>
            <p className="text-muted-foreground mt-2 text-sm md:text-base">{product.description}</p>
            <div className="flex items-center gap-2 mt-2">
              <Rate disabled defaultValue={5} className="text-yellow-400 text-sm" />
              <span className="text-muted-foreground text-sm">(128 รีวิว)</span>
            </div>
          </div>

          <div className="bg-muted/30 p-4 rounded-xl border border-border">
            {product.original_price && (
              <div className="text-muted-foreground text-sm line-through">฿{product.original_price.toLocaleString()}</div>
            )}
            <div className="text-3xl font-bold text-primary">฿{displayPrice.toLocaleString()}</div>
            <div className={`text-sm mt-2 font-medium ${isOutOfStock ? 'text-red-500' : 'text-green-600'}`}>
              {isOutOfStock 
                ? 'สินค้าหมด (Out of Stock)' 
                : `มีสินค้าในคลัง: ${variants.length > 0 && currentVariant ? currentVariant.stock : product.stock} ชิ้น`
              }
            </div>
          </div>

          <Divider className="my-4 md:my-6" />

          {/* Variants */}
          {variants.length > 0 && (
            <div className="space-y-6">
              {colorOptions.length > 0 && (
                <div>
                  <h3 className="font-bold mb-3 text-base md:text-lg">สี (Color)</h3>
                  <div className="grid grid-cols-3 gap-3">
                    {colorOptions.map((color) => {
                      // Check if this color has any stock at all
                      const hasStock = variants.some(v => v.color === color && v.stock > 0);
                      // Check if this color is compatible with currently selected storage
                      const isCompatible = !selectedStorage || variants.some(v => v.color === color && v.storage === selectedStorage && v.stock > 0);
                      const isSelected = selectedColor === color;
                      
                      return (
                        <button
                          key={color}
                          onClick={() => {
                            if (!hasStock) return;
                            setSelectedColor(color);
                            
                            // Update display image
                            const variantWithImage = variants.find(v => v.color === color && v.image_url);
                            if (variantWithImage) {
                              setDisplayImage(variantWithImage.image_url!);
                            } else if (product) {
                              setDisplayImage(product.image_url);
                            }

                            // If new color is not compatible with current storage, clear storage
                            if (selectedStorage && !variants.some(v => v.color === color && v.storage === selectedStorage && v.stock > 0)) {
                              setSelectedStorage('');
                            }
                          }}
                          disabled={!hasStock}
                          className={`
                            relative px-4 py-3 rounded-xl border-2 text-sm font-medium transition-all
                            ${isSelected 
                              ? 'border-primary bg-primary/5 text-primary' 
                              : 'border-border bg-background hover:border-primary/50 text-foreground'
                            }
                            ${!hasStock ? 'opacity-50 cursor-not-allowed bg-muted' : 'cursor-pointer'}
                            ${(!isSelected && hasStock && !isCompatible) ? 'opacity-75' : ''}
                          `}
                        >
                          {color}
                          {isSelected && (
                            <div className="absolute top-0 right-0 -mt-2 -mr-2 text-primary bg-background rounded-full">
                              <CheckCircleFilled />
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {storageOptions.length > 0 && (
                <div>
                  <h3 className="font-bold mb-3 text-base md:text-lg">ความจุ (Storage)</h3>
                  <div className="grid grid-cols-3 gap-3">
                    {storageOptions.map((storage) => {
                      // Check if this storage has any stock at all
                      const hasStock = variants.some(v => v.storage === storage && v.stock > 0);
                      // Check if this storage is compatible with currently selected color
                      const isCompatible = !selectedColor || variants.some(v => v.storage === storage && v.color === selectedColor && v.stock > 0);
                      const isSelected = selectedStorage === storage;

                      return (
                        <button
                          key={storage}
                          onClick={() => {
                            if (!hasStock) return;
                            setSelectedStorage(storage);
                            // If new storage is not compatible with current color, clear color
                            if (selectedColor && !variants.some(v => v.storage === storage && v.color === selectedColor && v.stock > 0)) {
                              setSelectedColor('');
                            }
                          }}
                          disabled={!hasStock}
                          className={`
                            relative px-4 py-3 rounded-xl border-2 text-sm font-medium transition-all
                            ${isSelected 
                              ? 'border-primary bg-primary/5 text-primary' 
                              : 'border-border bg-background hover:border-primary/50 text-foreground'
                            }
                            ${!hasStock ? 'opacity-50 cursor-not-allowed bg-muted' : 'cursor-pointer'}
                            ${(!isSelected && hasStock && !isCompatible) ? 'opacity-75' : ''}
                          `}
                        >
                          {storage}
                          {isSelected && (
                            <div className="absolute top-0 right-0 -mt-2 -mr-2 text-primary bg-background rounded-full">
                              <CheckCircleFilled />
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {variants.length > 0 && <Divider className="hidden md:block" />}

          {/* Desktop Actions */}
          <div className="hidden md:flex gap-4">
            <Button 
              type="primary" 
              size="large" 
              icon={<ShoppingCartOutlined />} 
              className="flex-1 h-12 text-lg font-bold"
              onClick={handleAddToCart}
              disabled={isOutOfStock}
            >
              {isOutOfStock ? 'สินค้าหมด' : 'เพิ่มลงตะกร้า'}
            </Button>
            <Button 
              size="large" 
              className="flex-1 h-12 text-lg font-bold" 
              disabled={isOutOfStock}
              onClick={handleBuyNow}
            >
              ซื้อทันที
            </Button>
          </div>

          {/* Mobile Sticky Actions */}
          <div className="fixed bottom-0 left-0 right-0 p-4 bg-background border-t border-border md:hidden z-50 safe-area-bottom shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)]">
            <div className="flex gap-3">
              <Button 
                type="primary" 
                size="large" 
                icon={<ShoppingCartOutlined />} 
                className="flex-1 h-12 text-base font-bold"
                onClick={handleAddToCart}
                disabled={isOutOfStock}
              >
                เพิ่มลงตะกร้า
              </Button>
              <Button 
                size="large" 
                className="flex-1 h-12 text-base font-bold" 
                disabled={isOutOfStock}
                onClick={handleBuyNow}
              >
                ซื้อทันที
              </Button>
            </div>
          </div>

          {/* Specs */}
          {product.specs && (
            <div className="bg-gray-50 p-6 rounded-xl space-y-3 mt-6">
              <h3 className="font-bold">สเปคโดยย่อ</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                {Object.entries(product.specs).map(([key, value]) => (
                  <li key={key} className="flex items-center gap-2">
                    <CheckCircleFilled className="text-green-500" /> <span className="capitalize">{key}:</span> {value}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
