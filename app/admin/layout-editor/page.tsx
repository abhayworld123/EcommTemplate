'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { SiteConfig } from '@/types';
import { Reorder, useDragControls } from 'framer-motion';
import { Save, GripVertical, ArrowLeft, CheckCircle, AlertCircle } from 'lucide-react';
import Link from 'next/link';

const COMPONENT_LABELS: Record<string, string> = {
  hero_banner: 'Hero Banner',
  offers_carousel: 'Offers Carousel',
  background_image_slider: 'Background Image Slider',
  product_sliders: 'Product Sliders',
  featured_products: 'Featured Products',
};

export default function LayoutEditorPage() {
  const router = useRouter();
  const { user, isAdmin, loading: authLoading } = useAuth();
  const [layout, setLayout] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [siteConfig, setSiteConfig] = useState<SiteConfig | null>(null);

  // Redirect if not admin
  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.push('/login?redirect=/admin/layout-editor');
      } else if (!isAdmin) {
        router.push('/');
      }
    }
  }, [user, isAdmin, authLoading, router]);

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    try {
      const res = await fetch('/api/site-config');
      const data = await res.json();
      setSiteConfig(data);
      if (data.home_layout && Array.isArray(data.home_layout)) {
        setLayout(data.home_layout);
      } else {
        // Default layout if not present
        setLayout([
          'hero_banner',
          'offers_carousel',
          'background_image_slider',
          'product_sliders',
          'featured_products',
        ]);
      }
    } catch (error) {
      console.error('Failed to fetch site config:', error);
      setMessage({ type: 'error', text: 'Failed to load configuration' });
    } finally {
      setLoading(false);
    }
  };

  const saveLayout = async () => {
    if (!siteConfig) return;
    
    setSaving(true);
    setMessage(null);
    
    try {
      const res = await fetch('/api/site-config', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...siteConfig,
          home_layout: layout,
        }),
      });
      
      if (!res.ok) throw new Error('Failed to save layout');
      
      const updatedConfig = await res.json();
      setSiteConfig(updatedConfig);
      setMessage({ type: 'success', text: 'Layout saved successfully' });
    } catch (error) {
      console.error('Failed to save layout:', error);
      setMessage({ type: 'error', text: 'Failed to save layout' });
    } finally {
      setSaving(false);
    }
  };

  if (authLoading || loading || !isAdmin) {
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
    <div className="min-h-screen bg-gray-50 pt-32 pb-12">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/admin"
              className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="w-5 h-5" />
              Back to Dashboard
            </Link>
            <h1 className="text-3xl font-bold text-gray-900">Homepage Layout</h1>
          </div>
          <button
            onClick={saveLayout}
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {saving ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            ) : (
              <Save className="w-5 h-5" />
            )}
            Save Layout
          </button>
        </div>

        {message && (
          <div
            className={`mb-6 p-4 rounded-lg flex items-center gap-3 ${
              message.type === 'success'
                ? 'bg-green-50 text-green-700 border border-green-200'
                : 'bg-red-50 text-red-700 border border-red-200'
            }`}
          >
            {message.type === 'success' ? (
              <CheckCircle className="w-5 h-5 flex-shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
            )}
            <p>{message.text}</p>
          </div>
        )}

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <p className="text-gray-600 mb-6">
            Drag and drop items to reorder the sections on the homepage.
          </p>

          <Reorder.Group axis="y" values={layout} onReorder={setLayout} className="space-y-4">
            {layout.map((item) => (
              <Reorder.Item key={item} value={item} className="cursor-grab active:cursor-grabbing">
                <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200 hover:border-blue-300 hover:shadow-sm transition-all">
                  <GripVertical className="w-5 h-5 text-gray-400" />
                  <span className="font-medium text-gray-900">
                    {COMPONENT_LABELS[item] || item}
                  </span>
                </div>
              </Reorder.Item>
            ))}
          </Reorder.Group>
        </div>
      </div>
    </div>
  );
}

