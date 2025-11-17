import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase-server';
import { requireAdmin } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    await requireAdmin();
  } catch (error) {
    return NextResponse.json(
      { error: 'Unauthorized: Admin access required' },
      { status: 403 }
    );
  }
  
  const supabase = await createServerClient();
  
  const { data: orders, error: ordersError } = await supabase
    .from('orders')
    .select('*, order_items(*)')
    .order('created_at', { ascending: false });

  if (ordersError) {
    return NextResponse.json({ error: ordersError.message }, { status: 500 });
  }

  const { data: products } = await supabase.from('products').select('*');
  const { data: stats } = await supabase
    .from('orders')
    .select('total, status');

  const totalRevenue = stats?.reduce((sum, o) => sum + (o.total || 0), 0) || 0;
  const totalOrders = orders?.length || 0;
  const totalProducts = products?.length || 0;

  return NextResponse.json({
    orders,
    stats: {
      totalRevenue,
      totalOrders,
      totalProducts,
    },
  });
}

