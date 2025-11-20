import Link from 'next/link';
import { createServerClient } from '@/lib/supabase-server';
import { formatPrice, formatDate } from '@/lib/utils';
import { getStripe } from '@/lib/stripe';

async function getOrder(sessionId: string) {
  const supabase = await createServerClient();
  const { data, error } = await supabase
    .from('orders')
    .select('*, order_items(*, products(*))')
    .eq('stripe_session_id', sessionId)
    .single();
  
  if (error) {
    console.error('Error fetching order:', error);
    return null;
  }
  
  return data;
}

async function verifyStripeSession(sessionId: string) {
  try {
    const stripe = getStripe();
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    return session;
  } catch (error) {
    console.error('Error verifying Stripe session:', error);
    return null;
  }
}

export default async function SuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string }>;
}) {
  const params = await searchParams;
  const sessionId = params?.session_id;

  if (!sessionId) {
    return (
      <div className="min-h-screen bg-gray-50 pt-32 pb-12 text-center">
        <h1 className="text-2xl font-bold text-gray-900">Invalid order</h1>
        <p className="mt-2 text-gray-600">No session ID provided.</p>
        <Link href="/" className="mt-4 text-blue-600 hover:underline">
          Return to home
        </Link>
      </div>
    );
  }

  // Verify the Stripe session first
  const stripeSession = await verifyStripeSession(sessionId);
  
  if (!stripeSession) {
    return (
      <div className="min-h-screen bg-gray-50 pt-32 pb-12 text-center">
        <h1 className="text-2xl font-bold text-gray-900">Invalid session</h1>
        <p className="mt-2 text-gray-600">Unable to verify payment session.</p>
        <Link href="/" className="mt-4 text-blue-600 hover:underline">
          Return to home
        </Link>
      </div>
    );
  }

  // Check if payment was successful
  if (stripeSession.payment_status !== 'paid') {
    return (
      <div className="min-h-screen bg-gray-50 pt-32 pb-12 text-center">
        <h1 className="text-2xl font-bold text-gray-900">Payment not completed</h1>
        <p className="mt-2 text-gray-600">Your payment status is: {stripeSession.payment_status}</p>
        <Link href="/checkout" className="mt-4 text-blue-600 hover:underline">
          Return to checkout
        </Link>
      </div>
    );
  }

  // Try to get order from database
  let order = await getOrder(sessionId);

  // If order not found but payment is successful, update/create it
  if (!order && stripeSession.payment_status === 'paid') {
    const supabase = await createServerClient();
    
    // Try to find or create order
    const { data: existingOrder } = await supabase
      .from('orders')
      .select('*, order_items(*, products(*))')
      .eq('stripe_session_id', sessionId)
      .single();
    
    if (existingOrder) {
      order = existingOrder;
    } else {
      // Order might not exist yet, show success but note it
      return (
        <div className="min-h-screen bg-gray-50 pt-32 pb-12">
          <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8">
            <div className="rounded-lg border border-gray-200 bg-white p-8 text-center">
              <div className="mb-4 text-6xl">✓</div>
              <h1 className="mb-2 text-3xl font-bold text-gray-900">
                Payment Successful!
              </h1>
              <p className="mb-8 text-gray-600">
                Your payment has been processed successfully. Your order is being processed.
              </p>
              <p className="mb-4 text-sm text-gray-500">
                Session ID: {sessionId}
              </p>
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
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50 pt-32 pb-12 text-center">
        <h1 className="text-2xl font-bold text-gray-900">Order not found</h1>
        <p className="mt-2 text-gray-600">Payment was successful but order details could not be retrieved.</p>
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

