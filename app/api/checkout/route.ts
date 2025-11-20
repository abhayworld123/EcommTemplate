import { NextRequest, NextResponse } from 'next/server';
import { getStripe } from '@/lib/stripe';
import { createServerClient } from '@/lib/supabase-server';
import { getCurrentUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { items, customer } = body;

    if (!items || items.length === 0) {
      return NextResponse.json({ error: 'No items in cart' }, { status: 400 });
    }

    // Check if Stripe is configured
    let stripe;
    try {
      stripe = getStripe();
    } catch (error) {
      console.error('Stripe configuration error:', error);
      return NextResponse.json(
        { error: 'Payment processing is not configured. Please contact support.' },
        { status: 500 }
      );
    }

    const supabase = await createServerClient();
    const user = await getCurrentUser(); // Get authenticated user if available

    // Fetch product names for better Stripe display
    const productIds = items.map((item: any) => item.product_id);
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('id, name')
      .in('id', productIds);

    if (productsError) {
      console.error('Error fetching products:', productsError);
      return NextResponse.json(
        { error: 'Failed to fetch product information' },
        { status: 500 }
      );
    }

    const productMap = new Map(
      (products || []).map((p: any) => [p.id, p.name])
    );

    // Calculate total
    const total = items.reduce(
      (sum: number, item: any) => sum + item.price * item.quantity,
      0
    );

    // Create Stripe checkout session
    let session;
    try {
      session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: items.map((item: any) => ({
          price_data: {
            currency: 'usd',
            product_data: {
              name: productMap.get(item.product_id) || `Product ${item.product_id}`,
            },
            unit_amount: Math.round(item.price * 100),
          },
          quantity: item.quantity,
        })),
        mode: 'payment',
        success_url: `${request.nextUrl.origin}/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${request.nextUrl.origin}/checkout`,
        customer_email: customer.email,
      });
    } catch (stripeError: any) {
      console.error('Stripe session creation error:', stripeError);
      return NextResponse.json(
        { error: stripeError?.message || 'Failed to create payment session' },
        { status: 500 }
      );
    }

    // Create order in database (link to user if authenticated)  
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        user_id: user?.id || null, // Link to authenticated user if available
        email: customer.email,
        total,
        status: 'pending',
        stripe_session_id: session.id,
      })
      .select()
      .single();

    if (orderError || !order) {
      console.error('Order creation error:', orderError);
      return NextResponse.json(
        { error: 'Failed to create order' },
        { status: 500 }
      );
    }

    // Create order items
    const orderItems = items.map((item: any) => ({
      order_id: order.id,
      product_id: item.product_id,
      quantity: item.quantity,
      price: item.price,
    }));

    const { error: itemsError } = await supabase.from('order_items').insert(orderItems);
    
    if (itemsError) {
      console.error('Order items creation error:', itemsError);
    }

    return NextResponse.json({ 
      sessionId: session.id,
      url: session.url 
    });
  } catch (error: any) {
    console.error('Checkout error:', error);
    const errorMessage = error?.message || 'Failed to process checkout';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}

