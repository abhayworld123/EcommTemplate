import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase-server';
import { requireAdmin } from '@/lib/auth';

export async function GET(request: NextRequest) {
  const supabase = await createServerClient();
  
  const { data, error } = await supabase
    .from('viral_slider_config')
    .select('*')
    .eq('id', '1')
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Return default config if none exists
  if (!data) {
    return NextResponse.json({
      id: '1',
      headline: null,
      videos: [],
      display_order: 0,
      is_active: false,
      autoplay: false,
      scroll_speed: 5,
    });
  }

  return NextResponse.json(data, {
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
      id: '1',
      headline: body.headline || null,
      videos: body.videos || [],
      display_order: body.display_order || 0,
      is_active: body.is_active !== undefined ? (body.is_active === true || body.is_active === 'true' || body.is_active === 1) : true,
      autoplay: body.autoplay !== undefined ? (body.autoplay === true || body.autoplay === 'true' || body.autoplay === 1) : false,
      scroll_speed: body.scroll_speed || 5,
      updated_at: new Date().toISOString(),
    };
    
    const { data, error } = await supabase
      .from('viral_slider_config')
      .upsert(config, { onConflict: 'id' })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create/update viral slider config' },
      { status: error instanceof Error && error.message.includes('Unauthorized') ? 403 : 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    await requireAdmin();
    
    const body = await request.json();
    const supabase = await createServerClient();
    
    const config: any = {
      updated_at: new Date().toISOString(),
    };
    
    if (body.headline !== undefined) config.headline = body.headline;
    if (body.videos !== undefined) config.videos = body.videos;
    if (body.display_order !== undefined) config.display_order = body.display_order;
    if (body.is_active !== undefined) config.is_active = body.is_active === true || body.is_active === 'true' || body.is_active === 1;
    if (body.autoplay !== undefined) config.autoplay = body.autoplay === true || body.autoplay === 'true' || body.autoplay === 1;
    if (body.scroll_speed !== undefined) config.scroll_speed = body.scroll_speed;
    
    const { data, error } = await supabase
      .from('viral_slider_config')
      .update(config)
      .eq('id', '1')
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to update viral slider config' },
      { status: error instanceof Error && error.message.includes('Unauthorized') ? 403 : 500 }
    );
  }
}

