import { Checkbox, Slider, Radio, Button, Collapse } from 'antd';
import { FilterOutlined } from '@ant-design/icons';
// import type { CheckboxValueType } from 'antd/es/checkbox/Group';
type CheckboxValueType = string | number | boolean;

interface Category {
  id: number;
  name: string;
}

interface FilterState {
  categoryIds: number[];
  priceRange: [number, number];
  condition: string;
  brands: string[];
}

interface FilterSidebarProps {
  categories: Category[];
  brands: string[];
  filters: FilterState;
  setFilters: (filters: FilterState) => void;
  onClear: () => void;
  onApply: () => void;
}

export default function FilterSidebar({ 
  categories, 
  brands, 
  filters, 
  setFilters, 
  onClear,
  onApply
}: FilterSidebarProps) {
  
  const handleCategoryChange = (checkedValues: CheckboxValueType[]) => {
    setFilters({ ...filters, categoryIds: checkedValues as number[] });
  };

  const handleBrandChange = (checkedValues: CheckboxValueType[]) => {
    setFilters({ ...filters, brands: checkedValues as string[] });
  };

  const handlePriceChange = (value: number[]) => {
    setFilters({ ...filters, priceRange: value as [number, number] });
  };

  const handleConditionChange = (e: any) => {
    setFilters({ ...filters, condition: e.target.value });
  };

  return (
    <div className="bg-white p-6 rounded-xl border border-border sticky top-24">
      <div className="flex items-center gap-2 mb-6">
        <FilterOutlined className="text-primary text-lg" />
        <h3 className="font-bold text-lg">ตัวกรองสินค้า</h3>
      </div>

      <Collapse 
        defaultActiveKey={['1', '2', '3', '4']} 
        ghost 
        expandIconPosition="end"
        items={[
          {
            key: '1',
            label: <span className="font-bold">หมวดหมู่</span>,
            children: (
              <Checkbox.Group 
                className="flex flex-col gap-2" 
                value={filters.categoryIds}
                onChange={handleCategoryChange}
              >
                {categories.map(cat => (
                  <Checkbox key={cat.id} value={cat.id}>{cat.name}</Checkbox>
                ))}
              </Checkbox.Group>
            )
          },
          {
            key: '2',
            label: <span className="font-bold">ช่วงราคา</span>,
            children: (
              <>
                <Slider 
                  range 
                  min={0}
                  max={100000}
                  step={1000}
                  value={filters.priceRange} 
                  onChange={handlePriceChange}
                />
                <div className="flex justify-between text-sm text-muted-foreground mt-2">
                  <span>฿{filters.priceRange[0].toLocaleString()}</span>
                  <span>฿{filters.priceRange[1].toLocaleString()}</span>
                </div>
              </>
            )
          },
          {
            key: '3',
            label: <span className="font-bold">สภาพสินค้า</span>,
            children: (
              <Radio.Group 
                className="flex flex-col gap-2" 
                value={filters.condition}
                onChange={handleConditionChange}
              >
                <Radio value="all">ทั้งหมด</Radio>
                <Radio value="New">มือ 1 (New)</Radio>
                <Radio value="Used">มือ 2 (Used)</Radio>
              </Radio.Group>
            )
          },
          {
            key: '4',
            label: <span className="font-bold">ยี่ห้อ</span>,
            children: (
              <Checkbox.Group 
                className="flex flex-col gap-2"
                value={filters.brands}
                onChange={handleBrandChange}
              >
                {brands.map(brand => (
                  <Checkbox key={brand} value={brand}>{brand}</Checkbox>
                ))}
              </Checkbox.Group>
            )
          }
        ]}
      />

      <div className="mt-6 pt-6 border-t border-border flex gap-2">
        <Button type="primary" block onClick={onApply}>ใช้ตัวกรอง</Button>
        <Button block onClick={onClear}>ล้าง</Button>
      </div>
    </div>
  );
}
