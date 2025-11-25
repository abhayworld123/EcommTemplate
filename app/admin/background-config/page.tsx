'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { BackgroundConfig, HeaderConfig, NavigationItem, SiteConfig, Offer, Product, SliderConfig, ThreeColumnDesignConfig, ThreeColumnItem, FiveColumnDesignConfig, SmallProductSliderConfig, SmallProductSliderItem, SocialNetworkSliderConfig, SocialNetworkPost, ViralSliderConfig, ViralSliderVideo } from '@/types';
import { Save, ArrowLeft, CheckCircle, XCircle, Loader2, Plus, Trash2, Edit2 } from 'lucide-react';

type TabType = 'background' | 'header' | 'site' | 'offers' | 'products' | 'slider' | 'three-column' | 'five-column' | 'small-product-slider' | 'social-network-slider' | 'viral-slider';

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
  const [savingThreeColumn, setSavingThreeColumn] = useState(false);
  const [savingFiveColumn, setSavingFiveColumn] = useState(false);
  const [savingSmallProductSlider, setSavingSmallProductSlider] = useState(false);
  const [smallProductSliderConfigs, setSmallProductSliderConfigs] = useState<SmallProductSliderConfig[]>([]);
  const [selectedSmallProductSliderId, setSelectedSmallProductSliderId] = useState<string>('');
  const [savingSocialNetworkSlider, setSavingSocialNetworkSlider] = useState(false);
  const [socialNetworkSliderConfigs, setSocialNetworkSliderConfigs] = useState<SocialNetworkSliderConfig[]>([]);
  const [selectedSocialNetworkSliderId, setSelectedSocialNetworkSliderId] = useState<string>('');
  const [socialNetworkSliderConfig, setSocialNetworkSliderConfig] = useState<SocialNetworkSliderConfig>({
    id: '',
    headline: '',
    posts: [],
    display_order: 0,
    is_active: true,
    autoplay: false,
    scroll_speed: 5,
  });
  const [savingViralSlider, setSavingViralSlider] = useState(false);
  const [viralSliderConfig, setViralSliderConfig] = useState<ViralSliderConfig>({
    id: '1',
    headline: '',
    videos: [],
    display_order: 0,
    is_active: true,
    autoplay: false,
    scroll_speed: 5,
  });
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [sliderConfig, setSliderConfig] = useState<SliderConfig>({
    id: '1',
    images: [],
    autoplay: false,
  });
  const [threeColumnConfig, setThreeColumnConfig] = useState<ThreeColumnDesignConfig>({
    id: '',
    column1_title: '',
    column1_items: [],
    column2_title: '',
    column2_items: [],
    column3_headline: '',
    column3_subheadline: '',
    column3_cta_text: 'Shop Now',
    column3_cta_link: '/products',
    column3_image_url: '',
    display_order: 0,
    is_active: true,
  });
  const [fiveColumnConfig, setFiveColumnConfig] = useState<FiveColumnDesignConfig>({
    id: '',
    column1_headline: '',
    column1_subheadline: '',
    column1_cta_text: 'Shop Now',
    column1_cta_link: '/products',
    column1_image_url: '',
    column2_title: '',
    column2_cta_text: 'Shop Now',
    column2_cta_link: '/products',
    column2_image_url: '',
    column3_title: '',
    column3_price_text: '',
    column3_cta_text: 'Shop Now',
    column3_cta_link: '/products',
    column3_image_url: '',
    column4_title: '',
    column4_price_text: '',
    column4_cta_text: 'Shop Now',
    column4_cta_link: '/products',
    column4_image_url: '',
    column5_title: '',
    column5_price_text: '',
    column5_cta_text: 'Shop Now',
    column5_cta_link: '/products',
    column5_image_url: '',
    display_order: 0,
    is_active: true,
  });
  const [smallProductSliderConfig, setSmallProductSliderConfig] = useState<SmallProductSliderConfig>({
    id: '',
    headline: '',
    products: [],
    display_order: 0,
    is_active: true,
    autoplay: false,
    scroll_speed: 5,
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
      const [bgRes, headerRes, siteRes, offersRes, productsRes, sliderRes, threeColumnRes, fiveColumnRes, smallProductSliderRes, socialNetworkSliderRes, viralSliderRes] = await Promise.all([
        fetch('/api/background-config'),
        fetch('/api/header-config'),
        fetch('/api/site-config'),
        fetch('/api/offers?active=false'),
        fetch('/api/products'),
        fetch('/api/slider-config'),
        fetch('/api/three-column-design'),
        fetch('/api/five-column-design?include_inactive=true'),
        fetch('/api/small-product-slider?include_inactive=true'),
        fetch('/api/social-network-slider?include_inactive=true'),
        fetch('/api/viral-slider'),
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

      if (threeColumnRes.ok) {
        const threeColumnData = await threeColumnRes.json();
        if (Array.isArray(threeColumnData) && threeColumnData.length > 0) {
          // Get the config with display_order 0, or the first one
          const defaultConfig = threeColumnData.find((c: any) => c.display_order === 0) || threeColumnData[0];
          setThreeColumnConfig(defaultConfig);
        }
      }

      if (fiveColumnRes.ok) {
        const fiveColumnData = await fiveColumnRes.json();
        if (Array.isArray(fiveColumnData) && fiveColumnData.length > 0) {
          // Get the config with display_order 0, or the first one
          const defaultConfig = fiveColumnData.find((c: any) => c.display_order === 0) || fiveColumnData[0];
          setFiveColumnConfig(defaultConfig);
        }
      }

      if (smallProductSliderRes.ok) {
        const smallProductSliderData = await smallProductSliderRes.json();
        if (Array.isArray(smallProductSliderData)) {
          setSmallProductSliderConfigs(smallProductSliderData);
          if (smallProductSliderData.length > 0) {
            const defaultConfig = smallProductSliderData.find((c: any) => c.display_order === 0) || smallProductSliderData[0];
            setSmallProductSliderConfig(defaultConfig);
            setSelectedSmallProductSliderId(defaultConfig.id);
          }
        }
      }

      if (socialNetworkSliderRes.ok) {
        const socialNetworkSliderData = await socialNetworkSliderRes.json();
        if (Array.isArray(socialNetworkSliderData)) {
          setSocialNetworkSliderConfigs(socialNetworkSliderData);
          if (socialNetworkSliderData.length > 0) {
            const defaultConfig = socialNetworkSliderData.find((c: any) => c.display_order === 0) || socialNetworkSliderData[0];
            setSocialNetworkSliderConfig(defaultConfig);
            setSelectedSocialNetworkSliderId(defaultConfig.id);
          }
        }
      }

      if (viralSliderRes.ok) {
        const viralSliderData = await viralSliderRes.json();
        if (viralSliderData && viralSliderData.id) {
          setViralSliderConfig(viralSliderData);
        }
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

  const handleThreeColumnSave = async () => {
    setSavingThreeColumn(true);
    setMessage(null);

    try {
      const method = threeColumnConfig.id ? 'PUT' : 'POST';
      const res = await fetch('/api/three-column-design', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(threeColumnConfig),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to save configuration');
      }

      const data = await res.json();
      setThreeColumnConfig(data);
      setMessage({ type: 'success', text: '3 Column Design configuration saved successfully!' });
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      console.error('Failed to save three column config:', error);
      setMessage({
        type: 'error',
        text: error instanceof Error ? error.message : 'Failed to save configuration',
      });
    } finally {
      setSavingThreeColumn(false);
    }
  };

  const handleFiveColumnSave = async () => {
    setSavingFiveColumn(true);
    setMessage(null);

    try {
      const method = fiveColumnConfig.id ? 'PUT' : 'POST';
      const res = await fetch('/api/five-column-design', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(fiveColumnConfig),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to save configuration');
      }

      const data = await res.json();
      setFiveColumnConfig(data);
      setMessage({ type: 'success', text: '5 Column Design configuration saved successfully!' });
      setTimeout(() => setMessage(null), 3000);
      // Refresh configs to get updated data
      fetchConfigs();
    } catch (error) {
      console.error('Failed to save five column config:', error);
      setMessage({
        type: 'error',
        text: error instanceof Error ? error.message : 'Failed to save configuration',
      });
    } finally {
      setSavingFiveColumn(false);
    }
  };

  const handleSmallProductSliderSave = async () => {
    setSavingSmallProductSlider(true);
    setMessage(null);

    try {
      const method = smallProductSliderConfig.id ? 'PUT' : 'POST';
      const res = await fetch('/api/small-product-slider', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(smallProductSliderConfig),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to save configuration');
      }

      const data = await res.json();
      setSmallProductSliderConfig(data);
      setSelectedSmallProductSliderId(data.id);
      setMessage({ type: 'success', text: 'Small Product Slider configuration saved successfully!' });
      setTimeout(() => setMessage(null), 3000);
      // Refresh configs to get updated data
      fetchConfigs();
    } catch (error) {
      console.error('Failed to save small product slider config:', error);
      setMessage({
        type: 'error',
        text: error instanceof Error ? error.message : 'Failed to save configuration',
      });
    } finally {
      setSavingSmallProductSlider(false);
    }
  };

  const addSmallProductSliderProduct = () => {
    const newProduct: SmallProductSliderItem = {
      image_url: '',
      title: '',
      price: '',
      unit_price: '',
      description: '',
      link: '',
      sponsored: false,
    };
    setSmallProductSliderConfig((prev) => ({
      ...prev,
      products: [...prev.products, newProduct],
    }));
  };

  const removeSmallProductSliderProduct = (index: number) => {
    setSmallProductSliderConfig((prev) => ({
      ...prev,
      products: prev.products.filter((_, i) => i !== index),
    }));
  };

  const updateSmallProductSliderProduct = (index: number, field: keyof SmallProductSliderItem, value: any) => {
    setSmallProductSliderConfig((prev) => {
      const newProducts = [...prev.products];
      newProducts[index] = { ...newProducts[index], [field]: value };
      return { ...prev, products: newProducts };
    });
  };

  const handleSocialNetworkSliderSave = async () => {
    setSavingSocialNetworkSlider(true);
    setMessage(null);

    try {
      const method = socialNetworkSliderConfig.id ? 'PUT' : 'POST';
      const res = await fetch('/api/social-network-slider', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(socialNetworkSliderConfig),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to save configuration');
      }

      const data = await res.json();
      setSocialNetworkSliderConfig(data);
      setSelectedSocialNetworkSliderId(data.id);
      setMessage({ type: 'success', text: 'Social Network Slider configuration saved successfully!' });
      setTimeout(() => setMessage(null), 3000);
      fetchConfigs();
    } catch (error) {
      console.error('Failed to save social network slider config:', error);
      setMessage({
        type: 'error',
        text: error instanceof Error ? error.message : 'Failed to save configuration',
      });
    } finally {
      setSavingSocialNetworkSlider(false);
    }
  };

  const addSocialNetworkPost = () => {
    const newPost: SocialNetworkPost = {
      media_url: '',
      media_type: 'image',
      product_title: '',
      product_price: '',
      product_link: '',
      social_handle: '',
      caption: '',
      tag_position_x: 50,
      tag_position_y: 30,
    };
    setSocialNetworkSliderConfig((prev) => ({
      ...prev,
      posts: [...prev.posts, newPost],
    }));
  };

  const removeSocialNetworkPost = (index: number) => {
    setSocialNetworkSliderConfig((prev) => ({
      ...prev,
      posts: prev.posts.filter((_, i) => i !== index),
    }));
  };

  const updateSocialNetworkPost = (index: number, field: keyof SocialNetworkPost, value: any) => {
    setSocialNetworkSliderConfig((prev) => {
      const newPosts = [...prev.posts];
      newPosts[index] = { ...newPosts[index], [field]: value };
      return { ...prev, posts: newPosts };
    });
  };

  const handleViralSliderSave = async () => {
    setSavingViralSlider(true);
    setMessage(null);

    try {
      const res = await fetch('/api/viral-slider', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(viralSliderConfig),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to save configuration');
      }

      const data = await res.json();
      setViralSliderConfig(data);
      setMessage({ type: 'success', text: 'Viral Slider configuration saved successfully!' });
      setTimeout(() => setMessage(null), 3000);
      fetchConfigs();
    } catch (error) {
      console.error('Failed to save viral slider config:', error);
      setMessage({
        type: 'error',
        text: error instanceof Error ? error.message : 'Failed to save configuration',
      });
    } finally {
      setSavingViralSlider(false);
    }
  };

  const addViralSliderVideo = () => {
    const newVideo: ViralSliderVideo = {
      video_url: '',
      social_handle: '',
      caption: '',
      product_title: '',
      product_price: '',
      product_thumbnail: '',
      product_link: '',
    };
    setViralSliderConfig((prev) => ({
      ...prev,
      videos: [...prev.videos, newVideo],
    }));
  };

  const removeViralSliderVideo = (index: number) => {
    setViralSliderConfig((prev) => ({
      ...prev,
      videos: prev.videos.filter((_, i) => i !== index),
    }));
  };

  const updateViralSliderVideo = (index: number, field: keyof ViralSliderVideo, value: any) => {
    setViralSliderConfig((prev) => {
      const newVideos = [...prev.videos];
      newVideos[index] = { ...newVideos[index], [field]: value };
      return { ...prev, videos: newVideos };
    });
  };

  const addColumnItem = (column: 'column1' | 'column2') => {
    const newItem: ThreeColumnItem = {
      image_url: '',
      title: '',
      description: '',
      link: '/products',
      discount_text: '',
    };
    if (column === 'column1') {
      setThreeColumnConfig((prev) => ({
        ...prev,
        column1_items: [...prev.column1_items, newItem],
      }));
    } else {
      setThreeColumnConfig((prev) => ({
        ...prev,
        column2_items: [...prev.column2_items, newItem],
      }));
    }
  };

  const updateColumnItem = (column: 'column1' | 'column2', index: number, field: keyof ThreeColumnItem, value: string) => {
    if (column === 'column1') {
      setThreeColumnConfig((prev) => {
        const items = [...prev.column1_items];
        items[index] = { ...items[index], [field]: value };
        return { ...prev, column1_items: items };
      });
    } else {
      setThreeColumnConfig((prev) => {
        const items = [...prev.column2_items];
        items[index] = { ...items[index], [field]: value };
        return { ...prev, column2_items: items };
      });
    }
  };

  const removeColumnItem = (column: 'column1' | 'column2', index: number) => {
    if (column === 'column1') {
      setThreeColumnConfig((prev) => ({
        ...prev,
        column1_items: prev.column1_items.filter((_, i) => i !== index),
      }));
    } else {
      setThreeColumnConfig((prev) => ({
        ...prev,
        column2_items: prev.column2_items.filter((_, i) => i !== index),
      }));
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
          <div className="overflow-x-auto scrollbar-hide max-w-full">
            <nav className="-mb-px flex space-x-8 min-w-max pb-1">
              <button
                onClick={() => setActiveTab('background')}
                className={`whitespace-nowrap border-b-2 px-1 py-4 text-sm font-medium flex-shrink-0 ${
                  activeTab === 'background'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                }`}
              >
                Background Config
              </button>
              <button
                onClick={() => setActiveTab('header')}
                className={`whitespace-nowrap border-b-2 px-1 py-4 text-sm font-medium flex-shrink-0 ${
                  activeTab === 'header'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                }`}
              >
                Header Config
              </button>
              <button
                onClick={() => setActiveTab('site')}
                className={`whitespace-nowrap border-b-2 px-1 py-4 text-sm font-medium flex-shrink-0 ${
                  activeTab === 'site'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                }`}
              >
                Site Config
              </button>
              <button
                onClick={() => setActiveTab('offers')}
                className={`whitespace-nowrap border-b-2 px-1 py-4 text-sm font-medium flex-shrink-0 ${
                  activeTab === 'offers'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                }`}
              >
                Offers
              </button>
              <button
                onClick={() => setActiveTab('products')}
                className={`whitespace-nowrap border-b-2 px-1 py-4 text-sm font-medium flex-shrink-0 ${
                  activeTab === 'products'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                }`}
              >
                Products
              </button>
              <button
                onClick={() => setActiveTab('slider')}
                className={`whitespace-nowrap border-b-2 px-1 py-4 text-sm font-medium flex-shrink-0 ${
                  activeTab === 'slider'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                }`}
              >
                Slider Config
              </button>
              <button
                onClick={() => setActiveTab('three-column')}
                className={`whitespace-nowrap border-b-2 px-1 py-4 text-sm font-medium flex-shrink-0 ${
                  activeTab === 'three-column'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                }`}
              >
                3 Column Design
              </button>
              <button
                onClick={() => setActiveTab('five-column')}
                className={`whitespace-nowrap border-b-2 px-1 py-4 text-sm font-medium flex-shrink-0 ${
                  activeTab === 'five-column'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                }`}
              >
                5 Column Design
              </button>
              <button
                onClick={() => setActiveTab('small-product-slider')}
                className={`whitespace-nowrap border-b-2 px-1 py-4 text-sm font-medium flex-shrink-0 ${
                  activeTab === 'small-product-slider'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                }`}
              >
                Small Product Slider
              </button>
              <button
                onClick={() => setActiveTab('social-network-slider')}
                className={`whitespace-nowrap border-b-2 px-1 py-4 text-sm font-medium flex-shrink-0 ${
                  activeTab === 'social-network-slider'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                }`}
              >
                Social Network Slider
              </button>
              <button
                onClick={() => setActiveTab('viral-slider')}
                className={`whitespace-nowrap border-b-2 px-1 py-4 text-sm font-medium flex-shrink-0 ${
                  activeTab === 'viral-slider'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                }`}
              >
                Viral Slider
              </button>
            </nav>
          </div>
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

        {/* Three Column Design Tab */}
        {activeTab === 'three-column' && (
          <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
            <div className="border-b border-gray-200 px-6 py-4">
              <h2 className="text-xl font-semibold text-gray-900">3 Column Design Configuration</h2>
            </div>

            <div className="p-6">
              <div className="space-y-8">
                {/* Column 1 */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Column 1</h3>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                    <input
                      type="text"
                      value={threeColumnConfig.column1_title}
                      onChange={(e) => setThreeColumnConfig((prev) => ({ ...prev, column1_title: e.target.value }))}
                      className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      placeholder="Best Deals on Designer Furniture"
                    />
                  </div>
                  <div className="mb-4">
                    <div className="mb-2 flex items-center justify-between">
                      <label className="block text-sm font-medium text-gray-700">Items (Max 4)</label>
                      <button
                        onClick={() => addColumnItem('column1')}
                        disabled={threeColumnConfig.column1_items.length >= 4}
                        className="inline-flex items-center gap-1 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Plus className="w-3 h-3" />
                        Add Item
                      </button>
                    </div>
                    <div className="space-y-3">
                      {threeColumnConfig.column1_items.map((item, index) => (
                        <div key={index} className="rounded-lg border border-gray-200 p-4 space-y-3">
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="block text-xs font-medium text-gray-700 mb-1">Image URL</label>
                              <input
                                type="text"
                                value={item.image_url}
                                onChange={(e) => updateColumnItem('column1', index, 'image_url', e.target.value)}
                                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-xs focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                                placeholder="https://example.com/image.jpg"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-gray-700 mb-1">Title</label>
                              <input
                                type="text"
                                value={item.title}
                                onChange={(e) => updateColumnItem('column1', index, 'title', e.target.value)}
                                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-xs focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                                placeholder="Product Title"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-gray-700 mb-1">Link</label>
                              <input
                                type="text"
                                value={item.link}
                                onChange={(e) => updateColumnItem('column1', index, 'link', e.target.value)}
                                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-xs focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                                placeholder="/products/123"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-gray-700 mb-1">Discount Text</label>
                              <input
                                type="text"
                                value={item.discount_text || ''}
                                onChange={(e) => updateColumnItem('column1', index, 'discount_text', e.target.value)}
                                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-xs focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                                placeholder="Min. 50% Off"
                              />
                            </div>
                          </div>
                          <button
                            onClick={() => removeColumnItem('column1', index)}
                            className="w-full rounded-lg border border-red-300 bg-red-50 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-100"
                          >
                            <Trash2 className="w-3 h-3 inline mr-1" />
                            Remove Item
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Column 2 */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Column 2</h3>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                    <input
                      type="text"
                      value={threeColumnConfig.column2_title}
                      onChange={(e) => setThreeColumnConfig((prev) => ({ ...prev, column2_title: e.target.value }))}
                      className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      placeholder="Winter Essentials for You"
                    />
                  </div>
                  <div className="mb-4">
                    <div className="mb-2 flex items-center justify-between">
                      <label className="block text-sm font-medium text-gray-700">Items (Max 4)</label>
                      <button
                        onClick={() => addColumnItem('column2')}
                        disabled={threeColumnConfig.column2_items.length >= 4}
                        className="inline-flex items-center gap-1 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Plus className="w-3 h-3" />
                        Add Item
                      </button>
                    </div>
                    <div className="space-y-3">
                      {threeColumnConfig.column2_items.map((item, index) => (
                        <div key={index} className="rounded-lg border border-gray-200 p-4 space-y-3">
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="block text-xs font-medium text-gray-700 mb-1">Image URL</label>
                              <input
                                type="text"
                                value={item.image_url}
                                onChange={(e) => updateColumnItem('column2', index, 'image_url', e.target.value)}
                                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-xs focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                                placeholder="https://example.com/image.jpg"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-gray-700 mb-1">Title</label>
                              <input
                                type="text"
                                value={item.title}
                                onChange={(e) => updateColumnItem('column2', index, 'title', e.target.value)}
                                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-xs focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                                placeholder="Product Title"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-gray-700 mb-1">Link</label>
                              <input
                                type="text"
                                value={item.link}
                                onChange={(e) => updateColumnItem('column2', index, 'link', e.target.value)}
                                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-xs focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                                placeholder="/products/123"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-gray-700 mb-1">Discount Text</label>
                              <input
                                type="text"
                                value={item.discount_text || ''}
                                onChange={(e) => updateColumnItem('column2', index, 'discount_text', e.target.value)}
                                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-xs focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                                placeholder="Min. 50% Off"
                              />
                            </div>
                          </div>
                          <button
                            onClick={() => removeColumnItem('column2', index)}
                            className="w-full rounded-lg border border-red-300 bg-red-50 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-100"
                          >
                            <Trash2 className="w-3 h-3 inline mr-1" />
                            Remove Item
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Column 3 */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Column 3 (Promotional Banner)</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Headline</label>
                      <input
                        type="text"
                        value={threeColumnConfig.column3_headline}
                        onChange={(e) => setThreeColumnConfig((prev) => ({ ...prev, column3_headline: e.target.value }))}
                        className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        placeholder="Shop your fashion Needs"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Sub-headline</label>
                      <input
                        type="text"
                        value={threeColumnConfig.column3_subheadline || ''}
                        onChange={(e) => setThreeColumnConfig((prev) => ({ ...prev, column3_subheadline: e.target.value }))}
                        className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        placeholder="with Latest & Trendy Choices"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">CTA Text</label>
                      <input
                        type="text"
                        value={threeColumnConfig.column3_cta_text}
                        onChange={(e) => setThreeColumnConfig((prev) => ({ ...prev, column3_cta_text: e.target.value }))}
                        className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        placeholder="Shop Now"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">CTA Link</label>
                      <input
                        type="text"
                        value={threeColumnConfig.column3_cta_link}
                        onChange={(e) => setThreeColumnConfig((prev) => ({ ...prev, column3_cta_link: e.target.value }))}
                        className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        placeholder="/products"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Image URL</label>
                      <input
                        type="text"
                        value={threeColumnConfig.column3_image_url || ''}
                        onChange={(e) => setThreeColumnConfig((prev) => ({ ...prev, column3_image_url: e.target.value }))}
                        className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        placeholder="https://example.com/promotional-image.jpg"
                      />
                    </div>
                  </div>
                </div>

                {/* Display Order & Active */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Display Order</label>
                    <input
                      type="number"
                      value={threeColumnConfig.display_order}
                      onChange={(e) => setThreeColumnConfig((prev) => ({ ...prev, display_order: parseInt(e.target.value) || 0 }))}
                      className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>
                  <div className="flex items-center gap-3 pt-8">
                    <input
                      type="checkbox"
                      id="three-column-active"
                      checked={threeColumnConfig.is_active}
                      onChange={(e) => setThreeColumnConfig((prev) => ({ ...prev, is_active: e.target.checked }))}
                      className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <label htmlFor="three-column-active" className="text-sm font-medium text-gray-700">
                      Active
                    </label>
                  </div>
                </div>
              </div>

              {/* Save Button */}
              <div className="mt-8 flex justify-end">
                <button
                  onClick={handleThreeColumnSave}
                  disabled={savingThreeColumn}
                  className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {savingThreeColumn ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      Save 3 Column Design Config
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Five Column Design Tab */}
        {activeTab === 'five-column' && (
          <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
            <div className="border-b border-gray-200 px-6 py-4">
              <h2 className="text-xl font-semibold text-gray-900">5 Column Design Configuration</h2>
            </div>

            <div className="p-6">
              <div className="space-y-8">
                {/* Column 1 - Large Promotional Tile */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Column 1 (Large Promotional Tile)</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Headline</label>
                      <input
                        type="text"
                        value={fiveColumnConfig.column1_headline}
                        onChange={(e) => setFiveColumnConfig((prev) => ({ ...prev, column1_headline: e.target.value }))}
                        className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        placeholder="A feast for 10, under $4 per person*"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Sub-headline</label>
                      <input
                        type="text"
                        value={fiveColumnConfig.column1_subheadline || ''}
                        onChange={(e) => setFiveColumnConfig((prev) => ({ ...prev, column1_subheadline: e.target.value }))}
                        className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        placeholder="Optional sub-headline"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">CTA Text</label>
                      <input
                        type="text"
                        value={fiveColumnConfig.column1_cta_text}
                        onChange={(e) => setFiveColumnConfig((prev) => ({ ...prev, column1_cta_text: e.target.value }))}
                        className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        placeholder="Shop the list"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">CTA Link</label>
                      <input
                        type="text"
                        value={fiveColumnConfig.column1_cta_link}
                        onChange={(e) => setFiveColumnConfig((prev) => ({ ...prev, column1_cta_link: e.target.value }))}
                        className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        placeholder="/products"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Image URL</label>
                      <input
                        type="text"
                        value={fiveColumnConfig.column1_image_url || ''}
                        onChange={(e) => setFiveColumnConfig((prev) => ({ ...prev, column1_image_url: e.target.value }))}
                        className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        placeholder="https://example.com/image.jpg"
                      />
                    </div>
                  </div>
                </div>

                {/* Column 2 - Top Left */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Column 2 (Top Left)</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                      <input
                        type="text"
                        value={fiveColumnConfig.column2_title}
                        onChange={(e) => setFiveColumnConfig((prev) => ({ ...prev, column2_title: e.target.value }))}
                        className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        placeholder="Ingredients in 1 click"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">CTA Text</label>
                      <input
                        type="text"
                        value={fiveColumnConfig.column2_cta_text}
                        onChange={(e) => setFiveColumnConfig((prev) => ({ ...prev, column2_cta_text: e.target.value }))}
                        className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        placeholder="Shop now"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">CTA Link</label>
                      <input
                        type="text"
                        value={fiveColumnConfig.column2_cta_link}
                        onChange={(e) => setFiveColumnConfig((prev) => ({ ...prev, column2_cta_link: e.target.value }))}
                        className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        placeholder="/products"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Image URL</label>
                      <input
                        type="text"
                        value={fiveColumnConfig.column2_image_url || ''}
                        onChange={(e) => setFiveColumnConfig((prev) => ({ ...prev, column2_image_url: e.target.value }))}
                        className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        placeholder="https://example.com/image.jpg"
                      />
                    </div>
                  </div>
                </div>

                {/* Column 3 - Top Right */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Column 3 (Top Right)</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                      <input
                        type="text"
                        value={fiveColumnConfig.column3_title}
                        onChange={(e) => setFiveColumnConfig((prev) => ({ ...prev, column3_title: e.target.value }))}
                        className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        placeholder="Picture-perfect holiday looks"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Price Text</label>
                      <input
                        type="text"
                        value={fiveColumnConfig.column3_price_text || ''}
                        onChange={(e) => setFiveColumnConfig((prev) => ({ ...prev, column3_price_text: e.target.value }))}
                        className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        placeholder="From $10"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">CTA Text</label>
                      <input
                        type="text"
                        value={fiveColumnConfig.column3_cta_text}
                        onChange={(e) => setFiveColumnConfig((prev) => ({ ...prev, column3_cta_text: e.target.value }))}
                        className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        placeholder="Shop now"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">CTA Link</label>
                      <input
                        type="text"
                        value={fiveColumnConfig.column3_cta_link}
                        onChange={(e) => setFiveColumnConfig((prev) => ({ ...prev, column3_cta_link: e.target.value }))}
                        className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        placeholder="/products"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Image URL</label>
                      <input
                        type="text"
                        value={fiveColumnConfig.column3_image_url || ''}
                        onChange={(e) => setFiveColumnConfig((prev) => ({ ...prev, column3_image_url: e.target.value }))}
                        className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        placeholder="https://example.com/image.jpg"
                      />
                    </div>
                  </div>
                </div>

                {/* Column 4 - Bottom Left */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Column 4 (Bottom Left)</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                      <input
                        type="text"
                        value={fiveColumnConfig.column4_title}
                        onChange={(e) => setFiveColumnConfig((prev) => ({ ...prev, column4_title: e.target.value }))}
                        className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        placeholder="Tabletop perfection"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Price Text</label>
                      <input
                        type="text"
                        value={fiveColumnConfig.column4_price_text || ''}
                        onChange={(e) => setFiveColumnConfig((prev) => ({ ...prev, column4_price_text: e.target.value }))}
                        className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        placeholder="Starting at $4.48"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">CTA Text</label>
                      <input
                        type="text"
                        value={fiveColumnConfig.column4_cta_text}
                        onChange={(e) => setFiveColumnConfig((prev) => ({ ...prev, column4_cta_text: e.target.value }))}
                        className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        placeholder="Shop now"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">CTA Link</label>
                      <input
                        type="text"
                        value={fiveColumnConfig.column4_cta_link}
                        onChange={(e) => setFiveColumnConfig((prev) => ({ ...prev, column4_cta_link: e.target.value }))}
                        className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        placeholder="/products"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Image URL</label>
                      <input
                        type="text"
                        value={fiveColumnConfig.column4_image_url || ''}
                        onChange={(e) => setFiveColumnConfig((prev) => ({ ...prev, column4_image_url: e.target.value }))}
                        className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        placeholder="https://example.com/image.jpg"
                      />
                    </div>
                  </div>
                </div>

                {/* Column 5 - Bottom Right */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Column 5 (Bottom Right)</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                      <input
                        type="text"
                        value={fiveColumnConfig.column5_title}
                        onChange={(e) => setFiveColumnConfig((prev) => ({ ...prev, column5_title: e.target.value }))}
                        className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        placeholder="Pantry staples starting at 50¢"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Price Text</label>
                      <input
                        type="text"
                        value={fiveColumnConfig.column5_price_text || ''}
                        onChange={(e) => setFiveColumnConfig((prev) => ({ ...prev, column5_price_text: e.target.value }))}
                        className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        placeholder="Starting at 50¢"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">CTA Text</label>
                      <input
                        type="text"
                        value={fiveColumnConfig.column5_cta_text}
                        onChange={(e) => setFiveColumnConfig((prev) => ({ ...prev, column5_cta_text: e.target.value }))}
                        className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        placeholder="Shop now"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">CTA Link</label>
                      <input
                        type="text"
                        value={fiveColumnConfig.column5_cta_link}
                        onChange={(e) => setFiveColumnConfig((prev) => ({ ...prev, column5_cta_link: e.target.value }))}
                        className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        placeholder="/products"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Image URL</label>
                      <input
                        type="text"
                        value={fiveColumnConfig.column5_image_url || ''}
                        onChange={(e) => setFiveColumnConfig((prev) => ({ ...prev, column5_image_url: e.target.value }))}
                        className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        placeholder="https://example.com/image.jpg"
                      />
                    </div>
                  </div>
                </div>

                {/* Display Order & Active */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Display Order</label>
                    <input
                      type="number"
                      value={fiveColumnConfig.display_order}
                      onChange={(e) => setFiveColumnConfig((prev) => ({ ...prev, display_order: parseInt(e.target.value) || 0 }))}
                      className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>
                  <div className="flex items-center gap-3 pt-8">
                    <input
                      type="checkbox"
                      id="five-column-active"
                      checked={fiveColumnConfig.is_active}
                      onChange={(e) => setFiveColumnConfig((prev) => ({ ...prev, is_active: e.target.checked }))}
                      className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <label htmlFor="five-column-active" className="text-sm font-medium text-gray-700">
                      Active
                    </label>
                  </div>
                </div>
              </div>

              {/* Save Button */}
              <div className="mt-8 flex justify-end">
                <button
                  onClick={handleFiveColumnSave}
                  disabled={savingFiveColumn}
                  className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {savingFiveColumn ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      Save 5 Column Design Config
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Small Product Slider Tab */}
        {activeTab === 'small-product-slider' && (
          <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
            <div className="border-b border-gray-200 px-6 py-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">Small Product Slider Configuration</h2>
                <select
                  value={selectedSmallProductSliderId}
                  onChange={(e) => {
                    if (e.target.value === 'new') {
                      setSmallProductSliderConfig({
                        id: '',
                        headline: '',
                        products: [],
                        display_order: 0,
                        is_active: true,
                        autoplay: false,
                        scroll_speed: 5,
                      });
                      setSelectedSmallProductSliderId('new');
                    } else {
                      const selected = smallProductSliderConfigs.find((c) => c.id === e.target.value);
                      if (selected) {
                        setSmallProductSliderConfig(selected);
                        setSelectedSmallProductSliderId(selected.id);
                      }
                    }
                  }}
                  className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  {smallProductSliderConfigs.map((config) => (
                    <option key={config.id} value={config.id}>
                      {config.headline || `Slider ${config.display_order}`} (Order: {config.display_order})
                    </option>
                  ))}
                  <option value="new">+ Create New Slider</option>
                </select>
              </div>
            </div>

            <div className="p-6">
              <div className="space-y-6">
                {/* Basic Settings */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Basic Settings</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Headline</label>
                      <input
                        type="text"
                        value={smallProductSliderConfig.headline}
                        onChange={(e) => setSmallProductSliderConfig((prev) => ({ ...prev, headline: e.target.value }))}
                        className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        placeholder="Popular in clothing, shoes & accessories"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Display Order</label>
                      <input
                        type="number"
                        value={smallProductSliderConfig.display_order}
                        onChange={(e) => setSmallProductSliderConfig((prev) => ({ ...prev, display_order: parseInt(e.target.value) || 0 }))}
                        className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      />
                    </div>
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        id="small-slider-active"
                        checked={smallProductSliderConfig.is_active}
                        onChange={(e) => setSmallProductSliderConfig((prev) => ({ ...prev, is_active: e.target.checked }))}
                        className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <label htmlFor="small-slider-active" className="text-sm font-medium text-gray-700">
                        Active
                      </label>
                    </div>
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        id="small-slider-autoplay"
                        checked={smallProductSliderConfig.autoplay || false}
                        onChange={(e) => setSmallProductSliderConfig((prev) => ({ ...prev, autoplay: e.target.checked }))}
                        className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <label htmlFor="small-slider-autoplay" className="text-sm font-medium text-gray-700">
                        Autoplay
                      </label>
                    </div>
                    {smallProductSliderConfig.autoplay && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Scroll Speed (seconds)</label>
                        <input
                          type="number"
                          value={smallProductSliderConfig.scroll_speed || 5}
                          onChange={(e) => setSmallProductSliderConfig((prev) => ({ ...prev, scroll_speed: parseInt(e.target.value) || 5 }))}
                          className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                          min="1"
                        />
                      </div>
                    )}
                  </div>
                </div>

                {/* Products */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">Products</h3>
                    <button
                      onClick={addSmallProductSliderProduct}
                      className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                      Add Product
                    </button>
                  </div>
                  <div className="space-y-4">
                    {smallProductSliderConfig.products.map((product, index) => (
                      <div key={index} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-4">
                          <h4 className="text-sm font-semibold text-gray-900">Product {index + 1}</h4>
                          <button
                            onClick={() => removeSmallProductSliderProduct(index)}
                            className="text-red-600 hover:text-red-800 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Image URL</label>
                            <input
                              type="text"
                              value={product.image_url}
                              onChange={(e) => updateSmallProductSliderProduct(index, 'image_url', e.target.value)}
                              className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                              placeholder="https://example.com/image.jpg"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                            <input
                              type="text"
                              value={product.title}
                              onChange={(e) => updateSmallProductSliderProduct(index, 'title', e.target.value)}
                              className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                              placeholder="Product title"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Price</label>
                            <input
                              type="text"
                              value={product.price}
                              onChange={(e) => updateSmallProductSliderProduct(index, 'price', e.target.value)}
                              className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                              placeholder="$10.97"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Unit Price (optional)</label>
                            <input
                              type="text"
                              value={product.unit_price || ''}
                              onChange={(e) => updateSmallProductSliderProduct(index, 'unit_price', e.target.value)}
                              className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                              placeholder="$10.97/count"
                            />
                          </div>
                          <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                            <input
                              type="text"
                              value={product.description || ''}
                              onChange={(e) => updateSmallProductSliderProduct(index, 'description', e.target.value)}
                              className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                              placeholder="Product description"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Link</label>
                            <input
                              type="text"
                              value={product.link || ''}
                              onChange={(e) => updateSmallProductSliderProduct(index, 'link', e.target.value)}
                              className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                              placeholder="/products/123"
                            />
                          </div>
                          <div className="flex items-center gap-3 pt-8">
                            <input
                              type="checkbox"
                              id={`product-sponsored-${index}`}
                              checked={product.sponsored || false}
                              onChange={(e) => updateSmallProductSliderProduct(index, 'sponsored', e.target.checked)}
                              className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                            <label htmlFor={`product-sponsored-${index}`} className="text-sm font-medium text-gray-700">
                              Sponsored
                            </label>
                          </div>
                        </div>
                      </div>
                    ))}
                    {smallProductSliderConfig.products.length === 0 && (
                      <p className="text-sm text-gray-500 text-center py-8">No products added yet. Click "Add Product" to get started.</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Save Button */}
              <div className="mt-8 flex justify-end">
                <button
                  onClick={handleSmallProductSliderSave}
                  disabled={savingSmallProductSlider}
                  className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {savingSmallProductSlider ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      Save Small Product Slider Config
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Social Network Slider Tab */}
        {activeTab === 'social-network-slider' && (
          <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
            <div className="border-b border-gray-200 px-6 py-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">Social Network Slider Configuration</h2>
                <select
                  value={selectedSocialNetworkSliderId}
                  onChange={(e) => {
                    if (e.target.value === 'new') {
                      setSocialNetworkSliderConfig({
                        id: '',
                        headline: '',
                        posts: [],
                        display_order: 0,
                        is_active: true,
                        autoplay: false,
                        scroll_speed: 5,
                      });
                      setSelectedSocialNetworkSliderId('new');
                    } else {
                      const selected = socialNetworkSliderConfigs.find((c) => c.id === e.target.value);
                      if (selected) {
                        setSocialNetworkSliderConfig(selected);
                        setSelectedSocialNetworkSliderId(selected.id);
                      }
                    }
                  }}
                  className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  {socialNetworkSliderConfigs.map((config) => (
                    <option key={config.id} value={config.id}>
                      {config.headline || `Slider ${config.display_order}`} (Order: {config.display_order})
                    </option>
                  ))}
                  <option value="new">+ Create New Slider</option>
                </select>
              </div>
            </div>

            <div className="p-6">
              <div className="space-y-6">
                {/* Basic Settings */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Basic Settings</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Headline</label>
                      <input
                        type="text"
                        value={socialNetworkSliderConfig.headline || ''}
                        onChange={(e) => setSocialNetworkSliderConfig((prev) => ({ ...prev, headline: e.target.value }))}
                        className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        placeholder="Social Network Posts"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Display Order</label>
                      <input
                        type="number"
                        value={socialNetworkSliderConfig.display_order}
                        onChange={(e) => setSocialNetworkSliderConfig((prev) => ({ ...prev, display_order: parseInt(e.target.value) || 0 }))}
                        className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      />
                    </div>
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        id="social-slider-active"
                        checked={socialNetworkSliderConfig.is_active}
                        onChange={(e) => setSocialNetworkSliderConfig((prev) => ({ ...prev, is_active: e.target.checked }))}
                        className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <label htmlFor="social-slider-active" className="text-sm font-medium text-gray-700">
                        Active
                      </label>
                    </div>
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        id="social-slider-autoplay"
                        checked={socialNetworkSliderConfig.autoplay || false}
                        onChange={(e) => setSocialNetworkSliderConfig((prev) => ({ ...prev, autoplay: e.target.checked }))}
                        className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <label htmlFor="social-slider-autoplay" className="text-sm font-medium text-gray-700">
                        Autoplay Videos
                      </label>
                    </div>
                    {socialNetworkSliderConfig.autoplay && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Scroll Speed (seconds)</label>
                        <input
                          type="number"
                          value={socialNetworkSliderConfig.scroll_speed || 5}
                          onChange={(e) => setSocialNetworkSliderConfig((prev) => ({ ...prev, scroll_speed: parseInt(e.target.value) || 5 }))}
                          className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                          min="1"
                        />
                      </div>
                    )}
                  </div>
                </div>

                {/* Posts */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">Posts</h3>
                    <button
                      onClick={addSocialNetworkPost}
                      className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                      Add Post
                    </button>
                  </div>
                  <div className="space-y-4">
                    {socialNetworkSliderConfig.posts.map((post, index) => (
                      <div key={index} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-4">
                          <h4 className="text-sm font-semibold text-gray-900">Post {index + 1}</h4>
                          <button
                            onClick={() => removeSocialNetworkPost(index)}
                            className="text-red-600 hover:text-red-800 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Media URL</label>
                            <input
                              type="text"
                              value={post.media_url}
                              onChange={(e) => updateSocialNetworkPost(index, 'media_url', e.target.value)}
                              className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                              placeholder="https://example.com/image.jpg or video.mp4"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Media Type</label>
                            <select
                              value={post.media_type}
                              onChange={(e) => updateSocialNetworkPost(index, 'media_type', e.target.value)}
                              className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                            >
                              <option value="image">Image</option>
                              <option value="video">Video</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Product Title</label>
                            <input
                              type="text"
                              value={post.product_title}
                              onChange={(e) => updateSocialNetworkPost(index, 'product_title', e.target.value)}
                              className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                              placeholder="Product name"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Product Price</label>
                            <input
                              type="text"
                              value={post.product_price}
                              onChange={(e) => updateSocialNetworkPost(index, 'product_price', e.target.value)}
                              className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                              placeholder="$13.98"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Product Link</label>
                            <input
                              type="text"
                              value={post.product_link || ''}
                              onChange={(e) => updateSocialNetworkPost(index, 'product_link', e.target.value)}
                              className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                              placeholder="/products/123"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Social Handle</label>
                            <input
                              type="text"
                              value={post.social_handle}
                              onChange={(e) => updateSocialNetworkPost(index, 'social_handle', e.target.value)}
                              className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                              placeholder="@username"
                            />
                          </div>
                          <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Caption</label>
                            <textarea
                              value={post.caption || ''}
                              onChange={(e) => updateSocialNetworkPost(index, 'caption', e.target.value)}
                              className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                              placeholder="Post caption or description"
                              rows={2}
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Tag Position X (%)</label>
                            <input
                              type="number"
                              value={post.tag_position_x || 50}
                              onChange={(e) => updateSocialNetworkPost(index, 'tag_position_x', parseFloat(e.target.value) || 50)}
                              className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                              min="0"
                              max="100"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Tag Position Y (%)</label>
                            <input
                              type="number"
                              value={post.tag_position_y || 30}
                              onChange={(e) => updateSocialNetworkPost(index, 'tag_position_y', parseFloat(e.target.value) || 30)}
                              className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                              min="0"
                              max="100"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                    {socialNetworkSliderConfig.posts.length === 0 && (
                      <p className="text-sm text-gray-500 text-center py-8">No posts added yet. Click "Add Post" to get started.</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Save Button */}
              <div className="mt-8 flex justify-end">
                <button
                  onClick={handleSocialNetworkSliderSave}
                  disabled={savingSocialNetworkSlider}
                  className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {savingSocialNetworkSlider ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      Save Social Network Slider Config
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Viral Slider Tab */}
        {activeTab === 'viral-slider' && (
          <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
            <div className="border-b border-gray-200 px-6 py-4">
              <h2 className="text-xl font-semibold text-gray-900">Viral Slider Configuration</h2>
            </div>

            <div className="p-6">
              <div className="space-y-6">
                {/* Basic Settings */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Basic Settings</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Headline</label>
                      <input
                        type="text"
                        value={viralSliderConfig.headline || ''}
                        onChange={(e) => setViralSliderConfig((prev) => ({ ...prev, headline: e.target.value }))}
                        className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        placeholder="Viral Videos"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Display Order</label>
                      <input
                        type="number"
                        value={viralSliderConfig.display_order}
                        onChange={(e) => setViralSliderConfig((prev) => ({ ...prev, display_order: parseInt(e.target.value) || 0 }))}
                        className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      />
                    </div>
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        id="viral-slider-active"
                        checked={viralSliderConfig.is_active}
                        onChange={(e) => setViralSliderConfig((prev) => ({ ...prev, is_active: e.target.checked }))}
                        className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <label htmlFor="viral-slider-active" className="text-sm font-medium text-gray-700">
                        Active
                      </label>
                    </div>
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        id="viral-slider-autoplay"
                        checked={viralSliderConfig.autoplay || false}
                        onChange={(e) => setViralSliderConfig((prev) => ({ ...prev, autoplay: e.target.checked }))}
                        className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <label htmlFor="viral-slider-autoplay" className="text-sm font-medium text-gray-700">
                        Autoplay Videos
                      </label>
                    </div>
                    {viralSliderConfig.autoplay && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Scroll Speed (seconds)</label>
                        <input
                          type="number"
                          value={viralSliderConfig.scroll_speed || 5}
                          onChange={(e) => setViralSliderConfig((prev) => ({ ...prev, scroll_speed: parseInt(e.target.value) || 5 }))}
                          className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                          min="1"
                        />
                      </div>
                    )}
                  </div>
                </div>

                {/* Videos */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">Videos</h3>
                    <button
                      onClick={addViralSliderVideo}
                      className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                      Add Video
                    </button>
                  </div>
                  <div className="space-y-4">
                    {viralSliderConfig.videos.map((video, index) => (
                      <div key={index} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-4">
                          <h4 className="text-sm font-semibold text-gray-900">Video {index + 1}</h4>
                          <button
                            onClick={() => removeViralSliderVideo(index)}
                            className="text-red-600 hover:text-red-800 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Video URL</label>
                            <input
                              type="text"
                              value={video.video_url}
                              onChange={(e) => updateViralSliderVideo(index, 'video_url', e.target.value)}
                              className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                              placeholder="TikTok, Instagram Reel, or custom video URL"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Social Handle</label>
                            <input
                              type="text"
                              value={video.social_handle}
                              onChange={(e) => updateViralSliderVideo(index, 'social_handle', e.target.value)}
                              className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                              placeholder="@username"
                            />
                          </div>
                          <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Caption</label>
                            <textarea
                              value={video.caption || ''}
                              onChange={(e) => updateViralSliderVideo(index, 'caption', e.target.value)}
                              className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                              placeholder="Video caption or description"
                              rows={2}
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Product Title</label>
                            <input
                              type="text"
                              value={video.product_title}
                              onChange={(e) => updateViralSliderVideo(index, 'product_title', e.target.value)}
                              className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                              placeholder="Product name"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Product Price</label>
                            <input
                              type="text"
                              value={video.product_price}
                              onChange={(e) => updateViralSliderVideo(index, 'product_price', e.target.value)}
                              className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                              placeholder="$14.98"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Product Thumbnail URL</label>
                            <input
                              type="text"
                              value={video.product_thumbnail}
                              onChange={(e) => updateViralSliderVideo(index, 'product_thumbnail', e.target.value)}
                              className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                              placeholder="https://example.com/thumbnail.jpg"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Product Link</label>
                            <input
                              type="text"
                              value={video.product_link || ''}
                              onChange={(e) => updateViralSliderVideo(index, 'product_link', e.target.value)}
                              className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                              placeholder="/products/123"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                    {viralSliderConfig.videos.length === 0 && (
                      <p className="text-sm text-gray-500 text-center py-8">No videos added yet. Click "Add Video" to get started.</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Save Button */}
              <div className="mt-8 flex justify-end">
                <button
                  onClick={handleViralSliderSave}
                  disabled={savingViralSlider}
                  className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {savingViralSlider ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      Save Viral Slider Config
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
