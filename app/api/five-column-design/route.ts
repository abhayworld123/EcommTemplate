import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase-server';
import { requireAdmin } from '@/lib/auth';

export async function GET(request: NextRequest) {
  const supabase = await createServerClient();
  const { searchParams } = new URL(request.url);
  const includeInactive = searchParams.get('include_inactive') === 'true';
  
  let query = supabase
    .from('five_column_design_config')
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
      column1_headline: body.column1_headline,
      column1_subheadline: body.column1_subheadline || null,
      column1_cta_text: body.column1_cta_text || 'Shop Now',
      column1_cta_link: body.column1_cta_link || '/products',
      column1_image_url: body.column1_image_url || null,
      column2_title: body.column2_title,
      column2_cta_text: body.column2_cta_text || 'Shop Now',
      column2_cta_link: body.column2_cta_link || '/products',
      column2_image_url: body.column2_image_url || null,
      column3_title: body.column3_title,
      column3_price_text: body.column3_price_text || null,
      column3_cta_text: body.column3_cta_text || 'Shop Now',
      column3_cta_link: body.column3_cta_link || '/products',
      column3_image_url: body.column3_image_url || null,
      column4_title: body.column4_title,
      column4_price_text: body.column4_price_text || null,
      column4_cta_text: body.column4_cta_text || 'Shop Now',
      column4_cta_link: body.column4_cta_link || '/products',
      column4_image_url: body.column4_image_url || null,
      column5_title: body.column5_title,
      column5_price_text: body.column5_price_text || null,
      column5_cta_text: body.column5_cta_text || 'Shop Now',
      column5_cta_link: body.column5_cta_link || '/products',
      column5_image_url: body.column5_image_url || null,
      display_order: body.display_order || 0,
      is_active: body.is_active !== undefined ? (body.is_active === true || body.is_active === 'true' || body.is_active === 1) : true,
      updated_at: new Date().toISOString(),
    };
    
    const { data, error } = await supabase
      .from('five_column_design_config')
      .insert(config)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create five column design config' },
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
    
    if (body.column1_headline !== undefined) config.column1_headline = body.column1_headline;
    if (body.column1_subheadline !== undefined) config.column1_subheadline = body.column1_subheadline;
    if (body.column1_cta_text !== undefined) config.column1_cta_text = body.column1_cta_text;
    if (body.column1_cta_link !== undefined) config.column1_cta_link = body.column1_cta_link;
    if (body.column1_image_url !== undefined) config.column1_image_url = body.column1_image_url;
    if (body.column2_title !== undefined) config.column2_title = body.column2_title;
    if (body.column2_cta_text !== undefined) config.column2_cta_text = body.column2_cta_text;
    if (body.column2_cta_link !== undefined) config.column2_cta_link = body.column2_cta_link;
    if (body.column2_image_url !== undefined) config.column2_image_url = body.column2_image_url;
    if (body.column3_title !== undefined) config.column3_title = body.column3_title;
    if (body.column3_price_text !== undefined) config.column3_price_text = body.column3_price_text;
    if (body.column3_cta_text !== undefined) config.column3_cta_text = body.column3_cta_text;
    if (body.column3_cta_link !== undefined) config.column3_cta_link = body.column3_cta_link;
    if (body.column3_image_url !== undefined) config.column3_image_url = body.column3_image_url;
    if (body.column4_title !== undefined) config.column4_title = body.column4_title;
    if (body.column4_price_text !== undefined) config.column4_price_text = body.column4_price_text;
    if (body.column4_cta_text !== undefined) config.column4_cta_text = body.column4_cta_text;
    if (body.column4_cta_link !== undefined) config.column4_cta_link = body.column4_cta_link;
    if (body.column4_image_url !== undefined) config.column4_image_url = body.column4_image_url;
    if (body.column5_title !== undefined) config.column5_title = body.column5_title;
    if (body.column5_price_text !== undefined) config.column5_price_text = body.column5_price_text;
    if (body.column5_cta_text !== undefined) config.column5_cta_text = body.column5_cta_text;
    if (body.column5_cta_link !== undefined) config.column5_cta_link = body.column5_cta_link;
    if (body.column5_image_url !== undefined) config.column5_image_url = body.column5_image_url;
    if (body.display_order !== undefined) config.display_order = body.display_order;
    if (body.is_active !== undefined) config.is_active = body.is_active === true || body.is_active === 'true' || body.is_active === 1;
    
    const { data, error } = await supabase
      .from('five_column_design_config')
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
      { error: error instanceof Error ? error.message : 'Failed to update five column design config' },
      { status: error instanceof Error && error.message.includes('Unauthorized') ? 403 : 500 }
    );
  }
}

