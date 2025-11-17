import Link from 'next/link';
import { createServerClient } from '@/lib/supabase-server';
import { formatPrice, formatDate } from '@/lib/utils';

async function getOrder(sessionId: string) {
  const supabase = await createServerClient();
  const { data } = await supabase
    .from('orders')
    .select('*, order_items(*, products(*))')
    .eq('stripe_session_id', sessionId)
    .single();
  
  return data;
}

export default async function SuccessPage({
  searchParams,
}: {
  searchParams: { session_id?: string };
}) {
  if (!searchParams.session_id) {
    return (
      <div className="min-h-screen bg-gray-50 pt-32 pb-12 text-center">
        <h1 className="text-2xl font-bold text-gray-900">Invalid order</h1>
        <Link href="/" className="mt-4 text-blue-600 hover:underline">
          Return to home
        </Link>
      </div>
    );
  }

  const order = await getOrder(searchParams.session_id);

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50 pt-32 pb-12 text-center">
        <h1 className="text-2xl font-bold text-gray-900">Order not found</h1>
        <Link href="/" className="mt-4 text-blue-600 hover:underline">
          Return to home
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-32 pb-12">
      <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8">
        <div className="rounded-lg border border-gray-200 bg-white p-8 text-center">
          <div className="mb-4 text-6xl">✓</div>
          <h1 className="mb-2 text-3xl font-bold text-gray-900">
            Order Confirmed!
          </h1>
          <p className="mb-8 text-gray-600">
            Thank you for your purchase. Your order has been received.
          </p>
          <div className="mb-8 text-left">
            <div className="mb-4">
              <p className="text-sm text-gray-600">Order ID</p>
              <p className="font-semibold">{order.id}</p>
            </div>
            <div className="mb-4">
              <p className="text-sm text-gray-600">Date</p>
              <p className="font-semibold">{formatDate(order.created_at)}</p>
            </div>
            <div className="mb-4">
              <p className="text-sm text-gray-600">Email</p>
              <p className="font-semibold">{order.email}</p>
            </div>
            <div className="mb-4">
              <p className="text-sm text-gray-600">Total</p>
              <p className="text-xl font-bold">{formatPrice(order.total)}</p>
            </div>
            {order.order_items && order.order_items.length > 0 && (
              <div className="mt-6 border-t border-gray-200 pt-4">
                <p className="mb-2 text-sm font-semibold text-gray-600">Items:</p>
                {order.order_items.map((item: any) => (
                  <div key={item.id} className="mb-2 flex justify-between">
                    <span>
                      {item.products?.name || 'Product'} × {item.quantity}
                    </span>
                    <span>{formatPrice(item.price * item.quantity)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
          <Link
            href="/products"
            className="inline-block rounded-md bg-blue-600 px-6 py-3 font-medium text-white transition-colors hover:bg-blue-700"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
}

