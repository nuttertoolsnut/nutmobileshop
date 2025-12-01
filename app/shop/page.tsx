"use client";
import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Select, Pagination, Drawer, Button, Spin } from 'antd';
import { FilterOutlined } from '@ant-design/icons';
import FilterSidebar from '@/components/FilterSidebar';
import ProductCard from '@/components/ProductCard';
import { supabase } from '@/lib/supabaseClient';

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

import { Suspense } from 'react';

function ShopContent() {
  const searchParams = useSearchParams();
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<{id: number, name: string}[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filter State
  const [filters, setFilters] = useState({
    categoryIds: [] as number[],
    priceRange: [0, 100000] as [number, number],
    condition: 'all',
    brands: [] as string[],
  });
  
  const [sortOption, setSortOption] = useState('newest');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      
      // Fetch Categories
      const { data: categoriesData } = await supabase
        .from('categories')
        .select('id, name');
      
      if (categoriesData) {
        setCategories(categoriesData);
      }

      // Fetch Products
      const { data: productsData, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching products:', error);
      } else {
        setProducts(productsData || []);
      }
      setLoading(false);
    };

    void fetchData();
  }, []);

  // Derived State: Unique Brands
  const availableBrands = Array.from(new Set(products.map(p => p.brand).filter(Boolean))) as string[];

  // Filter Logic
  const filteredProducts = products.filter(product => {
    // Search Query Filter
    const searchQuery = searchParams.get('search')?.toLowerCase();
    
    if (searchQuery && !product.name.toLowerCase().includes(searchQuery)) {
      return false;
    }

    // Category Filter
    if (filters.categoryIds.length > 0 && !filters.categoryIds.includes(product.category_id)) {
      return false;
    }

    // Price Filter
    if (product.price < filters.priceRange[0] || product.price > filters.priceRange[1]) {
      return false;
    }

    // Condition Filter
    if (filters.condition !== 'all' && product.condition !== filters.condition) {
      return false;
    }

    // Brand Filter
    if (filters.brands.length > 0 && !filters.brands.includes(product.brand)) {
      return false;
    }

    return true;
  }).sort((a, b) => {
    // Sort Logic
    switch (sortOption) {
      case 'price_asc':
        return a.price - b.price;
      case 'price_desc':
        return b.price - a.price;
      case 'newest':
      default:
        return new Date(b.created_at || '').getTime() - new Date(a.created_at || '').getTime();
    }
  });

  const handleClearFilters = () => {
    setFilters({
      categoryIds: [],
      priceRange: [0, 100000],
      condition: 'all',
      brands: [],
    });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      
      {/* Header & Mobile Filter Toggle */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold">สินค้าทั้งหมด</h1>
          <p className="text-muted-foreground">พบสินค้า {filteredProducts.length} รายการ</p>
        </div>
        
        <div className="flex items-center gap-4 w-full md:w-auto">
          <Button 
            icon={<FilterOutlined />} 
            className="md:hidden flex-1" 
            onClick={() => setIsFilterOpen(true)}
          >
            ตัวกรอง
          </Button>
          
          <Select 
            value={sortOption}
            onChange={setSortOption}
            style={{ width: 200 }} 
            className="flex-1 md:flex-none"
          >
            <Select.Option value="newest">มาใหม่ล่าสุด</Select.Option>
            <Select.Option value="price_asc">ราคา: ต่ำ - สูง</Select.Option>
            <Select.Option value="price_desc">ราคา: สูง - ต่ำ</Select.Option>
          </Select>
        </div>
      </div>

      <div className="flex gap-8">
        {/* Sidebar (Desktop) */}
        <aside className="hidden md:block w-64 flex-shrink-0">
          <FilterSidebar 
            categories={categories}
            brands={availableBrands}
            filters={filters}
            setFilters={setFilters}
            onClear={handleClearFilters}
            onApply={() => {}} // Auto-applies in this implementation, but keeping prop for compatibility
          />
        </aside>

        {/* Product Grid */}
        <main className="flex-1">
          {loading ? (
            <div className="flex justify-center py-20"><Spin size="large" /></div>
          ) : (
            <>
              {filteredProducts.length > 0 ? (
                <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-6">
                  {filteredProducts.map((product) => (
                    <ProductCard 
                      key={product.id} 
                      id={product.id}
                      name={product.name}
                      price={product.price}
                      originalPrice={product.original_price}
                      image={product.image_url}
                      condition={product.condition}
                      isNew={product.is_featured} 
                      stock={product.stock}
                      categoryId={product.category_id}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-20 text-gray-500">
                  ไม่พบสินค้าที่ตรงกับเงื่อนไข
                </div>
              )}
            </>
          )}

          {/* Pagination - Static for now as we do client-side filtering */}
          {filteredProducts.length > 0 && (
            <div className="mt-12 flex justify-center">
              <Pagination defaultCurrent={1} total={filteredProducts.length} pageSize={12} hideOnSinglePage />
            </div>
          )}
        </main>
      </div>

      {/* Mobile Filter Drawer */}
      <Drawer
        title="ตัวกรองสินค้า"
        placement="left"
        onClose={() => setIsFilterOpen(false)}
        open={isFilterOpen}
        size="default"
      >
        <FilterSidebar 
            categories={categories}
            brands={availableBrands}
            filters={filters}
            setFilters={setFilters}
            onClear={handleClearFilters}
            onApply={() => setIsFilterOpen(false)}
        />
      </Drawer>
    </div>
  );
}

export default function ShopPage() {
  return (
    <Suspense fallback={<div className="flex justify-center py-20"><Spin size="large" /></div>}>
      <ShopContent />
    </Suspense>
  );
}
