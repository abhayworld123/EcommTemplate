'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { ShoppingCart, Menu, X, User, LogOut } from 'lucide-react';
import { SiteConfig } from '@/types';

export default function Navbar() {
  const { totalItems, openCart } = useCart();
  const { user, isAdmin, signOut, loading: authLoading } = useAuth();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [siteConfig, setSiteConfig] = useState<SiteConfig | null>(null);

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
        // Fallback if API fails
        setSiteConfig({
          id: '1',
          site_name: 'Ecommerce Store',
          banner_image: '',
          description: '',
        });
      });
  }, []);

  const siteName = siteConfig?.site_name || 'Ecommerce Store';

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-white/80 backdrop-blur-md shadow-lg border-b border-gray-200/50'
          : 'bg-white border-b border-gray-200'
      }`}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-20 items-center justify-between">
          <Link
            href="/"
            className="text-2xl font-display font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent transition-transform hover:scale-105"
            style={{ fontFamily: 'var(--font-playfair)' }}
          >
            {siteName}
          </Link>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            <Link
              href="/products"
              className="text-gray-700 hover:text-blue-600 font-medium transition-colors duration-200 relative group"
            >
              Products
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-600 transition-all duration-300 group-hover:w-full"></span>
            </Link>
            <button
              onClick={openCart}
              className="relative text-gray-700 hover:text-blue-600 transition-colors duration-200 flex items-center gap-2"
            >
              <ShoppingCart className="w-5 h-5" />
              <span className="font-medium">Cart</span>
              {totalItems > 0 && (
                <span className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-gradient-to-r from-blue-600 to-purple-600 text-xs font-bold text-white shadow-lg animate-pulse">
                  {totalItems}
                </span>
              )}
            </button>
            
            {!authLoading && (
              <>
                {user ? (
                  <>
                    {isAdmin && (
                      <Link
                        href="/admin"
                        className="text-gray-700 hover:text-blue-600 font-medium transition-colors duration-200 relative group"
                      >
                        Admin
                        <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-600 transition-all duration-300 group-hover:w-full"></span>
                      </Link>
                    )}
                    <Link
                      href="/profile"
                      className="text-gray-700 hover:text-blue-600 font-medium transition-colors duration-200 flex items-center gap-2"
                    >
                      <User className="w-5 h-5" />
                      <span>{user.name || user.email}</span>
                    </Link>
                    <button
                      onClick={signOut}
                      className="text-gray-700 hover:text-blue-600 font-medium transition-colors duration-200 flex items-center gap-2"
                    >
                      <LogOut className="w-5 h-5" />
                      <span>Logout</span>
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      href="/login"
                      className="text-gray-700 hover:text-blue-600 font-medium transition-colors duration-200"
                    >
                      Login
                    </Link>
                    <Link
                      href="/register"
                      className="rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 px-4 py-2 text-sm font-medium text-white hover:shadow-lg transition-all"
                    >
                      Sign Up
                    </Link>
                  </>
                )}
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 text-gray-700 hover:text-blue-600 transition-colors"
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden pb-4 animate-slide-in">
            <div className="flex flex-col gap-4 pt-4 border-t border-gray-200">
              <Link
                href="/products"
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-gray-700 hover:text-blue-600 font-medium transition-colors"
              >
                Products
              </Link>
              <button
                onClick={() => {
                  openCart();
                  setIsMobileMenuOpen(false);
                }}
                className="text-gray-700 hover:text-blue-600 font-medium transition-colors flex items-center gap-2"
              >
                <ShoppingCart className="w-5 h-5" />
                Cart {totalItems > 0 && `(${totalItems})`}
              </button>
              
              {!authLoading && (
                <>
                  {user ? (
                    <>
                      {isAdmin && (
                        <Link
                          href="/admin"
                          onClick={() => setIsMobileMenuOpen(false)}
                          className="text-gray-700 hover:text-blue-600 font-medium transition-colors"
                        >
                          Admin
                        </Link>
                      )}
                      <Link
                        href="/profile"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="text-gray-700 hover:text-blue-600 font-medium transition-colors flex items-center gap-2"
                      >
                        <User className="w-5 h-5" />
                        {user.name || user.email}
                      </Link>
                      <button
                        onClick={() => {
                          signOut();
                          setIsMobileMenuOpen(false);
                        }}
                        className="text-gray-700 hover:text-blue-600 font-medium transition-colors flex items-center gap-2"
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
                        className="text-gray-700 hover:text-blue-600 font-medium transition-colors"
                      >
                        Login
                      </Link>
                      <Link
                        href="/register"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="text-gray-700 hover:text-blue-600 font-medium transition-colors"
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
    </nav>
  );
}

