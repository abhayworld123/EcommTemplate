'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { ShoppingCart, Menu, X, User, LogOut, Search } from 'lucide-react';
import { SiteConfig, HeaderConfig } from '@/types';
import SearchModal from './SearchModal';

export default function Navbar() {
  const { totalItems, openCart } = useCart();
  const { user, isAdmin, signOut, loading: authLoading } = useAuth();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [siteConfig, setSiteConfig] = useState<SiteConfig | null>(null);
  const [headerConfig, setHeaderConfig] = useState<HeaderConfig | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    // Fetch site config
    fetch('/api/site-config')
      .then((res) => res.json())
      .then((data) => setSiteConfig(data))
      .catch(() => {
        setSiteConfig({
          id: '1',
          site_name: 'Ecommerce Store',
          banner_image: '',
          description: '',
        });
      });

    // Fetch header config
    fetch('/api/header-config')
      .then((res) => res.json())
      .then((data) => setHeaderConfig(data))
      .catch(() => {
        // Fallback default config
        setHeaderConfig({
          id: '1',
          style: 'default',
          background_color: '#ffffff',
          text_color: '#1f2937',
          hover_color: '#2563eb',
          accent_color: '#2563eb',
          sticky: true,
          transparent_on_top: false,
          navigation_items: [],
          show_search: false,
          show_cart: true,
          show_user_menu: true,
          height: '80px',
        });
      });
  }, []);

  // Use default config if not loaded yet
  const config = headerConfig || {
    id: '1',
    style: 'default',
    background_color: '#ffffff',
    text_color: '#1f2937',
    hover_color: '#2563eb',
    accent_color: '#2563eb',
    sticky: true,
    transparent_on_top: false,
    navigation_items: [],
    show_search: false,
    show_cart: true,
    show_user_menu: true,
    height: '80px',
  };

  const siteName = siteConfig?.site_name || config.logo_text || 'Ecommerce Store';
  const heightValue = config.height || '80px';
  const isTransparent = config.transparent_on_top && !isScrolled;
  const bgColor = isTransparent ? 'transparent' : config.background_color;
  const textColor = config.text_color;
  const hoverColor = config.hover_color;
  const accentColor = config.accent_color;

  // Style-specific classes
  const getStyleClasses = () => {
    switch (config.style) {
      case 'centered':
        return 'flex-col';
      case 'minimal':
        return 'minimal-style';
      case 'modern':
        return 'modern-style';
      case 'classic':
        return 'classic-style';
      default:
        return '';
    }
  };

  const renderLogo = () => {
    if (config.logo_url) {
      return (
        <Image
          src={config.logo_url}
          alt={siteName}
          width={120}
          height={40}
          className="h-10 w-auto object-contain"
        />
      );
    }
    return (
      <span
        className="text-2xl font-bold transition-transform hover:scale-105"
        style={{
          fontFamily: 'var(--font-roboto)',
          color: config.style === 'modern' ? accentColor : textColor,
          background: config.style === 'modern' ? `linear-gradient(to right, ${accentColor}, ${hoverColor})` : 'none',
          WebkitBackgroundClip: config.style === 'modern' ? 'text' : 'unset',
          WebkitTextFillColor: config.style === 'modern' ? 'transparent' : 'unset',
        }}
      >
        {siteName}
      </span>
    );
  };

  const renderNavigationItems = () => {
    if (config.navigation_items && config.navigation_items.length > 0) {
      return config.navigation_items.map((item, index) => (
        <Link
          key={index}
          href={item.href}
          className="font-medium transition-colors duration-200 relative group"
          style={{ color: textColor }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = hoverColor;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = textColor;
          }}
        >
          {item.label}
          {config.style !== 'minimal' && (
            <span
              className="absolute bottom-0 left-0 w-0 h-0.5 transition-all duration-300 group-hover:w-full"
              style={{ backgroundColor: hoverColor }}
            />
          )}
        </Link>
      ));
    }
    // Default navigation if none configured
    return (
      <Link
        href="/products"
        className="font-medium transition-colors duration-200 relative group"
        style={{ color: textColor }}
        onMouseEnter={(e) => {
          e.currentTarget.style.color = hoverColor;
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.color = textColor;
        }}
      >
        Products
        {config.style !== 'minimal' && (
          <span
            className="absolute bottom-0 left-0 w-0 h-0.5 transition-all duration-300 group-hover:w-full"
            style={{ backgroundColor: hoverColor }}
          />
        )}
      </Link>
    );
  };

  const navStyle = config.style === 'centered' ? 'md:flex-col md:items-center' : 'items-center justify-between';
  const logoStyle = config.style === 'centered' ? 'md:mb-4' : '';

  return (
    <nav
      className={`${config.sticky ? 'fixed' : 'relative'} top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled && !isTransparent ? 'shadow-lg' : ''
      }`}
      style={{
        backgroundColor: bgColor,
        borderBottom: isTransparent ? 'none' : `1px solid ${textColor}20`,
      }}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Mobile/Tablet Layout - Logo and Menu Button Row */}
        <div className="flex items-center justify-between h-16 md:hidden">
          <Link href="/" className="flex-shrink-0">
            {config.logo_url ? (
              <Image
                src={config.logo_url}
                alt={siteName}
                width={100}
                height={32}
                className="h-8 w-auto object-contain"
              />
            ) : (
              <span
                className="text-xl font-bold"
                style={{
                  fontFamily: 'var(--font-roboto)',
                  color: textColor,
                }}
              >
                {siteName}
              </span>
            )}
          </Link>
          
          <div className="flex items-center gap-3">
            {config.show_cart && (
              <button
                onClick={openCart}
                className="relative p-2 transition-colors"
                style={{ color: textColor }}
              >
                <ShoppingCart className="w-5 h-5" />
                {totalItems > 0 && (
                  <span
                    className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full text-xs font-bold text-white"
                    style={{ backgroundColor: accentColor }}
                  >
                    {totalItems}
                  </span>
                )}
              </button>
            )}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 transition-colors"
              style={{ color: textColor }}
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Desktop Layout */}
        <div className={`hidden md:flex ${navStyle} ${getStyleClasses()}`} style={{ minHeight: heightValue, height: heightValue }}>
          {/* Logo */}
          <Link href="/" className={logoStyle}>
            {renderLogo()}
          </Link>

          {/* Desktop Navigation */}
          <div className={`flex items-center gap-6 ${config.style === 'centered' ? 'mt-4' : ''}`}>
            {renderNavigationItems()}

            {config.show_search && (
              <button
                onClick={() => setIsSearchOpen(true)}
                className="p-2 transition-colors duration-200"
                style={{ color: textColor }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = hoverColor;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = textColor;
                }}
              >
                <Search className="w-5 h-5" />
              </button>
            )}

            {config.show_cart && (
              <button
                onClick={openCart}
                className="relative transition-colors duration-200 flex items-center gap-2"
                style={{ color: textColor }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = hoverColor;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = textColor;
                }}
              >
                <ShoppingCart className="w-5 h-5" />
                <span className="font-medium">Cart</span>
                {totalItems > 0 && (
                  <span
                    className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full text-xs font-bold text-white shadow-lg animate-pulse"
                    style={{ backgroundColor: accentColor }}
                  >
                    {totalItems}
                  </span>
                )}
              </button>
            )}

            {config.show_user_menu && !authLoading && (
              <>
                {user ? (
                  <>
                    {isAdmin && (
                      <Link
                        href="/admin"
                        className="font-medium transition-colors duration-200 relative group"
                        style={{ color: textColor }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.color = hoverColor;
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.color = textColor;
                        }}
                      >
                        Admin
                        {config.style !== 'minimal' && (
                          <span
                            className="absolute bottom-0 left-0 w-0 h-0.5 transition-all duration-300 group-hover:w-full"
                            style={{ backgroundColor: hoverColor }}
                          />
                        )}
                      </Link>
                    )}
                    <Link
                      href="/profile"
                      className="font-medium transition-colors duration-200 flex items-center gap-2"
                      style={{ color: textColor }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.color = hoverColor;
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.color = textColor;
                      }}
                    >
                      <User className="w-5 h-5" />
                      <span>{user.name || user.email}</span>
                    </Link>
                    <button
                      onClick={signOut}
                      className="font-medium transition-colors duration-200 flex items-center gap-2"
                      style={{ color: textColor }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.color = hoverColor;
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.color = textColor;
                      }}
                    >
                      <LogOut className="w-5 h-5" />
                      <span>Logout</span>
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      href="/login"
                      className="font-medium transition-colors duration-200"
                      style={{ color: textColor }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.color = hoverColor;
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.color = textColor;
                      }}
                    >
                      Login
                    </Link>
                    <Link
                      href="/register"
                      className="rounded-lg px-4 py-2 text-sm font-medium text-white hover:shadow-lg transition-all"
                      style={{ backgroundColor: accentColor }}
                    >
                      Sign Up
                    </Link>
                  </>
                )}
              </>
            )}
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden pb-4 pt-2 animate-slide-in border-t" style={{ borderTopColor: `${textColor}20` }}>
            <div className="flex flex-col gap-3 pt-3">
              {config.show_search && (
                <button
                  onClick={() => {
                    setIsSearchOpen(true);
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-2 px-4 py-2 rounded-lg border text-left mb-2"
                  style={{
                    borderColor: `${textColor}30`,
                    backgroundColor: bgColor === 'transparent' ? 'rgba(255,255,255,0.1)' : bgColor,
                    color: textColor,
                  }}
                >
                  <Search className="w-5 h-5" />
                  <span>Search products...</span>
                </button>
              )}
              {config.navigation_items && config.navigation_items.length > 0
                ? config.navigation_items.map((item, index) => (
                    <Link
                      key={index}
                      href={item.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="py-2 px-2 font-medium transition-colors rounded-lg hover:bg-opacity-10"
                      style={{ 
                        color: textColor,
                        backgroundColor: `${hoverColor}00`,
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = `${hoverColor}15`;
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = `${hoverColor}00`;
                      }}
                    >
                      {item.label}
                    </Link>
                  ))
                : (
                  <Link
                    href="/products"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="py-2 px-2 font-medium transition-colors rounded-lg hover:bg-opacity-10"
                    style={{ 
                      color: textColor,
                      backgroundColor: `${hoverColor}00`,
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = `${hoverColor}15`;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = `${hoverColor}00`;
                    }}
                  >
                    Products
                  </Link>
                )}

              <div className="border-t my-2" style={{ borderTopColor: `${textColor}20` }} />

              {config.show_user_menu && !authLoading && (
                <>
                  {user ? (
                    <>
                      {isAdmin && (
                        <Link
                          href="/admin"
                          onClick={() => setIsMobileMenuOpen(false)}
                          className="py-2 px-2 font-medium transition-colors rounded-lg flex items-center gap-2"
                          style={{ 
                            color: textColor,
                            backgroundColor: `${hoverColor}00`,
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = `${hoverColor}15`;
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = `${hoverColor}00`;
                          }}
                        >
                          Admin
                        </Link>
                      )}
                      <Link
                        href="/profile"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="py-2 px-2 font-medium transition-colors rounded-lg flex items-center gap-2"
                        style={{ 
                          color: textColor,
                          backgroundColor: `${hoverColor}00`,
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = `${hoverColor}15`;
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = `${hoverColor}00`;
                        }}
                      >
                        <User className="w-5 h-5" />
                        <span className="truncate">{user.name || user.email}</span>
                      </Link>
                      <button
                        onClick={() => {
                          signOut();
                          setIsMobileMenuOpen(false);
                        }}
                        className="py-2 px-2 font-medium transition-colors rounded-lg flex items-center gap-2 text-left w-full"
                        style={{ 
                          color: textColor,
                          backgroundColor: `${hoverColor}00`,
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = `${hoverColor}15`;
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = `${hoverColor}00`;
                        }}
                      >
                        <LogOut className="w-5 h-5" />
                        Logout
                      </button>
                    </>
                  ) : (
                    <>
                      <Link
                        href="/login"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="py-2 px-2 font-medium transition-colors rounded-lg text-center"
                        style={{ 
                          color: textColor,
                          backgroundColor: `${hoverColor}00`,
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = `${hoverColor}15`;
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = `${hoverColor}00`;
                        }}
                      >
                        Login
                      </Link>
                      <Link
                        href="/register"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="py-2.5 px-4 font-medium text-white rounded-lg text-center transition-all"
                        style={{ backgroundColor: accentColor }}
                      >
                        Sign Up
                      </Link>
                    </>
                  )}
                </>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Search Modal */}
      {config.show_search && (
        <SearchModal
          isOpen={isSearchOpen}
          onClose={() => setIsSearchOpen(false)}
          textColor={textColor}
          hoverColor={hoverColor}
          accentColor={accentColor}
          backgroundColor={bgColor === 'transparent' ? config.background_color : bgColor}
        />
      )}
    </nav>
  );
}
