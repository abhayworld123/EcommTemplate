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

    // Process each row as a five column design config
    for (let i = 0; i < jsonData.length; i++) {
      const row = jsonData[i];
      const config = {
        column1_headline: String(row.column1_headline || row['Column1 Headline'] || '').trim(),
        column1_subheadline: (row.column1_subheadline || row['Column1 Subheadline'] || '').trim() || null,
        column1_cta_text: String(row.column1_cta_text || row['Column1 CTA Text'] || 'Shop Now').trim(),
        column1_cta_link: String(row.column1_cta_link || row['Column1 CTA Link'] || '/products').trim(),
        column1_image_url: (row.column1_image_url || row['Column1 Image URL'] || '').trim() || null,
        column2_title: String(row.column2_title || row['Column2 Title'] || '').trim(),
        column2_cta_text: String(row.column2_cta_text || row['Column2 CTA Text'] || 'Shop Now').trim(),
        column2_cta_link: String(row.column2_cta_link || row['Column2 CTA Link'] || '/products').trim(),
        column2_image_url: (row.column2_image_url || row['Column2 Image URL'] || '').trim() || null,
        column3_title: String(row.column3_title || row['Column3 Title'] || '').trim(),
        column3_price_text: (row.column3_price_text || row['Column3 Price Text'] || '').trim() || null,
        column3_cta_text: String(row.column3_cta_text || row['Column3 CTA Text'] || 'Shop Now').trim(),
        column3_cta_link: String(row.column3_cta_link || row['Column3 CTA Link'] || '/products').trim(),
        column3_image_url: (row.column3_image_url || row['Column3 Image URL'] || '').trim() || null,
        column4_title: String(row.column4_title || row['Column4 Title'] || '').trim(),
        column4_price_text: (row.column4_price_text || row['Column4 Price Text'] || '').trim() || null,
        column4_cta_text: String(row.column4_cta_text || row['Column4 CTA Text'] || 'Shop Now').trim(),
        column4_cta_link: String(row.column4_cta_link || row['Column4 CTA Link'] || '/products').trim(),
        column4_image_url: (row.column4_image_url || row['Column4 Image URL'] || '').trim() || null,
        column5_title: String(row.column5_title || row['Column5 Title'] || '').trim(),
        column5_price_text: (row.column5_price_text || row['Column5 Price Text'] || '').trim() || null,
        column5_cta_text: String(row.column5_cta_text || row['Column5 CTA Text'] || 'Shop Now').trim(),
        column5_cta_link: String(row.column5_cta_link || row['Column5 CTA Link'] || '/products').trim(),
        column5_image_url: (row.column5_image_url || row['Column5 Image URL'] || '').trim() || null,
        display_order: parseInt(String(row.display_order || row['Display Order'] || '0').trim(), 10) || 0,
        is_active: row.is_active !== undefined && row.is_active !== '' && row.is_active !== null 
          ? (String(row.is_active).toLowerCase() === 'true' || row.is_active === true || row.is_active === 1 || row.is_active === '1')
          : true,
        updated_at: new Date().toISOString(),
      };

      // Validate required fields
      if (!config.column1_headline || !config.column2_title || !config.column3_title || !config.column4_title || !config.column5_title) {
        errors.push(`Row ${i + 2}: Missing required fields (headline or titles)`);
        continue; // Skip rows without required fields
      }

      // Check if a config with this display_order already exists
      const { data: existing } = await supabase
        .from('five_column_design_config')
        .select('id')
        .eq('display_order', config.display_order)
        .maybeSingle();

      if (existing?.id) {
        // Update existing record
        const { data, error } = await supabase
          .from('five_column_design_config')
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
          .from('five_column_design_config')
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
        error: 'Failed to import any five column design configs',
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
      { error: error instanceof Error ? error.message : 'Failed to import five column design config' },
      { status: error instanceof Error && error.message.includes('Unauthorized') ? 403 : 500 }
    );
  }
}

