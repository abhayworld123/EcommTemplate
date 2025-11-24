import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase-server';
import { requireAdmin } from '@/lib/auth';

export async function GET(request: NextRequest) {
  const supabase = await createServerClient();
  const { data, error } = await supabase
    .from('slider_config')
    .select('*')
    .single();

  if (error || !data) {
    // Return default config if not found
    return NextResponse.json({
      id: '1',
      images: [],
      autoplay: false,
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
    
    // Validate images array length (max 10)
    if (body.images) {
      let imagesArray: string[] = [];
      if (Array.isArray(body.images)) {
        imagesArray = body.images;
      } else if (typeof body.images === 'string') {
        imagesArray = body.images.split(',').map((url: string) => url.trim()).filter((url: string) => url.length > 0);
      }
      
      if (imagesArray.length > 10) {
        return NextResponse.json(
          { error: 'images array cannot exceed 10 images' },
          { status: 400 }
        );
      }
      
      body.images = imagesArray;
    }
    
    // Ensure autoplay is boolean
    if (body.autoplay !== undefined) {
      body.autoplay = body.autoplay === true || body.autoplay === 'true' || body.autoplay === 1;
    }
    
    const { data, error } = await supabase
      .from('slider_config')
      .upsert({
        id: body.id || '1',
        images: body.images || [],
        autoplay: body.autoplay || false,
        updated_at: new Date().toISOString(),
      }, {
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
      { error: error instanceof Error ? error.message : 'Failed to update slider config' },
      { status: error instanceof Error && error.message.includes('Unauthorized') ? 403 : 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    await requireAdmin();
    
    const body = await request.json();
    const supabase = await createServerClient();
    
    // Validate images array length (max 10)
    if (body.images) {
      let imagesArray: string[] = [];
      if (Array.isArray(body.images)) {
        imagesArray = body.images;
      } else if (typeof body.images === 'string') {
        imagesArray = body.images.split(',').map((url: string) => url.trim()).filter((url: string) => url.length > 0);
      }
      
      if (imagesArray.length > 10) {
        return NextResponse.json(
          { error: 'images array cannot exceed 10 images' },
          { status: 400 }
        );
      }
      
      body.images = imagesArray;
    }
    
    // Ensure autoplay is boolean
    if (body.autoplay !== undefined) {
      body.autoplay = body.autoplay === true || body.autoplay === 'true' || body.autoplay === 1;
    }
    
    const { data, error } = await supabase
      .from('slider_config')
      .update({
        images: body.images,
        autoplay: body.autoplay,
        updated_at: new Date().toISOString(),
      })
      .eq('id', body.id || '1')
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to update slider config' },
      { status: error instanceof Error && error.message.includes('Unauthorized') ? 403 : 500 }
    );
  }
}


