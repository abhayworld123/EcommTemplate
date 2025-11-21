import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase-server';
import { requireAdmin } from '@/lib/auth';

export async function GET(request: NextRequest) {
  const supabase = await createServerClient();
  const { data, error } = await supabase
    .from('header_config')
    .select('*')
    .single();

  if (error || !data) {
    // Return default config if not found
    return NextResponse.json({
      id: '1',
      style: 'default',
      background_color: '#ffffff',
      text_color: '#1f2937',
      hover_color: '#2563eb',
      accent_color: '#2563eb',
      logo_url: null,
      logo_text: null,
      sticky: true,
      transparent_on_top: false,
      navigation_items: [],
      show_search: false,
      show_cart: true,
      show_user_menu: true,
      height: '80px',
    }, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
      },
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
    
    // Validate and parse navigation_items if provided
    let navigationItems = [];
    if (body.navigation_items) {
      if (Array.isArray(body.navigation_items)) {
        navigationItems = body.navigation_items;
      } else if (typeof body.navigation_items === 'string') {
        try {
          navigationItems = JSON.parse(body.navigation_items);
        } catch {
          // If not JSON, try comma-separated format: "Label1|href1,Label2|href2"
          navigationItems = body.navigation_items.split(',').map((item: string) => {
            const [label, href] = item.trim().split('|');
            return { label: label?.trim() || '', href: href?.trim() || '' };
          }).filter((item: any) => item.label && item.href);
        }
      }
    }
    
    const config = {
      id: body.id || '1',
      style: body.style || 'default',
      background_color: body.background_color || '#ffffff',
      text_color: body.text_color || '#1f2937',
      hover_color: body.hover_color || '#2563eb',
      accent_color: body.accent_color || '#2563eb',
      logo_url: body.logo_url || null,
      logo_text: body.logo_text || null,
      sticky: body.sticky !== undefined ? (body.sticky === true || body.sticky === 'true' || body.sticky === 1) : true,
      transparent_on_top: body.transparent_on_top === true || body.transparent_on_top === 'true' || body.transparent_on_top === 1,
      navigation_items: navigationItems,
      show_search: body.show_search === true || body.show_search === 'true' || body.show_search === 1,
      show_cart: body.show_cart !== undefined ? (body.show_cart === true || body.show_cart === 'true' || body.show_cart === 1) : true,
      show_user_menu: body.show_user_menu !== undefined ? (body.show_user_menu === true || body.show_user_menu === 'true' || body.show_user_menu === 1) : true,
      height: body.height || '80px',
      updated_at: new Date().toISOString(),
    };
    
    const { data, error } = await supabase
      .from('header_config')
      .upsert(config, {
        onConflict: 'id'
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to update header config' },
      { status: error instanceof Error && error.message.includes('Unauthorized') ? 403 : 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    await requireAdmin();
    
    const body = await request.json();
    const supabase = await createServerClient();
    
    // Validate and parse navigation_items if provided
    let navigationItems = [];
    if (body.navigation_items) {
      if (Array.isArray(body.navigation_items)) {
        navigationItems = body.navigation_items;
      } else if (typeof body.navigation_items === 'string') {
        try {
          navigationItems = JSON.parse(body.navigation_items);
        } catch {
          // If not JSON, try comma-separated format
          navigationItems = body.navigation_items.split(',').map((item: string) => {
            const [label, href] = item.trim().split('|');
            return { label: label?.trim() || '', href: href?.trim() || '' };
          }).filter((item: any) => item.label && item.href);
        }
      }
    }
    
    const config: any = {
      updated_at: new Date().toISOString(),
    };
    
    if (body.style !== undefined) config.style = body.style;
    if (body.background_color !== undefined) config.background_color = body.background_color;
    if (body.text_color !== undefined) config.text_color = body.text_color;
    if (body.hover_color !== undefined) config.hover_color = body.hover_color;
    if (body.accent_color !== undefined) config.accent_color = body.accent_color;
    if (body.logo_url !== undefined) config.logo_url = body.logo_url;
    if (body.logo_text !== undefined) config.logo_text = body.logo_text;
    if (body.sticky !== undefined) config.sticky = body.sticky === true || body.sticky === 'true' || body.sticky === 1;
    if (body.transparent_on_top !== undefined) config.transparent_on_top = body.transparent_on_top === true || body.transparent_on_top === 'true' || body.transparent_on_top === 1;
    if (body.navigation_items !== undefined) config.navigation_items = navigationItems;
    if (body.show_search !== undefined) config.show_search = body.show_search === true || body.show_search === 'true' || body.show_search === 1;
    if (body.show_cart !== undefined) config.show_cart = body.show_cart === true || body.show_cart === 'true' || body.show_cart === 1;
    if (body.show_user_menu !== undefined) config.show_user_menu = body.show_user_menu === true || body.show_user_menu === 'true' || body.show_user_menu === 1;
    if (body.height !== undefined) config.height = body.height;
    
    const { data, error } = await supabase
      .from('header_config')
      .update(config)
      .eq('id', body.id || '1')
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to update header config' },
      { status: error instanceof Error && error.message.includes('Unauthorized') ? 403 : 500 }
    );
  }
}

