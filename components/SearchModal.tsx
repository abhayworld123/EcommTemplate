'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { X, Search, Loader2 } from 'lucide-react';
import { Product } from '@/types';
import { formatPrice } from '@/lib/utils';
import { useDebounce } from '@/lib/hooks/useDebounce';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  textColor: string;
  hoverColor: string;
  accentColor: string;
  backgroundColor: string;
}

export default function SearchModal({
  isOpen,
  onClose,
  textColor,
  hoverColor,
  accentColor,
  backgroundColor,
}: SearchModalProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  const debouncedQuery = useDebounce(searchQuery, 300);

  // Fetch all products on mount
  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      fetch('/api/products')
        .then((res) => res.json())
        .then((data) => {
          setProducts(data || []);
          setLoading(false);
        })
        .catch(() => {
          setLoading(false);
        });
    }
  }, [isOpen]);

  // Focus input when modal opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
      setSearchQuery('');
      setSelectedIndex(-1);
    }
  }, [isOpen]);

  // Filter products based on search query
  const filteredProducts = useMemo(() => {
    if (!debouncedQuery.trim()) {
      return [];
    }

    const query = debouncedQuery.toLowerCase().trim();
    return products
      .filter((product) => {
        const nameMatch = product.name.toLowerCase().includes(query);
        const descMatch = product.description?.toLowerCase().includes(query);
        const categoryMatch = product.category?.toLowerCase().includes(query);
        return nameMatch || descMatch || categoryMatch;
      })
      .slice(0, 10); // Limit to 10 results
  }, [products, debouncedQuery]);

  // Handle keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev < filteredProducts.length - 1 ? prev + 1 : prev
        );
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1));
      } else if (e.key === 'Enter' && selectedIndex >= 0) {
        e.preventDefault();
        const product = filteredProducts[selectedIndex];
        if (product) {
          router.push(`/products/${product.id}`);
          onClose();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, filteredProducts, selectedIndex, router, onClose]);

  // Scroll selected item into view
  useEffect(() => {
    if (selectedIndex >= 0 && resultsRef.current) {
      const selectedElement = resultsRef.current.children[selectedIndex] as HTMLElement;
      if (selectedElement) {
        selectedElement.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
      }
    }
  }, [selectedIndex]);

  // Close on outside click
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.closest('[data-search-modal]')) return;
      onClose();
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleProductClick = (productId: string) => {
    router.push(`/products/${productId}`);
    onClose();
  };

  const highlightText = (text: string, query: string) => {
    if (!query.trim()) return text;
    const parts = text.split(new RegExp(`(${query})`, 'gi'));
    return (
      <>
        {parts.map((part, index) =>
          part.toLowerCase() === query.toLowerCase() ? (
            <mark
              key={index}
              style={{ backgroundColor: `${accentColor}30`, color: textColor }}
            >
              {part}
            </mark>
          ) : (
            part
          )
        )}
      </>
    );
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-start justify-center pt-20 px-4"
      data-search-modal
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div
        className="relative w-full max-w-2xl rounded-2xl shadow-2xl animate-fade-in"
        style={{ backgroundColor }}
      >
        {/* Search Input */}
        <div className="flex items-center gap-3 p-4 border-b" style={{ borderColor: `${textColor}20` }}>
          <Search className="w-5 h-5 flex-shrink-0" style={{ color: textColor }} />
          <input
            ref={inputRef}
            type="text"
            data-search-input
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setSelectedIndex(-1);
            }}
            className="flex-1 bg-transparent outline-none text-lg"
            style={{ 
              color: textColor,
            }}
            onFocus={(e) => {
              e.target.style.outline = 'none';
            }}
          />
          <style dangerouslySetInnerHTML={{
            __html: `
              input[data-search-input]::placeholder {
                color: ${textColor} !important;
                opacity: 0.5 !important;
              }
            `
          }} />
          {loading && (
            <Loader2 className="w-5 h-5 animate-spin" style={{ color: textColor }} />
          )}
          <button
            onClick={onClose}
            className="p-1 rounded-lg transition-colors"
            style={{ color: textColor }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = `${hoverColor}20`;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Results */}
        <div
          ref={resultsRef}
          className="max-h-[60vh] overflow-y-auto"
          style={{ backgroundColor }}
        >
          {debouncedQuery.trim() && filteredProducts.length === 0 && !loading && (
            <div className="p-8 text-center">
              <p style={{ color: textColor }}>No products found</p>
              <p className="text-sm mt-2" style={{ color: `${textColor}80` }}>
                Try a different search term
              </p>
            </div>
          )}

          {!debouncedQuery.trim() && (
            <div className="p-8 text-center">
              <Search className="w-12 h-12 mx-auto mb-4 opacity-50" style={{ color: textColor }} />
              <p style={{ color: textColor }}>Start typing to search products</p>
            </div>
          )}

          {filteredProducts.length > 0 && (
            <div className="p-2">
              {filteredProducts.map((product, index) => (
                <div
                  key={product.id}
                  onClick={() => handleProductClick(product.id)}
                  className={`flex items-center gap-4 p-3 rounded-lg cursor-pointer transition-all ${
                    selectedIndex === index ? 'shadow-md' : ''
                  }`}
                  style={{
                    backgroundColor: selectedIndex === index ? `${hoverColor}15` : 'transparent',
                    color: textColor,
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = `${hoverColor}15`;
                    setSelectedIndex(index);
                  }}
                  onMouseLeave={(e) => {
                    if (selectedIndex !== index) {
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }
                  }}
                >
                  <div 
                    className="relative w-16 h-16 flex-shrink-0 rounded-lg overflow-hidden"
                    style={{ backgroundColor: `${textColor}10` }}
                  >
                    <Image
                      src={product.image_url || '/placeholder-watch.jpg'}
                      alt={product.name}
                      width={64}
                      height={64}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold truncate" style={{ color: textColor }}>
                      {highlightText(product.name, debouncedQuery)}
                    </h4>
                    <p className="text-sm truncate" style={{ color: textColor, opacity: 0.75 }}>
                      {highlightText(product.description || '', debouncedQuery)}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="font-bold" style={{ color: accentColor }}>
                        {formatPrice(product.price)}
                      </span>
                      {product.category && (
                        <span
                          className="text-xs px-2 py-0.5 rounded"
                          style={{
                            backgroundColor: `${accentColor}20`,
                            color: accentColor,
                          }}
                        >
                          {product.category}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

