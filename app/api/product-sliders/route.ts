import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase-server';
import { requireAdmin } from '@/lib/auth';

export async function GET(request: NextRequest) {
  const supabase = await createServerClient();
  const { data, error } = await supabase
    .from('product_sliders_config')
    .select('*')
    .eq('is_active', true)
    .order('display_order', { ascending: true });

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
      title: body.title,
      type: body.type || 'all',
      category: body.category || null,
      limit_count: body.limit_count || body.limit || 10,
      display_order: body.display_order || 0,
      show_title: body.show_title !== undefined ? (body.show_title === true || body.show_title === 'true' || body.show_title === 1) : true,
      auto_scroll: body.auto_scroll === true || body.auto_scroll === 'true' || body.auto_scroll === 1,
      scroll_speed: body.scroll_speed || 5,
      is_active: body.is_active !== undefined ? (body.is_active === true || body.is_active === 'true' || body.is_active === 1) : true,
      updated_at: new Date().toISOString(),
    };
    
    const { data, error } = await supabase
      .from('product_sliders_config')
      .insert(config)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create product slider config' },
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
    
    if (body.title !== undefined) config.title = body.title;
    if (body.type !== undefined) config.type = body.type;
    if (body.category !== undefined) config.category = body.category;
    if (body.limit_count !== undefined || body.limit !== undefined) config.limit_count = body.limit_count || body.limit;
    if (body.display_order !== undefined) config.display_order = body.display_order;
    if (body.show_title !== undefined) config.show_title = body.show_title === true || body.show_title === 'true' || body.show_title === 1;
    if (body.auto_scroll !== undefined) config.auto_scroll = body.auto_scroll === true || body.auto_scroll === 'true' || body.auto_scroll === 1;
    if (body.scroll_speed !== undefined) config.scroll_speed = body.scroll_speed;
    if (body.is_active !== undefined) config.is_active = body.is_active === true || body.is_active === 'true' || body.is_active === 1;
    
    const { data, error } = await supabase
      .from('product_sliders_config')
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
      { error: error instanceof Error ? error.message : 'Failed to update product slider config' },
      { status: error instanceof Error && error.message.includes('Unauthorized') ? 403 : 500 }
    );
  }
}

