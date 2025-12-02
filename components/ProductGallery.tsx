"use client";
import { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';

interface ProductGalleryProps {
  images: string[];
  activeImage?: string;
}

export default function ProductGallery({ images, activeImage }: ProductGalleryProps) {
  // Filter out empty or invalid images
  const validImages = useMemo(() => images.filter(img => {
    if (!img || typeof img !== 'string') return false;
    const trimmed = img.trim();
    return trimmed.length > 0 && (trimmed.startsWith('/') || trimmed.startsWith('http://') || trimmed.startsWith('https://'));
  }), [images]);
  
  // Use the first valid image or a placeholder
  const [selectedImage, setSelectedImage] = useState(validImages[0] || 'https://via.placeholder.com/500?text=No+Image');

  // Update selected image if activeImage changes
  // Update selected image if activeImage changes
  useEffect(() => {
    if (activeImage) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSelectedImage(activeImage);
    } else if (validImages.length > 0) {
       // If no active image, default to first
       setSelectedImage(validImages[0]);
    }
  }, [activeImage, validImages]);

  if (validImages.length === 0) {
    return (
      <div className="relative aspect-square w-full bg-gray-50 rounded-2xl overflow-hidden border border-border flex items-center justify-center text-gray-400">
        No Image Available
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Main Image */}
      <div className="relative aspect-square w-full bg-gray-50 rounded-2xl overflow-hidden border border-border">
        <Image
          src={selectedImage}
          alt="Product Image"
          fill
          className="object-contain p-4"
          priority
        />
      </div>

      {/* Thumbnails */}
      <div className="grid grid-cols-4 gap-4">
        {validImages.map((img, idx) => (
          <button
            key={idx}
            onClick={() => setSelectedImage(img)}
            className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all ${
              selectedImage === img ? 'border-primary' : 'border-transparent hover:border-gray-300'
            }`}
          >
            <Image
              src={img}
              alt={`Thumbnail ${idx + 1}`}
              fill
              className="object-cover"
            />
          </button>
        ))}
      </div>
    </div>
  );
}
