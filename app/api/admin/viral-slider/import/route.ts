import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase-server';
import { requireAdmin } from '@/lib/auth';
import * as XLSX from 'xlsx';

export async function POST(request: NextRequest) {
  try {
    await requireAdmin();
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const isCSV = file.name.toLowerCase().endsWith('.csv');
    
    let workbook: XLSX.WorkBook;
    if (isCSV) {
      const text = buffer.toString('utf-8');
      workbook = XLSX.read(text, {
        type: 'string',
        raw: false,
      });
    } else {
      workbook = XLSX.read(buffer, { type: 'buffer' });
    }

    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const jsonData = XLSX.utils.sheet_to_json<any>(worksheet, {
      defval: '',
    });

    if (!jsonData || jsonData.length === 0) {
      return NextResponse.json({ error: 'No data found in file' }, { status: 400 });
    }

    const supabase = await createServerClient();

    // Parse videos from the first row (single instance)
    const row = jsonData[0];
    const videos = [];
    let videoIndex = 1;
    
    while (row[`video${videoIndex}_url`] || row[`video${videoIndex}Url`]) {
      const videoUrl = row[`video${videoIndex}_url`] || row[`video${videoIndex}Url`] || '';
      const socialHandle = row[`video${videoIndex}_social_handle`] || row[`video${videoIndex}SocialHandle`] || '';
      const caption = row[`video${videoIndex}_caption`] || row[`video${videoIndex}Caption`] || '';
      const productTitle = row[`video${videoIndex}_product_title`] || row[`video${videoIndex}ProductTitle`] || '';
      const productPrice = row[`video${videoIndex}_product_price`] || row[`video${videoIndex}ProductPrice`] || '';
      const productThumbnail = row[`video${videoIndex}_product_thumbnail`] || row[`video${videoIndex}ProductThumbnail`] || '';
      const productLink = row[`video${videoIndex}_product_link`] || row[`video${videoIndex}ProductLink`] || '';

      if (videoUrl) {
        videos.push({
          video_url: String(videoUrl),
          social_handle: String(socialHandle),
          caption: caption ? String(caption) : undefined,
          product_title: String(productTitle),
          product_price: String(productPrice),
          product_thumbnail: String(productThumbnail),
          product_link: productLink ? String(productLink) : undefined,
        });
      }
      
      videoIndex++;
      if (videoIndex > 20) break; // Limit to 20 videos
    }

    const config = {
      id: '1',
      headline: String(row.headline || row.Headline || ''),
      videos: videos,
      display_order: parseInt(row.display_order || row.displayOrder || row['Display Order'] || '0', 10),
      is_active: row.is_active !== undefined ? (row.is_active === true || row.is_active === 'true' || row.is_active === 1 || row.isActive === true || row.isActive === 'true' || row['Is Active'] === true || row['Is Active'] === 'true') : true,
      autoplay: row.autoplay === true || row.autoplay === 'true' || row.autoplay === 1 || row.autoplay === '1' || row.autoplay === true || row.autoplay === 'true' || row['Autoplay'] === true || row['Autoplay'] === 'true',
      scroll_speed: parseInt(row.scroll_speed || row.scrollSpeed || row['Scroll Speed'] || '5', 10),
      updated_at: new Date().toISOString(),
    };

    // Upsert the config (single instance)
    const { data, error } = await supabase
      .from('viral_slider_config')
      .upsert(config, { onConflict: 'id' })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      count: 1,
      config: data,
    });
  } catch (error) {
    console.error('Import error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to import viral slider config' },
      { status: error instanceof Error && error.message.includes('Unauthorized') ? 403 : 500 }
    );
  }
}

