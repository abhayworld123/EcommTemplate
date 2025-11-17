import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase-server';
import { transformSiteConfigForDatabase } from '@/lib/siteConfigTransformer';
import { requireAdmin } from '@/lib/auth';

export async function GET(request: NextRequest) {
  const supabase = await createServerClient();
  const { data, error } = await supabase
    .from('site_config')
    .select('*')
    .single();

  if (error || !data) {
    // Return default config if not found
    return NextResponse.json({
      id: '1',
      site_name: 'Ecommerce Store',
      banner_image: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=1200',
      description: 'Premium products for your needs',
      theme_color: '#2563eb',
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
    
    // Transform flat CSV format to nested structure
    const transformedConfig = transformSiteConfigForDatabase(body);
    
    const { data, error } = await supabase
      .from('site_config')
      .upsert(transformedConfig, {
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
      { error: error instanceof Error ? error.message : 'Failed to update site config' },
      { status: error instanceof Error && error.message.includes('Unauthorized') ? 403 : 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    await requireAdmin();
    
    const body = await request.json();
    const supabase = await createServerClient();
    
    // Transform flat CSV format to nested structure
    const transformedConfig = transformSiteConfigForDatabase(body);
    
    const { data, error } = await supabase
      .from('site_config')
      .update(transformedConfig)
      .eq('id', transformedConfig.id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to update site config' },
      { status: error instanceof Error && error.message.includes('Unauthorized') ? 403 : 500 }
    );
  }
}

