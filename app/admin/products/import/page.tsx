'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { parseExcelFile } from '@/lib/excelParser';

export default function ExcelImportPage() {
  const router = useRouter();
  const { user, isAdmin, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [clientSideMode, setClientSideMode] = useState(true);

  // Redirect if not admin
  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.push('/login?redirect=/admin/products/import');
      } else if (!isAdmin) {
        router.push('/');
      }
    }
  }, [user, isAdmin, authLoading, router]);

  const handleClientSideImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    setMessage(null);

    try {
      const rows = await parseExcelFile(file);
      
      const response = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(rows.map((row) => ({
          name: row.name,
          description: row.description,
          price: row.price,
          image_url: row.image_url,
          category: row.category,
          stock: row.stock,
          featured: row.featured || false,
        }))),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to import products');
      }

      const data = await response.json();
      setMessage({
        type: 'success',
        text: `Successfully imported ${Array.isArray(data) ? data.length : 1} products!`,
      });
    } catch (error) {
      console.error('Import error:', error);
      setMessage({
        type: 'error',
        text: (error as Error).message || 'Failed to import products. Please check the file format.',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleServerSideImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    setMessage(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/admin/import', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to import products');
      }

      const data = await response.json();
      setMessage({
        type: 'success',
        text: `Successfully imported ${data.count} products!`,
      });
    } catch (error) {
      console.error('Import error:', error);
      setMessage({
        type: 'error',
        text: (error as Error).message || 'Failed to import products. Please check the file format.',
      });
    } finally {
      setLoading(false);
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
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">Import Products</h1>
          <Link
            href="/admin/products"
            className="rounded-md border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-50"
          >
            Back to Products
          </Link>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-8">
          <div className="mb-6">
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Import Method
            </label>
            <div className="flex gap-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  checked={clientSideMode}
                  onChange={() => setClientSideMode(true)}
                  className="mr-2"
                />
                Client-side (parse in browser)
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  checked={!clientSideMode}
                  onChange={() => setClientSideMode(false)}
                  className="mr-2"
                />
                Server-side (upload file)
              </label>
            </div>
          </div>

          <div className="mb-6">
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Excel File (.xlsx or .csv)
            </label>
            <input
              type="file"
              accept=".xlsx,.xls,.csv"
              onChange={clientSideMode ? handleClientSideImport : handleServerSideImport}
              disabled={loading}
              className="block w-full text-sm text-gray-500 file:mr-4 file:rounded-md file:border-0 file:bg-blue-50 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-blue-700 hover:file:bg-blue-100"
            />
          </div>

          <div className="mb-6 rounded-md bg-gray-50 p-4">
            <p className="mb-2 text-sm font-semibold text-gray-700">
              Expected Excel Format:
            </p>
            <div className="overflow-x-auto">
              <table className="min-w-full text-xs">
                <thead>
                  <tr className="bg-gray-200">
                    <th className="px-2 py-1">name</th>
                    <th className="px-2 py-1">description</th>
                    <th className="px-2 py-1">price</th>
                    <th className="px-2 py-1">image_url</th>
                    <th className="px-2 py-1">category</th>
                    <th className="px-2 py-1">stock</th>
                    <th className="px-2 py-1">featured</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="px-2 py-1">Watch Model X</td>
                    <td className="px-2 py-1">Premium watch...</td>
                    <td className="px-2 py-1">299.99</td>
                    <td className="px-2 py-1">/images/watch1.jpg</td>
                    <td className="px-2 py-1">Men</td>
                    <td className="px-2 py-1">50</td>
                    <td className="px-2 py-1">true</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {message && (
            <div
              className={`rounded-md p-4 ${
                message.type === 'success'
                  ? 'bg-green-50 text-green-800'
                  : 'bg-red-50 text-red-800'
              }`}
            >
              {message.text}
            </div>
          )}

          {loading && (
            <div className="mt-4 text-center text-gray-600">Processing...</div>
          )}
        </div>
      </div>
    </div>
  );
}

