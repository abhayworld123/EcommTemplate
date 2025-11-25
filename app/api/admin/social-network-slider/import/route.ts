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
    const results = [];
    const errors = [];

    // Process each row as a social network slider config
    for (let i = 0; i < jsonData.length; i++) {
      const row = jsonData[i];
      
      // Parse posts from the row
      const posts = [];
      let postIndex = 1;
      
      while (row[`post${postIndex}_media_url`] || row[`post${postIndex}_media_type`]) {
        const mediaUrl = row[`post${postIndex}_media_url`] || row[`post${postIndex}MediaUrl`] || '';
        const mediaType = (row[`post${postIndex}_media_type`] || row[`post${postIndex}MediaType`] || 'image').toLowerCase();
        const productTitle = row[`post${postIndex}_product_title`] || row[`post${postIndex}ProductTitle`] || '';
        const productPrice = row[`post${postIndex}_product_price`] || row[`post${postIndex}ProductPrice`] || '';
        const productLink = row[`post${postIndex}_product_link`] || row[`post${postIndex}ProductLink`] || '';
        const socialHandle = row[`post${postIndex}_social_handle`] || row[`post${postIndex}SocialHandle`] || '';
        const caption = row[`post${postIndex}_caption`] || row[`post${postIndex}Caption`] || '';
        const tagPositionX = row[`post${postIndex}_tag_position_x`] || row[`post${postIndex}TagPositionX`] || '';
        const tagPositionY = row[`post${postIndex}_tag_position_y`] || row[`post${postIndex}TagPositionY`] || '';

        if (mediaUrl) {
          posts.push({
            media_url: String(mediaUrl),
            media_type: mediaType === 'video' ? 'video' : 'image',
            product_title: String(productTitle),
            product_price: String(productPrice),
            product_link: productLink ? String(productLink) : undefined,
            social_handle: String(socialHandle),
            caption: caption ? String(caption) : undefined,
            tag_position_x: tagPositionX ? parseFloat(String(tagPositionX)) : undefined,
            tag_position_y: tagPositionY ? parseFloat(String(tagPositionY)) : undefined,
          });
        }
        
        postIndex++;
        if (postIndex > 20) break; // Limit to 20 posts per config
      }

      const config = {
        headline: String(row.headline || row.Headline || ''),
        posts: posts,
        display_order: parseInt(row.display_order || row.displayOrder || row['Display Order'] || '0', 10),
        is_active: row.is_active !== undefined ? (row.is_active === true || row.is_active === 'true' || row.is_active === 1 || row.isActive === true || row.isActive === 'true' || row['Is Active'] === true || row['Is Active'] === 'true') : true,
        autoplay: row.autoplay === true || row.autoplay === 'true' || row.autoplay === 1 || row.autoplay === '1' || row.autoplay === true || row.autoplay === 'true' || row['Autoplay'] === true || row['Autoplay'] === 'true',
        scroll_speed: parseInt(row.scroll_speed || row.scrollSpeed || row['Scroll Speed'] || '5', 10),
        updated_at: new Date().toISOString(),
      };

      // Check if config with same display_order exists
      const { data: existing } = await supabase
        .from('social_network_slider_config')
        .select('id')
        .eq('display_order', config.display_order)
        .maybeSingle();

      if (existing?.id) {
        // Update existing record
        const { data, error } = await supabase
          .from('social_network_slider_config')
          .update(config)
          .eq('id', existing.id)
          .select()
          .single();
        
        if (error) {
          console.error(`Failed to update config with display_order ${config.display_order}:`, error);
          errors.push(`Row ${i + 2}: Failed to update - ${error.message}`);
          continue;
        }
        results.push(data);
      } else {
        // Insert new record
        const { data, error } = await supabase
          .from('social_network_slider_config')
          .insert(config)
          .select()
          .single();
        
        if (error) {
          console.error(`Failed to insert config with display_order ${config.display_order}:`, error);
          errors.push(`Row ${i + 2}: Failed to insert - ${error.message}`);
          continue;
        }
        results.push(data);
      }
    }

    if (results.length === 0) {
      return NextResponse.json({ 
        error: 'Failed to import any social network slider configs',
        errors: errors.length > 0 ? errors : ['No valid rows found']
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      count: results.length,
      configs: results,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error) {
    console.error('Import error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to import social network slider config' },
      { status: error instanceof Error && error.message.includes('Unauthorized') ? 403 : 500 }
    );
  }
}

