import React from 'react';
// @ts-ignore
import defaultProductImage from '@/assets/images/regenerated_image_1785281720906.jpg';

const CLOUD_NAME = (import.meta as any).env.VITE_CLOUDINARY_CLOUD_NAME || 'x6mkqvcj';

export const getProductImageUrl = (sku?: string, imageUrl?: string, productObj?: any): string => {
  // Try to find any property that sounds like imageurl
  if (!imageUrl && productObj) {
    const keys = Object.keys(productObj);
    for (const k of keys) {
      if (k.toLowerCase().replace(/[^a-z0-z]/g, '') === 'imageurl') {
        imageUrl = productObj[k];
        break;
      }
    }
  }

  if (imageUrl && imageUrl.trim() !== '') {
    let url = imageUrl.trim();
    // Convert Google Drive view links to direct image links
    if (url.includes('drive.google.com/file/d/')) {
      const match = url.match(/\/d\/([a-zA-Z0-9_-]+)/);
      if (match && match[1]) {
        url = `https://drive.google.com/uc?export=view&id=${match[1]}`;
      }
    } else if (url.includes('drive.google.com/open?id=')) {
      const match = url.match(/id=([a-zA-Z0-9_-]+)/);
      if (match && match[1]) {
        url = `https://drive.google.com/uc?export=view&id=${match[1]}`;
      }
    }
    return url;
  }
  return defaultProductImage;
};

export const getDefaultProductImage = (): string => {
  return defaultProductImage;
};

export const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
  const target = e.target as HTMLImageElement;
  target.onerror = null; // Prevent infinite loops
  target.src = defaultProductImage;
};
