'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { Upload, FileSpreadsheet, CheckCircle, XCircle, ArrowLeft } from 'lucide-react';

type ImportType = 'products' | 'offers' | 'site-config' | 'slider-config' | 'header-config' | 'product-sliders' | 'background-config';

export default function DataImportPage() {
  const router = useRouter();
  const { user, isAdmin, loading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<ImportType>('products');
  const [loading, setLoading] = useState(false);

  // Redirect if not admin
  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.push('/login?redirect=/admin/data-import');
      } else if (!isAdmin) {
        router.push('/');
      }
    }
  }, [user, isAdmin, authLoading, router]);
  const [messages, setMessages] = useState<Record<ImportType, { type: 'success' | 'error'; text: string } | null>>({
    products: null,
    offers: null,
    'site-config': null,
    'slider-config': null,
    'header-config': null,
    'product-sliders': null,
    'background-config': null,
  });

  const handleFileUpload = async (type: ImportType, file: File) => {
    setLoading(true);
    setMessages((prev) => ({ ...prev, [type]: null }));

    try {
      const formData = new FormData();
      formData.append('file', file);

      let endpoint = '';
      switch (type) {
        case 'products':
          endpoint = '/api/admin/import';
          break;
        case 'offers':
          endpoint = '/api/admin/offers/import';
          break;
        case 'site-config':
          endpoint = '/api/admin/site-config/import';
          break;
        case 'slider-config':
          endpoint = '/api/admin/slider-config/import';
          break;
        case 'header-config':
          endpoint = '/api/admin/header-config/import';
          break;
        case 'product-sliders':
          endpoint = '/api/admin/product-sliders/import';
          break;
        case 'background-config':
          endpoint = '/api/admin/background-config/import';
          break;
      }

      const response = await fetch(endpoint, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Failed to import ${type}`);
      }

      const data = await response.json();
      const count = data.count || (Array.isArray(data) ? data.length : 1);
      
      const typeLabel = type === 'site-config' ? 'site configuration' : type === 'slider-config' ? 'slider configuration' : type === 'header-config' ? 'header configuration' : type === 'product-sliders' ? 'product slider configurations' : type === 'background-config' ? 'background configuration' : type;
      
      setMessages((prev) => ({
        ...prev,
        [type]: {
          type: 'success',
          text: `Successfully imported ${count} ${typeLabel}!`,
        },
      }));
    } catch (error) {
      console.error('Import error:', error);
      setMessages((prev) => ({
        ...prev,
        [type]: {
          type: 'error',
          text: (error as Error).message || `Failed to import ${type}. Please check the file format.`,
        },
      }));
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (type: ImportType, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    handleFileUpload(type, file);
  };

  const tabs = [
    { id: 'products' as ImportType, label: 'Products', description: 'Import product data from CSV/Excel' },
    { id: 'offers' as ImportType, label: 'Offers', description: 'Import carousel offers from CSV/Excel' },
    { id: 'site-config' as ImportType, label: 'Site Config', description: 'Import site configuration from CSV/Excel' },
    { id: 'slider-config' as ImportType, label: 'Slider Config', description: 'Import background slider configuration from CSV/Excel' },
    { id: 'header-config' as ImportType, label: 'Header Config', description: 'Import header/navbar configuration from CSV/Excel' },
    { id: 'product-sliders' as ImportType, label: 'Product Sliders', description: 'Import product slider configurations from CSV/Excel' },
    { id: 'background-config' as ImportType, label: 'Background Config', description: 'Import animated background configuration from CSV/Excel' },
  ];

  const getCSVFormat = (type: ImportType) => {
    switch (type) {
      case 'products':
        return 'name, description, price, image_url, category, stock, featured';
      case 'offers':
        return 'offerId, title, description, imageUrl, ctaText, ctaLink, discount, bgGradient, isActive, displayOrder';
      case 'site-config':
        return 'id, site_name, banner_image, description, theme_color, contact_email, contact_phone, contact_address, social_media_facebook, social_media_twitter, social_media_instagram, social_media_linkedin';
      case 'slider-config':
        return 'id, images, autoplay';
      case 'header-config':
        return 'id, style, background_color, text_color, hover_color, accent_color, logo_url, logo_text, sticky, transparent_on_top, navigation_items, show_search, show_cart, show_user_menu, height';
      case 'product-sliders':
        return 'title, type, category, limit_count, display_order, show_title, auto_scroll, scroll_speed, is_active';
      case 'background-config':
        return 'type, primary_color, secondary_color, tertiary_color, speed, direction, opacity, blur, is_active';
      default:
        return '';
    }
  };

  if (authLoading || !isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50 pt-32 pb-12 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-32 pb-8">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Data Import</h1>
            <p className="mt-2 text-sm text-gray-600">
              Upload CSV or Excel files to populate your database
            </p>
          </div>
          <Link
            href="/admin"
            className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Link>
        </div>

        {/* Tabs */}
        <div className="mb-6 border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`whitespace-nowrap border-b-2 px-1 py-4 text-sm font-medium ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className="rounded-lg border border-gray-200 bg-white p-8">
          {tabs.map((tab) => (
            <div
              key={tab.id}
              className={activeTab === tab.id ? 'block' : 'hidden'}
            >
              <div className="mb-6">
                <h2 className="text-xl font-semibold text-gray-900">{tab.label}</h2>
                <p className="mt-1 text-sm text-gray-600">{tab.description}</p>
              </div>

              {/* CSV Format Info */}
              <div className="mb-6 rounded-lg bg-gray-50 p-4">
                <div className="mb-2 flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-gray-700">CSV Format:</h3>
                  {tab.id === 'site-config' && (
                    <a
                      href="/site-config-example.csv"
                      download
                      className="text-xs text-blue-600 hover:text-blue-800 hover:underline"
                    >
                      Download Example CSV
                    </a>
                  )}
                  {tab.id === 'slider-config' && (
                    <a
                      href="/slider-config-example.csv"
                      download
                      className="text-xs text-blue-600 hover:text-blue-800 hover:underline"
                    >
                      Download Example CSV
                    </a>
                  )}
                  {tab.id === 'header-config' && (
                    <a
                      href="/header-config-example.csv"
                      download
                      className="text-xs text-blue-600 hover:text-blue-800 hover:underline"
                    >
                      Download Example CSV
                    </a>
                  )}
                  {tab.id === 'product-sliders' && (
                    <a
                      href="/product-sliders-example.csv"
                      download
                      className="text-xs text-blue-600 hover:text-blue-800 hover:underline"
                    >
                      Download Example CSV
                    </a>
                  )}
                  {tab.id === 'background-config' && (
                    <a
                      href="/background-config-example.csv"
                      download
                      className="text-xs text-blue-600 hover:text-blue-800 hover:underline"
                    >
                      Download Example CSV
                    </a>
                  )}
                </div>
                <code className="text-xs text-gray-600">{getCSVFormat(tab.id)}</code>
                <p className="mt-2 text-xs text-gray-500">
                  {tab.id === 'offers' && 'Note: Column names can be camelCase (offerId) or lowercase (offerid)'}
                  {tab.id === 'site-config' && 'Note: Social media fields should be flattened (social_media_facebook, etc.)'}
                  {tab.id === 'slider-config' && 'Note: images should be comma-separated URLs (max 10). autoplay should be true/false.'}
                  {tab.id === 'header-config' && 'Note: navigation_items should be JSON array or pipe-separated format (Label1|href1,Label2|href2). style options: default, centered, minimal, modern, classic. Colors should be hex codes.'}
                  {tab.id === 'product-sliders' && 'Note: type options: all, category, featured, newest. If type is "category", provide category name. show_title, auto_scroll, and is_active should be true/false. scroll_speed is in seconds (default: 5).'}
                  {tab.id === 'background-config' && 'Note: type options: gradient, mesh, particles, grid. speed is 1-20 (default 5). opacity 0-100. blur in px.'}
                </p>
              </div>

              {/* File Upload */}
              <div className="mb-4">
                <label className="block">
                  <div className="flex cursor-pointer items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 p-8 transition-colors hover:border-blue-400 hover:bg-blue-50">
                    <div className="text-center">
                      <FileSpreadsheet className="mx-auto mb-4 h-12 w-12 text-gray-400" />
                      <span className="text-sm font-medium text-gray-700">
                        Click to upload or drag and drop
                      </span>
                      <p className="mt-1 text-xs text-gray-500">
                        CSV or Excel files only
                      </p>
                    </div>
                  </div>
                  <input
                    type="file"
                    accept=".csv,.xlsx,.xls"
                    className="hidden"
                    onChange={(e) => handleFileChange(tab.id, e)}
                    disabled={loading}
                  />
                </label>
              </div>

              {/* Message */}
              {messages[tab.id] && (
                <div
                  className={`flex items-center gap-2 rounded-lg p-4 ${
                    messages[tab.id]?.type === 'success'
                      ? 'bg-green-50 text-green-800'
                      : 'bg-red-50 text-red-800'
                  }`}
                >
                  {messages[tab.id]?.type === 'success' ? (
                    <CheckCircle className="h-5 w-5" />
                  ) : (
                    <XCircle className="h-5 w-5" />
                  )}
                  <span className="text-sm font-medium">{messages[tab.id]?.text}</span>
                </div>
              )}

              {/* Loading State */}
              {loading && activeTab === tab.id && (
                <div className="mt-4 text-center text-sm text-gray-600">
                  Uploading and processing file...
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Quick Links */}
        <div className="mt-8 rounded-lg border border-gray-200 bg-white p-6">
          <h3 className="mb-4 text-lg font-semibold text-gray-900">Quick Links</h3>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <Link
              href="/admin/products"
              className="rounded-lg border border-gray-200 p-4 hover:bg-gray-50"
            >
              <h4 className="font-medium text-gray-900">Manage Products</h4>
              <p className="mt-1 text-sm text-gray-600">View and edit products</p>
            </Link>
            <Link
              href="/admin/orders"
              className="rounded-lg border border-gray-200 p-4 hover:bg-gray-50"
            >
              <h4 className="font-medium text-gray-900">View Orders</h4>
              <p className="mt-1 text-sm text-gray-600">Manage customer orders</p>
            </Link>
            <Link
              href="/admin"
              className="rounded-lg border border-gray-200 p-4 hover:bg-gray-50"
            >
              <h4 className="font-medium text-gray-900">Dashboard</h4>
              <p className="mt-1 text-sm text-gray-600">View statistics</p>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}




