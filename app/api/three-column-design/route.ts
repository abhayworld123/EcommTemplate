import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase-server';
import { requireAdmin } from '@/lib/auth';

export async function GET(request: NextRequest) {
  const supabase = await createServerClient();
  const { searchParams } = new URL(request.url);
  const includeInactive = searchParams.get('include_inactive') === 'true';
  
  let query = supabase
    .from('three_column_design_config')
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
      column1_title: body.column1_title,
      column1_items: Array.isArray(body.column1_items) ? body.column1_items : [],
      column2_title: body.column2_title,
      column2_items: Array.isArray(body.column2_items) ? body.column2_items : [],
      column3_headline: body.column3_headline,
      column3_subheadline: body.column3_subheadline || null,
      column3_cta_text: body.column3_cta_text || 'Shop Now',
      column3_cta_link: body.column3_cta_link || '/products',
      column3_image_url: body.column3_image_url || null,
      display_order: body.display_order || 0,
      is_active: body.is_active !== undefined ? (body.is_active === true || body.is_active === 'true' || body.is_active === 1) : true,
      updated_at: new Date().toISOString(),
    };
    
    const { data, error } = await supabase
      .from('three_column_design_config')
      .insert(config)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create three column design config' },
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
    
    if (body.column1_title !== undefined) config.column1_title = body.column1_title;
    if (body.column1_items !== undefined) config.column1_items = Array.isArray(body.column1_items) ? body.column1_items : [];
    if (body.column2_title !== undefined) config.column2_title = body.column2_title;
    if (body.column2_items !== undefined) config.column2_items = Array.isArray(body.column2_items) ? body.column2_items : [];
    if (body.column3_headline !== undefined) config.column3_headline = body.column3_headline;
    if (body.column3_subheadline !== undefined) config.column3_subheadline = body.column3_subheadline;
    if (body.column3_cta_text !== undefined) config.column3_cta_text = body.column3_cta_text;
    if (body.column3_cta_link !== undefined) config.column3_cta_link = body.column3_cta_link;
    if (body.column3_image_url !== undefined) config.column3_image_url = body.column3_image_url;
    if (body.display_order !== undefined) config.display_order = body.display_order;
    if (body.is_active !== undefined) config.is_active = body.is_active === true || body.is_active === 'true' || body.is_active === 1;
    
    const { data, error } = await supabase
      .from('three_column_design_config')
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
      { error: error instanceof Error ? error.message : 'Failed to update three column design config' },
      { status: error instanceof Error && error.message.includes('Unauthorized') ? 403 : 500 }
    );
  }
}

