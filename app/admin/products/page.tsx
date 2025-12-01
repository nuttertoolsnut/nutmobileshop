"use client";
import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Table, Button, Modal, Form, Input, Select, App, Space, Tag, Row, Col, Tabs, InputNumber, Card, AutoComplete, Spin } from 'antd';
import { PlusOutlined, DeleteOutlined, EditOutlined } from '@ant-design/icons';
import Image from 'next/image';
import ImageUpload from '@/components/ImageUpload';

interface Product {
  id: number;
  name: string;
  category_id: number;
  condition: string;
  price: number;
  image_url: string;
  images?: string[];
  description?: string;
  stock?: number;
  brand?: string;
}

interface Category {
  id: number;
  name: string;
}

interface Branch {
  id: number;
  name: string;
}

interface ProductStock {
  branch_id: number;
  quantity: number;
}

interface ProductVariant {
  id?: number;
  product_id?: number;
  color: string;
  storage: string;
  price: number;
  stock: number;
  image_url?: string;
}

export default function AdminPage() {
  const { message, modal } = App.useApp();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [variants, setVariants] = useState<ProductVariant[]>([]);
  const [searchText, setSearchText] = useState('');
  const [form] = Form.useForm();

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase.from('products').select('*').order('id', { ascending: false });
    if (error) message.error('Error fetching products: ' + error.message);
    else setProducts(data || []);
    setLoading(false);
  }, []);

  const filteredProducts = products.filter(product => 
    product.name.toLowerCase().includes(searchText.toLowerCase()) ||
    product.id.toString().includes(searchText)
  );

  const fetchCategories = useCallback(async () => {
    const { data } = await supabase.from('categories').select('*');
    setCategories(data || []);
  }, []);

  const fetchBranches = useCallback(async () => {
    const { data } = await supabase.from('branches').select('*');
    setBranches(data || []);
  }, []);

  useEffect(() => {
    void fetchProducts();
    void fetchCategories();
    void fetchBranches();
  }, [fetchProducts, fetchCategories, fetchBranches]);

  const handleEdit = async (product: Product) => {
    setEditingId(product.id);
    form.setFieldsValue(product);
    
    // Fetch stock for this product
    const { data: stocks } = await supabase
      .from('product_stock')
      .select('branch_id, quantity')
      .eq('product_id', product.id);

    // Map stock to form fields (e.g., stock_1, stock_2)
    const stockValues: Record<string, number> = {};
    stocks?.forEach((s: ProductStock) => {
      stockValues[`stock_${s.branch_id}`] = s.quantity;
    });
    form.setFieldsValue(stockValues);

    // Fetch Variants
    const { data: variantsData } = await supabase
      .from('product_variants')
      .select('*')
      .eq('product_id', product.id);
    
    setVariants(variantsData || []);
    
    setIsModalOpen(true);
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleSave = async (values: any) => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { name, category_id, condition, price, image_url, images, description, brand, ...rest } = values;
    
    const productPayload = {
      name, 
      category_id, 
      condition, 
      price: Number(price), 
      image_url, 
      images, 
      description,
      brand,
      stock: Number(rest.stock || 0),
      // Default image if empty
      ...( !image_url && { image_url: "https://via.placeholder.com/300?text=No+Image" })
    };

    let productId = editingId;

    try {
      if (editingId) {
        // Update
        const { error } = await supabase.from('products').update(productPayload).eq('id', editingId);
        if (error) throw error;
      } else {
        // Insert
        const { data, error } = await supabase.from('products').insert([productPayload]).select().single();
        if (error) throw error;
        productId = data.id;
      }

      // Update Stock (Branch-based)
      if (productId) {
        const stockUpdates = branches.map(branch => ({
          product_id: productId,
          branch_id: branch.id,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          quantity: (rest as any)[`stock_${branch.id}`] || 0,
          updated_at: new Date().toISOString()
        }));

        const { error: stockError } = await supabase.from('product_stock').upsert(stockUpdates, { onConflict: 'product_id, branch_id' });
        if (stockError) message.error('Stock update failed: ' + stockError.message);

        // Update Variants
        // First delete existing variants (simple approach for now, or use upsert if IDs are tracked)
        // For simplicity in this phase, we'll delete and re-insert or upsert. 
        // Better: Upsert based on ID if exists, insert if new.
        
        // Filter out empty variants
           // 1. Identify valid variants (must have color and storage)
           const validVariants = variants.filter(v => v.color && v.storage);
           const invalidVariants = variants.filter(v => !v.color || !v.storage);
           
           if (invalidVariants.length > 0) {
             console.warn('Skipping invalid variants (missing color or storage):', invalidVariants);
             message.warning(`${invalidVariants.length} variants were skipped because they are missing Color or Storage.`);
           }

           if (validVariants.length > 0) {
             // 2. Prepare lists for Insert and Update
             const variantsToInsert = validVariants.filter(v => !v.id).map(v => ({
               product_id: productId,
               color: v.color,
               storage: v.storage,
               price: v.price || productPayload.price,
               stock: v.stock || 0,
               name: `${v.color} - ${v.storage}`,
               image_url: v.image_url
             }));

             const variantsToUpdate = validVariants.filter(v => v.id).map(v => ({
               id: v.id,
               product_id: productId,
               color: v.color,
               storage: v.storage,
               price: v.price || productPayload.price,
               stock: v.stock || 0,
               name: `${v.color} - ${v.storage}`,
               image_url: v.image_url
             }));

           // 3. Delete removed variants
           // Get IDs of variants that are still in the list
           const keptIds = validVariants.map(v => v.id).filter(id => id !== undefined);
           
           if (productId) {
             // Delete any variant for this product that is NOT in the keptIds list
             let query = supabase.from('product_variants').delete().eq('product_id', productId);
             
             if (keptIds.length > 0) {
               query = query.not('id', 'in', `(${keptIds.join(',')})`);
             }
             
             const { error: deleteError } = await query;
             if (deleteError) {
               console.error('Variant Delete Error:', deleteError);
               // Don't throw, just log. Proceed to save others.
             }
           }

           // 4. Execute Insert and Update
           if (variantsToInsert.length > 0) {
             const { error: insertError } = await supabase.from('product_variants').insert(variantsToInsert);
             if (insertError) {
               console.error('Variant Insert Error:', insertError);
               throw insertError;
             }
           }

           if (variantsToUpdate.length > 0) {
             const { error: updateError } = await supabase.from('product_variants').upsert(variantsToUpdate);
             if (updateError) {
               console.error('Variant Update Error:', updateError);
               throw updateError;
             }
           }
        } else {
           // If no valid variants in UI, but we are editing, we might need to delete ALL existing variants?
           // Or maybe the user just didn't add any.
           // For safety, if variants array is empty, we delete all for this product.
           if (variants.length === 0 && productId) {
              await supabase.from('product_variants').delete().eq('product_id', productId);
           }
        }
      }

      message.success('Saved successfully');
      setIsModalOpen(false);
      form.resetFields();
      setEditingId(null);
      setVariants([]);
      void fetchProducts();
    } catch (error: any) {
      console.error('Save error object:', error);
      console.error('Save error message:', error.message);
      console.error('Save error details:', error.details);
      message.error('Save failed: ' + (error.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (id: number) => {
    modal.confirm({
      title: 'Delete Product',
      content: 'Are you sure you want to delete this product? This action cannot be undone.',
      okText: 'Delete',
      okType: 'danger',
      cancelText: 'Cancel',
      onOk: async () => {
        const { error } = await supabase.from('products').delete().eq('id', id);
        if (error) message.error('Delete failed: ' + error.message);
        else {
          message.success('Deleted successfully');
          void fetchProducts();
        }
      },
    });
  };

  const handleAddVariant = () => {
    setVariants([...variants, { color: '', storage: '', price: 0, stock: 0, image_url: '' }]);
  };

  const handleRemoveVariant = async (index: number) => {
    const variantToRemove = variants[index];
    if (variantToRemove.id) {
       // If it has an ID, delete from DB immediately or mark for deletion
       const { error } = await supabase.from('product_variants').delete().eq('id', variantToRemove.id);
       if (error) {
         message.error('Failed to delete variant');
         return;
       }
    }
    const newVariants = [...variants];
    newVariants.splice(index, 1);
    setVariants(newVariants);
  };

  const handleVariantChange = (index: number, field: keyof ProductVariant, value: any) => {
    const newVariants = [...variants];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (newVariants[index] as any)[field] = value;
    setVariants(newVariants);
  };

  const columns = [
    { title: 'ID', dataIndex: 'id', width: 60 },
    { 
      title: 'Image', 
      dataIndex: 'image_url', 
      render: (url: string) => <Image src={url} alt="img" width={50} height={50} style={{objectFit: 'cover', borderRadius: 4}} unoptimized /> 
    },
    { title: 'Name', dataIndex: 'name' },
    { 
      title: 'Category', 
      dataIndex: 'category_id',
      render: (id: number) => categories.find(c => c.id === id)?.name || id
    },
    { title: 'Stock', dataIndex: 'stock', render: (val: number) => val || 0 },
    { title: 'Price', dataIndex: 'price', render: (price: number) => `฿${price.toLocaleString()}` },
    {
      title: 'Action',
      key: 'action',
      render: (_: unknown, record: Product) => (
        <Space>
          <Button icon={<EditOutlined />} size="small" onClick={() => handleEdit(record)} />
          <Button icon={<DeleteOutlined />} danger size="small" onClick={() => handleDelete(record.id)} />
        </Space>
      ),
    },
  ];

  const MobileProductCard = ({ product }: { product: Product }) => (
    <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm mb-4">
      <div className="flex gap-4">
        <div className="w-20 h-20 flex-shrink-0 relative rounded-lg overflow-hidden bg-gray-100">
          <Image 
            src={product.image_url || "https://via.placeholder.com/300?text=No+Image"} 
            alt={product.name}
            fill
            className="object-cover"
            unoptimized
          />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-start">
            <h3 className="font-bold text-gray-900 truncate pr-2">{product.name}</h3>
            <span className="text-xs text-gray-400">#{product.id}</span>
          </div>
          <p className="text-sm text-gray-500 mb-1">
            {categories.find(c => c.id === product.category_id)?.name || '-'}
          </p>
          <div className="flex justify-between items-end mt-2">
            <div>
              <div className="text-lg font-bold text-primary">฿{product.price.toLocaleString()}</div>
              <div className="text-xs text-gray-500">Stock: {product.stock || 0}</div>
            </div>
            <Space>
              <Button icon={<EditOutlined />} size="small" onClick={() => handleEdit(product)} />
              <Button icon={<DeleteOutlined />} danger size="small" onClick={() => handleDelete(product.id)} />
            </Space>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 m-0">Product Management</h1>
          <p className="text-gray-500 text-sm mt-1">Manage your inventory and products</p>
        </div>
        <div className="flex w-full md:w-auto gap-2">
          <Input.Search 
            placeholder="Search products..." 
            allowClear 
            onSearch={value => setSearchText(value)}
            onChange={e => setSearchText(e.target.value)}
            className="w-full md:w-[300px]"
          />
          <Button type="primary" icon={<PlusOutlined />} onClick={() => { setEditingId(null); setVariants([]); form.resetFields(); setIsModalOpen(true); }} className="flex-shrink-0">
            Add New
          </Button>
        </div>
      </div>

      {/* Desktop View */}
      <div className="hidden md:block bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
        <Table dataSource={filteredProducts} columns={columns} rowKey="id" loading={loading} />
      </div>

      {/* Mobile View */}
      <div className="md:hidden">
        {loading ? (
          <div className="flex justify-center py-10"><Spin size="large" /></div>
        ) : filteredProducts.length > 0 ? (
          filteredProducts.map(product => <MobileProductCard key={product.id} product={product} />)
        ) : (
          <div className="text-center py-10 text-gray-400 bg-white rounded-xl border border-dashed">
            <p>No products found</p>
          </div>
        )}
      </div>

      <Modal 
        title={editingId ? "Edit Product" : "Add New Product"} 
        open={isModalOpen} 
        onCancel={() => setIsModalOpen(false)} 
        footer={null}
        width={900}
        forceRender
        style={{ top: 20 }}
        className="product-modal"
      >
        <Form form={form} layout="vertical" onFinish={handleSave}>
          <Tabs defaultActiveKey="1" items={[
            {
              key: '1',
              label: 'Basic Info',
              children: (
                <>
                  <Form.Item label="Product Name" name="name" rules={[{ required: true }]}>
                    <Input />
                  </Form.Item>
                  <Form.Item label="Brand" name="brand" rules={[{ required: true, message: 'Please select or type a brand' }]}>
                    <AutoComplete
                      placeholder="Select or Type Brand"
                      filterOption={(inputValue, option) =>
                        option!.value.toUpperCase().indexOf(inputValue.toUpperCase()) !== -1
                      }
                      options={[
                        { value: 'Apple' },
                        { value: 'Samsung' },
                        { value: 'Oppo' },
                        { value: 'Vivo' },
                        { value: 'Realme' },
                        { value: 'Xiaomi' },
                        { value: 'Redmi' },
                        { value: 'Honor' },
                        { value: 'Infinix' },
                        { value: 'Tecno' },
                      ]}
                    />
                  </Form.Item>
                  <Row gutter={16}>
                    <Col span={12}>
                      <Form.Item label="Category" name="category_id" rules={[{ required: true }]}>
                        <Select placeholder="Select Category">
                          {categories.map(c => (
                            <Select.Option key={c.id} value={c.id}>{c.name}</Select.Option>
                          ))}
                        </Select>
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item label="Condition" name="condition" initialValue="New">
                        <Select>
                          <Select.Option value="New">New</Select.Option>
                          <Select.Option value="Used">Used</Select.Option>
                        </Select>
                      </Form.Item>
                    </Col>
                  </Row>
                  <Form.Item label="Base Price (THB)" name="price" rules={[{ required: true }]}>
                    <Input type="number" prefix="฿" />
                  </Form.Item>
                  <Form.Item label="Description" name="description">
                    <Input.TextArea rows={3} />
                  </Form.Item>
                  <Form.Item label="Stock (Warehouse)" name="stock" rules={[{ required: true }]} initialValue={0}>
                    <InputNumber min={0} style={{ width: '100%' }} />
                  </Form.Item>
                </>
              )
            },
            {
              key: '2',
              label: 'Images',
              children: (
                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item label="Main Image" name="image_url" rules={[{ required: true }]}>
                       <ImageUpload maxCount={1} />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item label="Gallery" name="images">
                       <ImageUpload maxCount={5} />
                    </Form.Item>
                  </Col>
                </Row>
              )
            },
            {
              key: '3',
              label: 'Variants (Color/Storage)',
              children: (
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <p className="text-gray-500 mb-0">Manage product variants like Color and Storage.</p>
                    <Button type="dashed" icon={<PlusOutlined />} onClick={handleAddVariant}>Add Variant</Button>
                  </div>
                  
                  <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
                    {variants.map((variant, index) => (
                      <Card key={index} size="small" title={`Variant #${index + 1}`} extra={<Button danger icon={<DeleteOutlined />} size="small" onClick={() => handleRemoveVariant(index)} />}>
                        <Row gutter={12}>
                          <Col span={8}>
                            <Form.Item label="Color" style={{ marginBottom: 0 }}>
                              <Select 
                                value={variant.color ? [variant.color] : []} 
                                onChange={(val) => handleVariantChange(index, 'color', val && val.length > 0 ? val[val.length - 1] : '')}
                                showSearch
                                mode="tags"
                                maxCount={1}
                                placeholder="e.g. Natural Titanium"
                                options={[
                                  { value: 'Natural Titanium', label: 'Natural Titanium' },
                                  { value: 'Blue Titanium', label: 'Blue Titanium' },
                                  { value: 'White Titanium', label: 'White Titanium' },
                                  { value: 'Black Titanium', label: 'Black Titanium' },
                                  { value: 'Black', label: 'Black' },
                                  { value: 'White', label: 'White' },
                                  { value: 'Gold', label: 'Gold' },
                                  { value: 'Silver', label: 'Silver' },
                                ]}
                              />
                            </Form.Item>
                          </Col>
                          <Col span={6}>
                            <Form.Item label="Storage" style={{ marginBottom: 0 }}>
                              <Select 
                                value={variant.storage ? [variant.storage] : []} 
                                onChange={(val) => handleVariantChange(index, 'storage', val && val.length > 0 ? val[val.length - 1] : '')}
                                showSearch
                                mode="tags"
                                maxCount={1}
                                placeholder="e.g. 256GB"
                                options={[
                                  { value: '64GB', label: '64GB' },
                                  { value: '128GB', label: '128GB' },
                                  { value: '256GB', label: '256GB' },
                                  { value: '512GB', label: '512GB' },
                                  { value: '1TB', label: '1TB' },
                                ]}
                              />
                            </Form.Item>
                          </Col>
                          <Col span={5}>
                             <Form.Item label="Price" style={{ marginBottom: 0 }}>
                               <InputNumber 
                                 value={variant.price} 
                                 onChange={(val) => handleVariantChange(index, 'price', val)} 
                                 style={{ width: '100%' }}
                                 formatter={value => `฿ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                 parser={value => value?.replace(/\฿\s?|(,*)/g, '') as unknown as number}
                               />
                             </Form.Item>
                          </Col>
                          <Col span={5}>
                             <Form.Item label="Stock" style={{ marginBottom: 0 }}>
                               <InputNumber 
                                 value={variant.stock} 
                                 onChange={(val) => handleVariantChange(index, 'stock', val)} 
                                 style={{ width: '100%' }}
                               />
                              </Form.Item>
                          </Col>
                        </Row>
                        <div className="mt-2">
                          <p className="mb-1 text-xs text-gray-500">Variant Image (Specific to this color)</p>
                          <ImageUpload 
                            value={variant.image_url ? [variant.image_url] : []}
                            onChange={(val) => handleVariantChange(index, 'image_url', val as string)}
                            maxCount={1}
                          />
                        </div>
                      </Card>
                    ))}
                    {variants.length === 0 && <div className="text-center py-8 text-gray-400 border border-dashed rounded">No variants added yet.</div>}
                  </div>
                </div>
              )
            },
            {
              key: '4',
              label: 'Branch Stock',
              children: (
                <div>
                  <p className="mb-4 text-gray-500">Manage total stock quantity for each branch (for non-variant products or aggregate).</p>
                  {branches.map(branch => (
                    <Form.Item key={branch.id} label={branch.name} name={`stock_${branch.id}`} initialValue={0}>
                      <InputNumber min={0} style={{ width: '100%' }} />
                    </Form.Item>
                  ))}
                </div>
              )
            }
          ]} />

          <Button type="primary" htmlType="submit" block loading={loading} style={{ marginTop: 10 }}>
            Save Product
          </Button>
        </Form>
      </Modal>
    </div>
  );
}