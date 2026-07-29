import React from 'react';
// @ts-ignore
import defaultProductImage from '@/assets/images/regenerated_image_1785281720906.jpg';

const CLOUD_NAME = (import.meta as any).env.VITE_CLOUDINARY_CLOUD_NAME || 'x6mkqvcj';

export const getProductImageUrl = (sku?: string, imageUrl?: string): string => {
  if (imageUrl && imageUrl.trim() !== '') {
    return imageUrl;
  }
  if (sku && sku.trim() !== '') {
    return `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/f_auto,q_auto/${sku}`;
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
