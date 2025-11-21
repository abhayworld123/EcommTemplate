import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase-server';
import { requireAdmin } from '@/lib/auth';

export async function GET(request: NextRequest) {
  const supabase = await createServerClient();
  const { data, error } = await supabase
    .from('background_config')
    .select('*')
    .single();

  // If no config exists, return a default one (but don't save it yet unless needed)
  if (error || !data) {
    return NextResponse.json({
      id: '1',
      type: 'gradient',
      primary_color: '#ffffff',
      secondary_color: '#f3f4f6',
      tertiary_color: '#e5e7eb',
      speed: 5,
      direction: 'diagonal',
      opacity: 100,
      blur: 0,
      is_active: true, // Default to active so it's visible immediately
    });
  }

  return NextResponse.json(data);
}

export async function POST(request: NextRequest) {
  try {
    await requireAdmin();
    
    const body = await request.json();
    const supabase = await createServerClient();
    
    const config = {
      id: '1', // Always use ID 1 for single config
      type: body.type || 'gradient',
      primary_color: body.primary_color || '#ffffff',
      secondary_color: body.secondary_color || '#f3f4f6',
      tertiary_color: body.tertiary_color || '#e5e7eb',
      speed: body.speed || 5,
      direction: body.direction || 'diagonal',
      opacity: body.opacity || 100,
      blur: body.blur || 0,
      is_active: body.is_active !== undefined ? (body.is_active === true || body.is_active === 'true' || body.is_active === 1) : true,
      updated_at: new Date().toISOString(),
    };
    
    const { data, error } = await supabase
      .from('background_config')
      .upsert(config)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to save background config' },
      { status: error instanceof Error && error.message.includes('Unauthorized') ? 403 : 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  // Reuse POST logic since we're upserting a single row
  return POST(request);
}

