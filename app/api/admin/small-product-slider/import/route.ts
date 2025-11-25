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
      raw: false,
    });

    if (!jsonData || jsonData.length === 0) {
      return NextResponse.json({ error: 'No data found in file' }, { status: 400 });
    }

    const supabase = await createServerClient();
    const results = [];
    const errors = [];

    // Process each row as a small product slider config
    for (let i = 0; i < jsonData.length; i++) {
      const row = jsonData[i];
      
      // Build products array (support up to 20 products)
      const products = [];
      for (let j = 1; j <= 20; j++) {
        const imageUrl = (row[`product${j}_image_url`] || row[`Product${j} Image URL`] || '').trim();
        const title = (row[`product${j}_title`] || row[`Product${j} Title`] || '').trim();
        const price = (row[`product${j}_price`] || row[`Product${j} Price`] || '').trim();
        
        // Only add product if it has at least image_url, title, or price
        if (imageUrl || title || price) {
          products.push({
            image_url: imageUrl || '',
            title: title || '',
            price: price || '',
            unit_price: (row[`product${j}_unit_price`] || row[`Product${j} Unit Price`] || '').trim() || undefined,
            description: (row[`product${j}_description`] || row[`Product${j} Description`] || '').trim() || undefined,
            link: (row[`product${j}_link`] || row[`Product${j} Link`] || '').trim() || undefined,
            sponsored: row[`product${j}_sponsored`] !== undefined && row[`product${j}_sponsored`] !== '' && row[`product${j}_sponsored`] !== null
              ? (String(row[`product${j}_sponsored`]).toLowerCase() === 'true' || row[`product${j}_sponsored`] === true || row[`product${j}_sponsored`] === 1 || row[`product${j}_sponsored`] === '1')
              : false,
          });
        }
      }

      if (products.length === 0) {
        errors.push(`Row ${i + 2}: No products found`);
        continue;
      }

      const config = {
        headline: String(row.headline || row.Headline || '').trim(),
        products: products,
        display_order: parseInt(String(row.display_order || row['Display Order'] || '0').trim(), 10) || 0,
        is_active: row.is_active !== undefined && row.is_active !== '' && row.is_active !== null
          ? (String(row.is_active).toLowerCase() === 'true' || row.is_active === true || row.is_active === 1 || row.is_active === '1')
          : true,
        autoplay: row.autoplay !== undefined && row.autoplay !== '' && row.autoplay !== null
          ? (String(row.autoplay).toLowerCase() === 'true' || row.autoplay === true || row.autoplay === 1 || row.autoplay === '1')
          : false,
        scroll_speed: parseInt(String(row.scroll_speed || row['Scroll Speed'] || '5').trim(), 10) || 5,
        updated_at: new Date().toISOString(),
      };

      // Validate required fields
      if (!config.headline) {
        errors.push(`Row ${i + 2}: Missing headline`);
        continue;
      }

      // Check if a config with this display_order already exists
      const { data: existing } = await supabase
        .from('small_product_slider_config')
        .select('id')
        .eq('display_order', config.display_order)
        .maybeSingle();

      if (existing?.id) {
        // Update existing record
        const { data, error } = await supabase
          .from('small_product_slider_config')
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
          .from('small_product_slider_config')
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
        error: 'Failed to import any small product slider configs',
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
      { error: error instanceof Error ? error.message : 'Failed to import small product slider config' },
      { status: error instanceof Error && error.message.includes('Unauthorized') ? 403 : 500 }
    );
  }
}

