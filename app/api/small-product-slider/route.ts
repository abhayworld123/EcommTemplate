import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase-server';
import { requireAdmin } from '@/lib/auth';

export async function GET(request: NextRequest) {
  const supabase = await createServerClient();
  const { searchParams } = new URL(request.url);
  const includeInactive = searchParams.get('include_inactive') === 'true';
  
  let query = supabase
    .from('small_product_slider_config')
    .select('*');
  
  if (!includeInactive) {
    query = query.eq('is_active', true);
  }
  
  const { data, error } = await query.order('display_order', { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data || [], {
    headers: {
      'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
    },
  });
}

export async function POST(request: NextRequest) {
  try {
    await requireAdmin();
    
    const body = await request.json();
    const supabase = await createServerClient();
    
    const config = {
      headline: body.headline,
      products: body.products || [],
      display_order: body.display_order || 0,
      is_active: body.is_active !== undefined ? (body.is_active === true || body.is_active === 'true' || body.is_active === 1) : true,
      autoplay: body.autoplay !== undefined ? (body.autoplay === true || body.autoplay === 'true' || body.autoplay === 1) : false,
      scroll_speed: body.scroll_speed || 5,
      updated_at: new Date().toISOString(),
    };
    
    const { data, error } = await supabase
      .from('small_product_slider_config')
      .insert(config)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create small product slider config' },
      { status: error instanceof Error && error.message.includes('Unauthorized') ? 403 : 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    await requireAdmin();
    
    const body = await request.json();
    const supabase = await createServerClient();
    
    if (!body.id) {
      return NextResponse.json({ error: 'id is required' }, { status: 400 });
    }
    
    const config: any = {
      updated_at: new Date().toISOString(),
    };
    
    if (body.headline !== undefined) config.headline = body.headline;
    if (body.products !== undefined) config.products = body.products;
    if (body.display_order !== undefined) config.display_order = body.display_order;
    if (body.is_active !== undefined) config.is_active = body.is_active === true || body.is_active === 'true' || body.is_active === 1;
    if (body.autoplay !== undefined) config.autoplay = body.autoplay === true || body.autoplay === 'true' || body.autoplay === 1;
    if (body.scroll_speed !== undefined) config.scroll_speed = body.scroll_speed;
    
    const { data, error } = await supabase
      .from('small_product_slider_config')
      .update(config)
      .eq('id', body.id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to update small product slider config' },
      { status: error instanceof Error && error.message.includes('Unauthorized') ? 403 : 500 }
    );
  }
}

