"use client";
import { useState } from 'react';
import { Upload, App, Modal } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import type { UploadFile, UploadProps } from 'antd/es/upload/interface';
import { supabase } from '@/lib/supabaseClient';
import Image from 'next/image';

interface ImageUploadProps {
  value?: string | string[];
  onChange?: (url: string | string[]) => void;
  maxCount?: number;
  folder?: string;
}

export default function ImageUpload({ value, onChange, maxCount = 1, folder = 'products' }: ImageUploadProps) {
  const { message } = App.useApp();
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState('');
  // const [uploading, setUploading] = useState(false); // Unused for now

  // Convert value (string or array) to Antd fileList format
  const fileList: UploadFile[] = Array.isArray(value) 
    ? value.map((url, index) => ({ uid: `-${index}`, name: `image-${index}`, status: 'done', url }))
    : value ? [{ uid: '-1', name: 'image', status: 'done', url: value }] : [];

  const handlePreview = async (file: UploadFile) => {
    setPreviewImage(file.url || (file.preview as string));
    setPreviewOpen(true);
  };

  const handleChange: UploadProps['onChange'] = ({ fileList: newFileList }) => {
    // We only handle removal here, addition is handled in customRequest
    if (newFileList.length < fileList.length) {
       const newUrls = newFileList.map(file => file.url).filter(Boolean) as string[];
       onChange?.(maxCount === 1 ? (newUrls[0] || '') : newUrls);
    }
  };

  const customRequest = async (options: unknown) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { file, onSuccess, onError } = options as any;
    // setUploading(true);

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${folder}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('products')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('products')
        .getPublicUrl(fileName);

      // Update parent state
      let newUrls: string[];
      if (maxCount === 1) {
        newUrls = [publicUrl];
        onChange?.(publicUrl);
      } else {
        const currentUrls = Array.isArray(value) ? value : (value ? [value] : []);
        newUrls = [...currentUrls, publicUrl];
        onChange?.(newUrls);
      }

      onSuccess(publicUrl);
      message.success('Upload successful');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      message.error('Upload failed: ' + errorMessage);
      onError(error);
    } 
    // finally {
    //   setUploading(false);
    // }
  };

  const uploadButton = (
    <div>
      <PlusOutlined />
      <div style={{ marginTop: 8 }}>Upload</div>
    </div>
  );

  return (
    <>
      <Upload
        listType="picture-card"
        fileList={fileList}
        onPreview={handlePreview}
        onChange={handleChange}
        customRequest={customRequest}
        maxCount={maxCount}
        accept="image/*"
      >
        {fileList.length >= maxCount ? null : uploadButton}
      </Upload>
      <Modal open={previewOpen} footer={null} onCancel={() => setPreviewOpen(false)}>
        <Image alt="example" style={{ width: '100%' }} src={previewImage} width={500} height={500} unoptimized />
      </Modal>
    </>
  );
}
