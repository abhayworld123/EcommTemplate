'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { BackgroundConfig, HeaderConfig, NavigationItem, SiteConfig, Offer, Product, SliderConfig } from '@/types';
import { Save, ArrowLeft, CheckCircle, XCircle, Loader2, Plus, Trash2, Edit2 } from 'lucide-react';

type TabType = 'background' | 'header' | 'site' | 'offers' | 'products' | 'slider';

export default function ConfigEditorPage() {
  const router = useRouter();
  const { user, isAdmin, loading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>('background');
  const [loading, setLoading] = useState(true);
  const [savingBackground, setSavingBackground] = useState(false);
  const [savingHeader, setSavingHeader] = useState(false);
  const [savingSite, setSavingSite] = useState(false);
  const [savingOffer, setSavingOffer] = useState(false);
  const [deletingOffer, setDeletingOffer] = useState<string | null>(null);
  const [editingOffer, setEditingOffer] = useState<Offer | null>(null);
  const [isAddingOffer, setIsAddingOffer] = useState(false);
  const [savingProduct, setSavingProduct] = useState(false);
  const [deletingProduct, setDeletingProduct] = useState<string | null>(null);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isAddingProduct, setIsAddingProduct] = useState(false);
  const [savingSlider, setSavingSlider] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [sliderConfig, setSliderConfig] = useState<SliderConfig>({
    id: '1',
    images: [],
    autoplay: false,
  });
  
  const [bgConfig, setBgConfig] = useState<BackgroundConfig>({
    id: '1',
    type: 'gradient',
    primary_color: '#ffffff',
    secondary_color: '#f3f4f6',
    tertiary_color: '#e5e7eb',
    speed: 5,
    direction: 'diagonal',
    opacity: 100,
    blur: 0,
    is_active: true,
  });

  const [headerConfig, setHeaderConfig] = useState<HeaderConfig>({
    id: '1',
    style: 'default',
    background_color: '#ffffff',
    text_color: '#1f2937',
    hover_color: '#2563eb',
    accent_color: '#2563eb',
    logo_url: '',
    logo_text: '',
    sticky: true,
    transparent_on_top: false,
    navigation_items: [],
    show_search: false,
    show_cart: true,
    show_user_menu: true,
    height: '80px',
  });

  const [siteConfig, setSiteConfig] = useState<SiteConfig>({
    id: '1',
    site_name: '',
    banner_image: '',
    description: '',
    theme_color: '#2563eb',
    contact_email: '',
    contact_phone: '',
    contact_address: '',
    social_media: {},
  });

  const [newProduct, setNewProduct] = useState<Partial<Product>>({
    name: '',
    description: '',
    price: 0,
    image_url: '',
    category: '',
    stock: 0,
    featured: false,
  });

  const [newOffer, setNewOffer] = useState<Partial<Offer>>({
    offer_id: '',
    title: '',
    description: '',
    image_url: '',
    cta_text: 'Shop Now',
    cta_link: '/products',
    discount: 0,
    bg_gradient: '',
    is_active: true,
    display_order: 0,
  });

  // Redirect if not admin
  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.push('/login?redirect=/admin/background-config');
      } else if (!isAdmin) {
        router.push('/');
      }
    }
  }, [user, isAdmin, authLoading, router]);

  useEffect(() => {
    fetchConfigs();
  }, []);

  const fetchConfigs = async () => {
    try {
      // Fetch all configs in parallel
      const [bgRes, headerRes, siteRes, offersRes, productsRes, sliderRes] = await Promise.all([
        fetch('/api/background-config'),
        fetch('/api/header-config'),
        fetch('/api/site-config'),
        fetch('/api/offers?active=false'),
        fetch('/api/products'),
        fetch('/api/slider-config'),
      ]);

      if (bgRes.ok) {
        const bgData = await bgRes.json();
        setBgConfig(bgData);
      }

      if (headerRes.ok) {
        const headerData = await headerRes.json();
        setHeaderConfig(headerData);
      }

      if (siteRes.ok) {
        const siteData = await siteRes.json();
        setSiteConfig(siteData);
      }

      if (offersRes.ok) {
        const offersData = await offersRes.json();
        setOffers(offersData || []);
      }

      if (productsRes.ok) {
        const productsData = await productsRes.json();
        setProducts(productsData || []);
      }

      if (sliderRes.ok) {
        const sliderData = await sliderRes.json();
        setSliderConfig(sliderData);
      }
    } catch (error) {
      console.error('Failed to fetch configs:', error);
      setMessage({ type: 'error', text: 'Failed to load configurations' });
    } finally {
      setLoading(false);
    }
  };

  const handleBgSave = async () => {
    setSavingBackground(true);
    setMessage(null);

    try {
      const res = await fetch('/api/background-config', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bgConfig),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to save configuration');
      }

      const data = await res.json();
      setBgConfig(data);
      setMessage({ type: 'success', text: 'Background configuration saved successfully!' });
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      console.error('Failed to save background config:', error);
      setMessage({
        type: 'error',
        text: error instanceof Error ? error.message : 'Failed to save configuration',
      });
    } finally {
      setSavingBackground(false);
    }
  };

  const handleHeaderSave = async () => {
    setSavingHeader(true);
    setMessage(null);

    try {
      const res = await fetch('/api/header-config', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(headerConfig),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to save configuration');
      }

      const data = await res.json();
      setHeaderConfig(data);
      setMessage({ type: 'success', text: 'Header configuration saved successfully!' });
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      console.error('Failed to save header config:', error);
      setMessage({
        type: 'error',
        text: error instanceof Error ? error.message : 'Failed to save configuration',
      });
    } finally {
      setSavingHeader(false);
    }
  };

  const handleBgChange = (field: keyof BackgroundConfig, value: any) => {
    setBgConfig((prev) => ({ ...prev, [field]: value }));
  };

  const handleHeaderChange = (field: keyof HeaderConfig, value: any) => {
    setHeaderConfig((prev) => ({ ...prev, [field]: value }));
  };

  const addNavigationItem = () => {
    setHeaderConfig((prev) => ({
      ...prev,
      navigation_items: [...prev.navigation_items, { label: '', href: '' }],
    }));
  };

  const updateNavigationItem = (index: number, field: 'label' | 'href', value: string) => {
    setHeaderConfig((prev) => {
      const items = [...prev.navigation_items];
      items[index] = { ...items[index], [field]: value };
      return { ...prev, navigation_items: items };
    });
  };

  const removeNavigationItem = (index: number) => {
    setHeaderConfig((prev) => ({
      ...prev,
      navigation_items: prev.navigation_items.filter((_, i) => i !== index),
    }));
  };

  const handleSiteSave = async () => {
    setSavingSite(true);
    setMessage(null);

    try {
      // Transform social_media object to flat format for API
      const payload = {
        id: siteConfig.id,
        site_name: siteConfig.site_name,
        banner_image: siteConfig.banner_image,
        description: siteConfig.description,
        theme_color: siteConfig.theme_color,
        contact_email: siteConfig.contact_email,
        contact_phone: siteConfig.contact_phone,
        contact_address: siteConfig.contact_address,
        social_media_facebook: siteConfig.social_media?.facebook || '',
        social_media_twitter: siteConfig.social_media?.twitter || '',
        social_media_instagram: siteConfig.social_media?.instagram || '',
        social_media_linkedin: siteConfig.social_media?.linkedin || '',
      };

      const res = await fetch('/api/site-config', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to save configuration');
      }

      const data = await res.json();
      setSiteConfig(data);
      setMessage({ type: 'success', text: 'Site configuration saved successfully!' });
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      console.error('Failed to save site config:', error);
      setMessage({
        type: 'error',
        text: error instanceof Error ? error.message : 'Failed to save configuration',
      });
    } finally {
      setSavingSite(false);
    }
  };

  const handleSiteChange = (field: keyof SiteConfig, value: any) => {
    setSiteConfig((prev) => ({ ...prev, [field]: value }));
  };

  const handleSocialMediaChange = (platform: 'facebook' | 'twitter' | 'instagram' | 'linkedin', value: string) => {
    setSiteConfig((prev) => ({
      ...prev,
      social_media: {
        ...prev.social_media,
        [platform]: value,
      },
    }));
  };

  const handleOfferChange = (field: keyof Offer, value: any) => {
    if (editingOffer) {
      setEditingOffer({ ...editingOffer, [field]: value });
    } else {
      setNewOffer({ ...newOffer, [field]: value });
    }
  };

  const handleAddOffer = async () => {
    setSavingOffer(true);
    setMessage(null);

    try {
      const res = await fetch('/api/offers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newOffer),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to create offer');
      }

      const data = await res.json();
      // Refresh offers list from server to ensure consistency
      const offersRes = await fetch('/api/offers?active=false');
      if (offersRes.ok) {
        const offersData = await offersRes.json();
        setOffers(offersData || []);
      } else {
        setOffers([...offers, data]);
      }
      setNewOffer({
        offer_id: '',
        title: '',
        description: '',
        image_url: '',
        cta_text: 'Shop Now',
        cta_link: '/products',
        discount: 0,
        bg_gradient: '',
        is_active: true,
        display_order: offers.length,
      });
      setIsAddingOffer(false);
      setMessage({ type: 'success', text: 'Offer created successfully!' });
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      console.error('Failed to create offer:', error);
      setMessage({
        type: 'error',
        text: error instanceof Error ? error.message : 'Failed to create offer',
      });
    } finally {
      setSavingOffer(false);
    }
  };

  const handleUpdateOffer = async () => {
    if (!editingOffer) return;

    setSavingOffer(true);
    setMessage(null);

    try {
      const res = await fetch('/api/offers', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingOffer),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to update offer');
      }

      const data = await res.json();
      // Refresh offers list from server to ensure consistency
      const offersRes = await fetch('/api/offers?active=false');
      if (offersRes.ok) {
        const offersData = await offersRes.json();
        setOffers(offersData || []);
      } else {
        setOffers(offers.map((o) => (o.id === editingOffer.id ? data : o)));
      }
      setEditingOffer(null);
      setMessage({ type: 'success', text: 'Offer updated successfully!' });
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      console.error('Failed to update offer:', error);
      setMessage({
        type: 'error',
        text: error instanceof Error ? error.message : 'Failed to update offer',
      });
    } finally {
      setSavingOffer(false);
    }
  };

  const handleDeleteOffer = async (id: string) => {
    if (!confirm('Are you sure you want to delete this offer?')) return;

    setDeletingOffer(id);
    setMessage(null);

    try {
      const res = await fetch(`/api/offers?id=${id}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to delete offer');
      }

      // Refresh offers list from server to ensure consistency
      const offersRes = await fetch('/api/offers?active=false');
      if (offersRes.ok) {
        const offersData = await offersRes.json();
        setOffers(offersData || []);
      } else {
        setOffers(offers.filter((o) => o.id !== id));
      }
      setMessage({ type: 'success', text: 'Offer deleted successfully!' });
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      console.error('Failed to delete offer:', error);
      setMessage({
        type: 'error',
        text: error instanceof Error ? error.message : 'Failed to delete offer',
      });
    } finally {
      setDeletingOffer(null);
    }
  };

  const handleProductChange = (field: keyof Product, value: any) => {
    if (editingProduct) {
      setEditingProduct({ ...editingProduct, [field]: value });
    } else {
      setNewProduct({ ...newProduct, [field]: value });
    }
  };

  const handleAddProduct = async () => {
    setSavingProduct(true);
    setMessage(null);

    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newProduct),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to create product');
      }

      const data = await res.json();
      // Refresh products list from server to ensure consistency
      const productsRes = await fetch('/api/products');
      if (productsRes.ok) {
        const productsData = await productsRes.json();
        setProducts(productsData || []);
      } else {
        setProducts([...products, data]);
      }
      setNewProduct({
        name: '',
        description: '',
        price: 0,
        image_url: '',
        category: '',
        stock: 0,
        featured: false,
      });
      setIsAddingProduct(false);
      setMessage({ type: 'success', text: 'Product created successfully!' });
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      console.error('Failed to create product:', error);
      setMessage({
        type: 'error',
        text: error instanceof Error ? error.message : 'Failed to create product',
      });
    } finally {
      setSavingProduct(false);
    }
  };

  const handleUpdateProduct = async () => {
    if (!editingProduct) return;

    setSavingProduct(true);
    setMessage(null);

    try {
      const res = await fetch(`/api/admin/products?id=${editingProduct.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingProduct),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to update product');
      }

      const data = await res.json();
      // Refresh products list from server to ensure consistency
      const productsRes = await fetch('/api/products');
      if (productsRes.ok) {
        const productsData = await productsRes.json();
        setProducts(productsData || []);
      } else {
        setProducts(products.map((p) => (p.id === editingProduct.id ? data : p)));
      }
      setEditingProduct(null);
      setMessage({ type: 'success', text: 'Product updated successfully!' });
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      console.error('Failed to update product:', error);
      setMessage({
        type: 'error',
        text: error instanceof Error ? error.message : 'Failed to update product',
      });
    } finally {
      setSavingProduct(false);
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;

    setDeletingProduct(id);
    setMessage(null);

    try {
      const res = await fetch(`/api/admin/products?id=${id}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to delete product');
      }

      // Refresh products list from server to ensure consistency
      const productsRes = await fetch('/api/products');
      if (productsRes.ok) {
        const productsData = await productsRes.json();
        setProducts(productsData || []);
      } else {
        setProducts(products.filter((p) => p.id !== id));
      }
      setMessage({ type: 'success', text: 'Product deleted successfully!' });
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      console.error('Failed to delete product:', error);
      setMessage({
        type: 'error',
        text: error instanceof Error ? error.message : 'Failed to delete product',
      });
    } finally {
      setDeletingProduct(null);
    }
  };

  const handleSliderSave = async () => {
    setSavingSlider(true);
    setMessage(null);

    try {
      const res = await fetch('/api/slider-config', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sliderConfig),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to save configuration');
      }

      const data = await res.json();
      setSliderConfig(data);
      setMessage({ type: 'success', text: 'Slider configuration saved successfully!' });
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      console.error('Failed to save slider config:', error);
      setMessage({
        type: 'error',
        text: error instanceof Error ? error.message : 'Failed to save configuration',
      });
    } finally {
      setSavingSlider(false);
    }
  };

  const addSliderImage = () => {
    if (sliderConfig.images.length >= 10) {
      setMessage({ type: 'error', text: 'Maximum 10 images allowed' });
      setTimeout(() => setMessage(null), 3000);
      return;
    }
    setSliderConfig((prev) => ({
      ...prev,
      images: [...prev.images, ''],
    }));
  };

  const updateSliderImage = (index: number, value: string) => {
    setSliderConfig((prev) => {
      const newImages = [...prev.images];
      newImages[index] = value;
      return { ...prev, images: newImages };
    });
  };

  const removeSliderImage = (index: number) => {
    setSliderConfig((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  if (authLoading || loading || !isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50 pt-32 pb-12 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-32 pb-8">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Site Configuration</h1>
            <p className="mt-2 text-sm text-gray-600">
              Edit background, header, and site settings for your site
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

        {/* Message */}
        {message && (
          <div
            className={`mb-6 flex items-center gap-2 rounded-lg p-4 ${
              message.type === 'success'
                ? 'bg-green-50 text-green-800'
                : 'bg-red-50 text-red-800'
            }`}
          >
            {message.type === 'success' ? (
              <CheckCircle className="h-5 w-5" />
            ) : (
              <XCircle className="h-5 w-5" />
            )}
            <span className="text-sm font-medium">{message.text}</span>
          </div>
        )}

        {/* Tabs */}
        <div className="mb-6 border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('background')}
              className={`whitespace-nowrap border-b-2 px-1 py-4 text-sm font-medium ${
                activeTab === 'background'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
              }`}
            >
              Background Config
            </button>
            <button
              onClick={() => setActiveTab('header')}
              className={`whitespace-nowrap border-b-2 px-1 py-4 text-sm font-medium ${
                activeTab === 'header'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
              }`}
            >
              Header Config
            </button>
            <button
              onClick={() => setActiveTab('site')}
              className={`whitespace-nowrap border-b-2 px-1 py-4 text-sm font-medium ${
                activeTab === 'site'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
              }`}
            >
              Site Config
            </button>
            <button
              onClick={() => setActiveTab('offers')}
              className={`whitespace-nowrap border-b-2 px-1 py-4 text-sm font-medium ${
                activeTab === 'offers'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
              }`}
            >
              Offers
            </button>
            <button
              onClick={() => setActiveTab('products')}
              className={`whitespace-nowrap border-b-2 px-1 py-4 text-sm font-medium ${
                activeTab === 'products'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
              }`}
            >
              Products
            </button>
            <button
              onClick={() => setActiveTab('slider')}
              className={`whitespace-nowrap border-b-2 px-1 py-4 text-sm font-medium ${
                activeTab === 'slider'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
              }`}
            >
              Slider Config
            </button>
          </nav>
        </div>

        {/* Background Config Tab */}
        {activeTab === 'background' && (
          <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
            <div className="border-b border-gray-200 px-6 py-4">
              <h2 className="text-xl font-semibold text-gray-900">Background Settings</h2>
            </div>

            <div className="p-6">
              <div className="space-y-6">
                {/* Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Background Type
                  </label>
                  <select
                    value={bgConfig.type}
                    onChange={(e) => handleBgChange('type', e.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  >
                    <option value="gradient">Gradient</option>
                    <option value="mesh">Mesh</option>
                    <option value="particles">Particles</option>
                    <option value="grid">Grid</option>
                  </select>
                </div>

                {/* Colors */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Primary Color
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="color"
                        value={bgConfig.primary_color}
                        onChange={(e) => handleBgChange('primary_color', e.target.value)}
                        className="h-10 w-16 rounded border border-gray-300 cursor-pointer"
                      />
                      <input
                        type="text"
                        value={bgConfig.primary_color}
                        onChange={(e) => handleBgChange('primary_color', e.target.value)}
                        className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        placeholder="#ffffff"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Secondary Color
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="color"
                        value={bgConfig.secondary_color}
                        onChange={(e) => handleBgChange('secondary_color', e.target.value)}
                        className="h-10 w-16 rounded border border-gray-300 cursor-pointer"
                      />
                      <input
                        type="text"
                        value={bgConfig.secondary_color}
                        onChange={(e) => handleBgChange('secondary_color', e.target.value)}
                        className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        placeholder="#f3f4f6"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tertiary Color
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="color"
                        value={bgConfig.tertiary_color}
                        onChange={(e) => handleBgChange('tertiary_color', e.target.value)}
                        className="h-10 w-16 rounded border border-gray-300 cursor-pointer"
                      />
                      <input
                        type="text"
                        value={bgConfig.tertiary_color}
                        onChange={(e) => handleBgChange('tertiary_color', e.target.value)}
                        className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        placeholder="#e5e7eb"
                      />
                    </div>
                  </div>
                </div>

                {/* Speed and Direction */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Speed (1-20)
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="20"
                      value={bgConfig.speed}
                      onChange={(e) => handleBgChange('speed', parseInt(e.target.value) || 5)}
                      className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Direction
                    </label>
                    <input
                      type="text"
                      value={bgConfig.direction}
                      onChange={(e) => handleBgChange('direction', e.target.value)}
                      className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      placeholder="diagonal, center, up, etc."
                    />
                  </div>
                </div>

                {/* Opacity and Blur */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Opacity (0-100)
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={bgConfig.opacity}
                      onChange={(e) => handleBgChange('opacity', parseInt(e.target.value) || 100)}
                      className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Blur (0-100px)
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={bgConfig.blur}
                      onChange={(e) => handleBgChange('blur', parseInt(e.target.value) || 0)}
                      className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Is Active */}
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="is_active"
                    checked={bgConfig.is_active}
                    onChange={(e) => handleBgChange('is_active', e.target.checked)}
                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <label htmlFor="is_active" className="text-sm font-medium text-gray-700">
                    Enable Background Animation
                  </label>
                </div>
              </div>

              {/* Save Button */}
              <div className="mt-8 flex justify-end">
                <button
                  onClick={handleBgSave}
                  disabled={savingBackground}
                  className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {savingBackground ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      Save Background Config
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Header Config Tab */}
        {activeTab === 'header' && (
          <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
            <div className="border-b border-gray-200 px-6 py-4">
              <h2 className="text-xl font-semibold text-gray-900">Header Settings</h2>
            </div>

            <div className="p-6">
              <div className="space-y-6">
                {/* Style */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Header Style
                  </label>
                  <select
                    value={headerConfig.style}
                    onChange={(e) => handleHeaderChange('style', e.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  >
                    <option value="default">Default</option>
                    <option value="centered">Centered</option>
                    <option value="minimal">Minimal</option>
                    <option value="modern">Modern</option>
                    <option value="classic">Classic</option>
                  </select>
                </div>

                {/* Colors */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Background Color
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="color"
                        value={headerConfig.background_color}
                        onChange={(e) => handleHeaderChange('background_color', e.target.value)}
                        className="h-10 w-16 rounded border border-gray-300 cursor-pointer"
                      />
                      <input
                        type="text"
                        value={headerConfig.background_color}
                        onChange={(e) => handleHeaderChange('background_color', e.target.value)}
                        className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Text Color
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="color"
                        value={headerConfig.text_color}
                        onChange={(e) => handleHeaderChange('text_color', e.target.value)}
                        className="h-10 w-16 rounded border border-gray-300 cursor-pointer"
                      />
                      <input
                        type="text"
                        value={headerConfig.text_color}
                        onChange={(e) => handleHeaderChange('text_color', e.target.value)}
                        className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Hover Color
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="color"
                        value={headerConfig.hover_color}
                        onChange={(e) => handleHeaderChange('hover_color', e.target.value)}
                        className="h-10 w-16 rounded border border-gray-300 cursor-pointer"
                      />
                      <input
                        type="text"
                        value={headerConfig.hover_color}
                        onChange={(e) => handleHeaderChange('hover_color', e.target.value)}
                        className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Accent Color
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="color"
                        value={headerConfig.accent_color}
                        onChange={(e) => handleHeaderChange('accent_color', e.target.value)}
                        className="h-10 w-16 rounded border border-gray-300 cursor-pointer"
                      />
                      <input
                        type="text"
                        value={headerConfig.accent_color}
                        onChange={(e) => handleHeaderChange('accent_color', e.target.value)}
                        className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Logo */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Logo URL
                    </label>
                    <input
                      type="text"
                      value={headerConfig.logo_url || ''}
                      onChange={(e) => handleHeaderChange('logo_url', e.target.value)}
                      className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      placeholder="https://example.com/logo.png"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Logo Text
                    </label>
                    <input
                      type="text"
                      value={headerConfig.logo_text || ''}
                      onChange={(e) => handleHeaderChange('logo_text', e.target.value)}
                      className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      placeholder="Your Brand Name"
                    />
                  </div>
                </div>

                {/* Height */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Header Height
                  </label>
                  <input
                    type="text"
                    value={headerConfig.height}
                    onChange={(e) => handleHeaderChange('height', e.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    placeholder="80px"
                  />
                </div>

                {/* Checkboxes */}
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      id="sticky"
                      checked={headerConfig.sticky}
                      onChange={(e) => handleHeaderChange('sticky', e.target.checked)}
                      className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <label htmlFor="sticky" className="text-sm font-medium text-gray-700">
                      Sticky Header
                    </label>
                  </div>
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      id="transparent_on_top"
                      checked={headerConfig.transparent_on_top}
                      onChange={(e) => handleHeaderChange('transparent_on_top', e.target.checked)}
                      className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <label htmlFor="transparent_on_top" className="text-sm font-medium text-gray-700">
                      Transparent on Top
                    </label>
                  </div>
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      id="show_search"
                      checked={headerConfig.show_search}
                      onChange={(e) => handleHeaderChange('show_search', e.target.checked)}
                      className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <label htmlFor="show_search" className="text-sm font-medium text-gray-700">
                      Show Search Icon
                    </label>
                  </div>
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      id="show_cart"
                      checked={headerConfig.show_cart}
                      onChange={(e) => handleHeaderChange('show_cart', e.target.checked)}
                      className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <label htmlFor="show_cart" className="text-sm font-medium text-gray-700">
                      Show Cart Icon
                    </label>
                  </div>
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      id="show_user_menu"
                      checked={headerConfig.show_user_menu}
                      onChange={(e) => handleHeaderChange('show_user_menu', e.target.checked)}
                      className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <label htmlFor="show_user_menu" className="text-sm font-medium text-gray-700">
                      Show User Menu
                    </label>
                  </div>
                </div>

                {/* Navigation Items */}
                <div>
                  <div className="mb-3 flex items-center justify-between">
                    <label className="block text-sm font-medium text-gray-700">
                      Navigation Items
                    </label>
                    <button
                      onClick={addNavigationItem}
                      className="inline-flex items-center gap-1 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-700"
                    >
                      <Plus className="w-3 h-3" />
                      Add Item
                    </button>
                  </div>
                  <div className="overflow-x-auto rounded-lg border border-gray-200">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Label</th>
                          <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">URL</th>
                          <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500 w-20">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200 bg-white">
                        {headerConfig.navigation_items.length === 0 ? (
                          <tr>
                            <td colSpan={3} className="px-4 py-4 text-center text-sm text-gray-500">
                              No navigation items. Click "Add Item" to add one.
                            </td>
                          </tr>
                        ) : (
                          headerConfig.navigation_items.map((item, index) => (
                            <tr key={index} className="hover:bg-gray-50">
                              <td className="px-4 py-2">
                                <input
                                  type="text"
                                  value={item.label}
                                  onChange={(e) => updateNavigationItem(index, 'label', e.target.value)}
                                  placeholder="Label"
                                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                />
                              </td>
                              <td className="px-4 py-2">
                                <input
                                  type="text"
                                  value={item.href}
                                  onChange={(e) => updateNavigationItem(index, 'href', e.target.value)}
                                  placeholder="/path"
                                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                />
                              </td>
                              <td className="px-4 py-2">
                                <button
                                  onClick={() => removeNavigationItem(index)}
                                  className="rounded-lg border border-red-300 bg-red-50 p-2 text-red-600 hover:bg-red-100"
                                  title="Remove"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              {/* Save Button */}
              <div className="mt-8 flex justify-end">
                <button
                  onClick={handleHeaderSave}
                  disabled={savingHeader}
                  className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {savingHeader ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      Save Header Config
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Site Config Tab */}
        {activeTab === 'site' && (
          <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
            <div className="border-b border-gray-200 px-6 py-4">
              <h2 className="text-xl font-semibold text-gray-900">Site Settings</h2>
            </div>

            <div className="p-6">
              <div className="space-y-6">
                {/* Site Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Site Name
                  </label>
                  <input
                    type="text"
                    value={siteConfig.site_name}
                    onChange={(e) => handleSiteChange('site_name', e.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    placeholder="Ecommerce Store"
                  />
                </div>

                {/* Banner Image */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Banner Image URL
                  </label>
                  <input
                    type="text"
                    value={siteConfig.banner_image}
                    onChange={(e) => handleSiteChange('banner_image', e.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    placeholder="https://example.com/banner.jpg"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    value={siteConfig.description || ''}
                    onChange={(e) => handleSiteChange('description', e.target.value)}
                    rows={3}
                    className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    placeholder="Premium products for your needs"
                  />
                </div>

                {/* Theme Color */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Theme Color
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      value={siteConfig.theme_color || '#2563eb'}
                      onChange={(e) => handleSiteChange('theme_color', e.target.value)}
                      className="h-10 w-16 rounded border border-gray-300 cursor-pointer"
                    />
                    <input
                      type="text"
                      value={siteConfig.theme_color || ''}
                      onChange={(e) => handleSiteChange('theme_color', e.target.value)}
                      className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      placeholder="#2563eb"
                    />
                  </div>
                </div>

                {/* Contact Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Contact Email
                    </label>
                    <input
                      type="email"
                      value={siteConfig.contact_email || ''}
                      onChange={(e) => handleSiteChange('contact_email', e.target.value)}
                      className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      placeholder="info@example.com"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Contact Phone
                    </label>
                    <input
                      type="tel"
                      value={siteConfig.contact_phone || ''}
                      onChange={(e) => handleSiteChange('contact_phone', e.target.value)}
                      className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      placeholder="+1 (234) 567-890"
                    />
                  </div>
                </div>

                {/* Contact Address */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Contact Address
                  </label>
                  <textarea
                    value={siteConfig.contact_address || ''}
                    onChange={(e) => handleSiteChange('contact_address', e.target.value)}
                    rows={2}
                    className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    placeholder="123 Commerce Street, Business District, City, State 12345"
                  />
                </div>

                {/* Social Media */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Social Media Links
                  </label>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">Facebook</label>
                      <input
                        type="url"
                        value={siteConfig.social_media?.facebook || ''}
                        onChange={(e) => handleSocialMediaChange('facebook', e.target.value)}
                        className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        placeholder="https://facebook.com/yourpage"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">Twitter</label>
                      <input
                        type="url"
                        value={siteConfig.social_media?.twitter || ''}
                        onChange={(e) => handleSocialMediaChange('twitter', e.target.value)}
                        className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        placeholder="https://twitter.com/yourhandle"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">Instagram</label>
                      <input
                        type="url"
                        value={siteConfig.social_media?.instagram || ''}
                        onChange={(e) => handleSocialMediaChange('instagram', e.target.value)}
                        className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        placeholder="https://instagram.com/yourhandle"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">LinkedIn</label>
                      <input
                        type="url"
                        value={siteConfig.social_media?.linkedin || ''}
                        onChange={(e) => handleSocialMediaChange('linkedin', e.target.value)}
                        className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        placeholder="https://linkedin.com/company/yourcompany"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Save Button */}
              <div className="mt-8 flex justify-end">
                <button
                  onClick={handleSiteSave}
                  disabled={savingSite}
                  className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {savingSite ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      Save Site Config
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Offers Tab */}
        {activeTab === 'offers' && (
          <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
            <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">Offers Management</h2>
              <button
                onClick={() => {
                  setIsAddingOffer(true);
                  setEditingOffer(null);
                }}
                className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
              >
                <Plus className="w-4 h-4" />
                Add New Offer
              </button>
            </div>

            <div className="p-6">
              {/* Add/Edit Form */}
              {(isAddingOffer || editingOffer) && (
                <div className="mb-6 rounded-lg border border-gray-200 bg-gray-50 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    {editingOffer ? 'Edit Offer' : 'Add New Offer'}
                  </h3>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Offer ID
                        </label>
                        <input
                          type="text"
                          value={editingOffer?.offer_id || newOffer.offer_id || ''}
                          onChange={(e) => handleOfferChange('offer_id', e.target.value)}
                          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                          placeholder="OFF001"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Title
                        </label>
                        <input
                          type="text"
                          value={editingOffer?.title || newOffer.title || ''}
                          onChange={(e) => handleOfferChange('title', e.target.value)}
                          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                          placeholder="Special Offer"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Description
                      </label>
                      <textarea
                        value={editingOffer?.description || newOffer.description || ''}
                        onChange={(e) => handleOfferChange('description', e.target.value)}
                        rows={2}
                        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        placeholder="Offer description"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Image URL
                      </label>
                      <input
                        type="text"
                        value={editingOffer?.image_url || newOffer.image_url || ''}
                        onChange={(e) => handleOfferChange('image_url', e.target.value)}
                        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        placeholder="https://example.com/image.jpg"
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          CTA Text
                        </label>
                        <input
                          type="text"
                          value={editingOffer?.cta_text || newOffer.cta_text || ''}
                          onChange={(e) => handleOfferChange('cta_text', e.target.value)}
                          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                          placeholder="Shop Now"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          CTA Link
                        </label>
                        <input
                          type="text"
                          value={editingOffer?.cta_link || newOffer.cta_link || ''}
                          onChange={(e) => handleOfferChange('cta_link', e.target.value)}
                          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                          placeholder="/products"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Discount (%)
                        </label>
                        <input
                          type="number"
                          value={editingOffer?.discount || newOffer.discount || 0}
                          onChange={(e) => handleOfferChange('discount', parseInt(e.target.value) || 0)}
                          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Display Order
                        </label>
                        <input
                          type="number"
                          value={editingOffer?.display_order || newOffer.display_order || 0}
                          onChange={(e) => handleOfferChange('display_order', parseInt(e.target.value) || 0)}
                          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        />
                      </div>
                      <div className="flex items-end">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={editingOffer?.is_active ?? newOffer.is_active ?? true}
                            onChange={(e) => handleOfferChange('is_active', e.target.checked)}
                            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                          <span className="text-sm font-medium text-gray-700">Is Active</span>
                        </label>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Background Gradient
                      </label>
                      <input
                        type="text"
                        value={editingOffer?.bg_gradient || newOffer.bg_gradient || ''}
                        onChange={(e) => handleOfferChange('bg_gradient', e.target.value)}
                        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        placeholder="from-blue-500 to-purple-600"
                      />
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={editingOffer ? handleUpdateOffer : handleAddOffer}
                        disabled={savingOffer}
                        className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
                      >
                        {savingOffer ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Saving...
                          </>
                        ) : (
                          <>
                            <Save className="w-4 h-4" />
                            {editingOffer ? 'Update Offer' : 'Create Offer'}
                          </>
                        )}
                      </button>
                      <button
                        onClick={() => {
                          setIsAddingOffer(false);
                          setEditingOffer(null);
                        }}
                        className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Offers Table */}
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">ID</th>
                      <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Title</th>
                      <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Description</th>
                      <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Discount</th>
                      <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Order</th>
                      <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Active</th>
                      <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {offers.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="px-4 py-8 text-center text-sm text-gray-500">
                          No offers found. Click "Add New Offer" to create one.
                        </td>
                      </tr>
                    ) : (
                      offers.map((offer) => (
                        <tr key={offer.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3 text-sm text-gray-900">{offer.offer_id}</td>
                          <td className="px-4 py-3 text-sm font-medium text-gray-900">{offer.title}</td>
                          <td className="px-4 py-3 text-sm text-gray-600 max-w-xs truncate">
                            {offer.description || '-'}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-900">{offer.discount}%</td>
                          <td className="px-4 py-3 text-sm text-gray-900">{offer.display_order}</td>
                          <td className="px-4 py-3 text-sm">
                            <span
                              className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${
                                offer.is_active
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-gray-100 text-gray-800'
                              }`}
                            >
                              {offer.is_active ? 'Active' : 'Inactive'}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm">
                            <div className="flex gap-2">
                              <button
                                onClick={() => {
                                  setEditingOffer(offer);
                                  setIsAddingOffer(false);
                                }}
                                className="rounded-lg border border-gray-300 bg-white p-1.5 text-gray-600 hover:bg-gray-50"
                                title="Edit"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteOffer(offer.id)}
                                disabled={deletingOffer === offer.id}
                                className="rounded-lg border border-red-300 bg-red-50 p-1.5 text-red-600 hover:bg-red-100 disabled:opacity-50"
                                title="Delete"
                              >
                                {deletingOffer === offer.id ? (
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                  <Trash2 className="w-4 h-4" />
                                )}
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Products Tab */}
        {activeTab === 'products' && (
          <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
            <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">Products Management</h2>
              <button
                onClick={() => {
                  setIsAddingProduct(true);
                  setEditingProduct(null);
                }}
                className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
              >
                <Plus className="w-4 h-4" />
                Add New Product
              </button>
            </div>

            <div className="p-6">
              {/* Add/Edit Form */}
              {(isAddingProduct || editingProduct) && (
                <div className="mb-6 rounded-lg border border-gray-200 bg-gray-50 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    {editingProduct ? 'Edit Product' : 'Add New Product'}
                  </h3>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Product Name *
                        </label>
                        <input
                          type="text"
                          value={editingProduct?.name || newProduct.name || ''}
                          onChange={(e) => handleProductChange('name', e.target.value)}
                          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                          placeholder="Product Name"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Category *
                        </label>
                        <input
                          type="text"
                          value={editingProduct?.category || newProduct.category || ''}
                          onChange={(e) => handleProductChange('category', e.target.value)}
                          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                          placeholder="Category"
                          required
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Description
                      </label>
                      <textarea
                        value={editingProduct?.description || newProduct.description || ''}
                        onChange={(e) => handleProductChange('description', e.target.value)}
                        rows={3}
                        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        placeholder="Product description"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Image URL *
                      </label>
                      <input
                        type="text"
                        value={editingProduct?.image_url || newProduct.image_url || ''}
                        onChange={(e) => handleProductChange('image_url', e.target.value)}
                        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        placeholder="https://example.com/image.jpg"
                        required
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Price *
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          value={editingProduct?.price || newProduct.price || 0}
                          onChange={(e) => handleProductChange('price', parseFloat(e.target.value) || 0)}
                          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Stock *
                        </label>
                        <input
                          type="number"
                          min="0"
                          value={editingProduct?.stock || newProduct.stock || 0}
                          onChange={(e) => handleProductChange('stock', parseInt(e.target.value) || 0)}
                          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                          required
                        />
                      </div>
                      <div className="flex items-end">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={editingProduct?.featured ?? newProduct.featured ?? false}
                            onChange={(e) => handleProductChange('featured', e.target.checked)}
                            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                          <span className="text-sm font-medium text-gray-700">Featured</span>
                        </label>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={editingProduct ? handleUpdateProduct : handleAddProduct}
                        disabled={savingProduct}
                        className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
                      >
                        {savingProduct ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Saving...
                          </>
                        ) : (
                          <>
                            <Save className="w-4 h-4" />
                            {editingProduct ? 'Update Product' : 'Create Product'}
                          </>
                        )}
                      </button>
                      <button
                        onClick={() => {
                          setIsAddingProduct(false);
                          setEditingProduct(null);
                        }}
                        className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Products Table */}
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Name</th>
                      <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Category</th>
                      <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Price</th>
                      <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Stock</th>
                      <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Featured</th>
                      <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {products.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-4 py-8 text-center text-sm text-gray-500">
                          No products found. Click "Add New Product" to create one.
                        </td>
                      </tr>
                    ) : (
                      products.map((product) => (
                        <tr key={product.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3 text-sm font-medium text-gray-900">{product.name}</td>
                          <td className="px-4 py-3 text-sm text-gray-600">{product.category}</td>
                          <td className="px-4 py-3 text-sm text-gray-900">${product.price.toFixed(2)}</td>
                          <td className="px-4 py-3 text-sm text-gray-900">{product.stock}</td>
                          <td className="px-4 py-3 text-sm">
                            {product.featured ? (
                              <span className="inline-flex rounded-full px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800">
                                Yes
                              </span>
                            ) : (
                              <span className="inline-flex rounded-full px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800">
                                No
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-sm">
                            <div className="flex gap-2">
                              <button
                                onClick={() => {
                                  setEditingProduct(product);
                                  setIsAddingProduct(false);
                                }}
                                className="rounded-lg border border-gray-300 bg-white p-1.5 text-gray-600 hover:bg-gray-50"
                                title="Edit"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteProduct(product.id)}
                                disabled={deletingProduct === product.id}
                                className="rounded-lg border border-red-300 bg-red-50 p-1.5 text-red-600 hover:bg-red-100 disabled:opacity-50"
                                title="Delete"
                              >
                                {deletingProduct === product.id ? (
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                  <Trash2 className="w-4 h-4" />
                                )}
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Slider Config Tab */}
        {activeTab === 'slider' && (
          <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
            <div className="border-b border-gray-200 px-6 py-4">
              <h2 className="text-xl font-semibold text-gray-900">Background Slider Settings</h2>
            </div>

            <div className="p-6">
              <div className="space-y-6">
                {/* Images Array */}
                <div>
                  <div className="mb-3 flex items-center justify-between">
                    <label className="block text-sm font-medium text-gray-700">
                      Background Images (Max 10)
                    </label>
                    <button
                      onClick={addSliderImage}
                      disabled={sliderConfig.images.length >= 10}
                      className="inline-flex items-center gap-1 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Plus className="w-3 h-3" />
                      Add Image
                    </button>
                  </div>
                  <div className="overflow-x-auto rounded-lg border border-gray-200">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Image URL</th>
                          <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500 w-20">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200 bg-white">
                        {sliderConfig.images.length === 0 ? (
                          <tr>
                            <td colSpan={2} className="px-4 py-4 text-center text-sm text-gray-500">
                              No images added. Click "Add Image" to add one.
                            </td>
                          </tr>
                        ) : (
                          sliderConfig.images.map((imageUrl, index) => (
                            <tr key={index} className="hover:bg-gray-50">
                              <td className="px-4 py-2">
                                <input
                                  type="text"
                                  value={imageUrl}
                                  onChange={(e) => updateSliderImage(index, e.target.value)}
                                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                  placeholder="https://example.com/image.jpg"
                                />
                              </td>
                              <td className="px-4 py-2">
                                <button
                                  onClick={() => removeSliderImage(index)}
                                  className="rounded-lg border border-red-300 bg-red-50 p-2 text-red-600 hover:bg-red-100"
                                  title="Remove"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                  {sliderConfig.images.length >= 10 && (
                    <p className="mt-2 text-xs text-orange-600">Maximum 10 images reached</p>
                  )}
                </div>

                {/* Autoplay */}
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="autoplay"
                    checked={sliderConfig.autoplay}
                    onChange={(e) => setSliderConfig((prev) => ({ ...prev, autoplay: e.target.checked }))}
                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <label htmlFor="autoplay" className="text-sm font-medium text-gray-700">
                    Enable Autoplay
                  </label>
                </div>
              </div>

              {/* Save Button */}
              <div className="mt-8 flex justify-end">
                <button
                  onClick={handleSliderSave}
                  disabled={savingSlider}
                  className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {savingSlider ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      Save Slider Config
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
