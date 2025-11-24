'use client';

import { useState, useEffect } from 'react';
import { Product, ProductSliderConfig } from '@/types';
import ProductSlider from './ProductSlider';

export default function ProductSliders() {
  const [sliderConfigs, setSliderConfigs] = useState<ProductSliderConfig[]>([]);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch slider configs
    fetch('/api/product-sliders')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setSliderConfigs(data);
        }
      })
      .catch(() => {
        setSliderConfigs([]);
      });

    // Fetch all products
    fetch('/api/products')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setAllProducts(data);
        }
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, []);

  const getProductsForSlider = (config: ProductSliderConfig): Product[] => {
    let filtered: Product[] = [];

    switch (config.type) {
      case 'category':
        if (config.category) {
          filtered = allProducts.filter((p) => p.category === config.category);
        } else {
          filtered = allProducts;
        }
        break;
      case 'featured':
        filtered = allProducts.filter((p) => p.featured === true);
        break;
      case 'newest':
        filtered = [...allProducts].sort((a, b) => {
          const dateA = new Date(a.created_at || 0).getTime();
          const dateB = new Date(b.created_at || 0).getTime();
          return dateB - dateA;
        });
        break;
      case 'all':
      default:
        filtered = allProducts;
        break;
    }

    return filtered.slice(0, config.limit_count || 10);
  };

  if (loading) {
    return null;
  }

  if (sliderConfigs.length === 0) {
    return null;
  }

  return (
    <>
      {sliderConfigs
        .filter((config) => config.is_active)
        .sort((a, b) => a.display_order - b.display_order)
        .map((config) => {
          const products = getProductsForSlider(config);
          if (products.length === 0) return null;
          
          return (
            <ProductSlider key={config.id} config={config} products={products} />
          );
        })}
    </>
  );
}


