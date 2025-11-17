import { createServerClient } from '@/lib/supabase-server';
import ProductDetail from '@/components/ProductDetail';
import { Product } from '@/types';
import { notFound } from 'next/navigation';

async function getProduct(id: string): Promise<Product | null> {
  const supabase = await createServerClient();
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('id', id)
    .single();
  
  if (error || !data) {
    console.error('Error fetching product:', error);
    return null;
  }
  return data as Product;
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const product = await getProduct(id);

  if (!product) {
    notFound();
  }

  return <ProductDetail product={product} />;
}

