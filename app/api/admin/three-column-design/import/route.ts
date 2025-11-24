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
    const configs = [];

    // Process each row as a three column design config
    for (const row of jsonData) {
      // Build column1_items array
      const column1Items = [];
      for (let i = 1; i <= 4; i++) {
        const imageUrl = row[`column1_item${i}_image_url`] || row[`Column1 Item${i} Image URL`] || '';
        const title = row[`column1_item${i}_title`] || row[`Column1 Item${i} Title`] || '';
        const link = row[`column1_item${i}_link`] || row[`Column1 Item${i} Link`] || '/products';
        const discountText = row[`column1_item${i}_discount_text`] || row[`Column1 Item${i} Discount Text`] || '';
        
        if (imageUrl && title) {
          column1Items.push({
            image_url: imageUrl,
            title: title,
            link: link,
            discount_text: discountText || undefined,
          });
        }
      }

      // Build column2_items array
      const column2Items = [];
      for (let i = 1; i <= 4; i++) {
        const imageUrl = row[`column2_item${i}_image_url`] || row[`Column2 Item${i} Image URL`] || '';
        const title = row[`column2_item${i}_title`] || row[`Column2 Item${i} Title`] || '';
        const link = row[`column2_item${i}_link`] || row[`Column2 Item${i} Link`] || '/products';
        const discountText = row[`column2_item${i}_discount_text`] || row[`Column2 Item${i} Discount Text`] || '';
        
        if (imageUrl && title) {
          column2Items.push({
            image_url: imageUrl,
            title: title,
            link: link,
            discount_text: discountText || undefined,
          });
        }
      }

      const config = {
        column1_title: String(row.column1_title || row['Column1 Title'] || ''),
        column1_items: column1Items,
        column2_title: String(row.column2_title || row['Column2 Title'] || ''),
        column2_items: column2Items,
        column3_headline: String(row.column3_headline || row['Column3 Headline'] || ''),
        column3_subheadline: row.column3_subheadline || row['Column3 Subheadline'] || null,
        column3_cta_text: String(row.column3_cta_text || row['Column3 CTA Text'] || 'Shop Now'),
        column3_cta_link: String(row.column3_cta_link || row['Column3 CTA Link'] || '/products'),
        column3_image_url: row.column3_image_url || row['Column3 Image URL'] || null,
        display_order: parseInt(row.display_order || row['Display Order'] || '0', 10),
        is_active: row.is_active !== undefined ? (row.is_active === true || row.is_active === 'true' || row.is_active === 1 || row.isActive === true || row.isActive === 'true' || row['Is Active'] === true || row['Is Active'] === 'true') : true,
        updated_at: new Date().toISOString(),
      };

      // Validate required fields
      if (!config.column1_title || !config.column2_title || !config.column3_headline) {
        continue; // Skip rows without required fields
      }

      configs.push(config);
    }

    if (configs.length === 0) {
      return NextResponse.json({ error: 'No valid three column design configs found in file' }, { status: 400 });
    }

    // Check for existing configs with same display_order and update them, or insert new ones
    const results = [];
    for (const config of configs) {
      // Check if a config with this display_order already exists
      const { data: existing } = await supabase
        .from('three_column_design_config')
        .select('id')
        .eq('display_order', config.display_order)
        .maybeSingle();

      if (existing?.id) {
        // Update existing record
        const { data, error } = await supabase
          .from('three_column_design_config')
          .update(config)
          .eq('id', existing.id)
          .select()
          .single();
        
        if (error) {
          console.error(`Failed to update config with display_order ${config.display_order}:`, error);
          continue;
        }
        results.push(data);
      } else {
        // Insert new record
        const { data, error } = await supabase
          .from('three_column_design_config')
          .insert(config)
          .select()
          .single();
        
        if (error) {
          console.error(`Failed to insert config with display_order ${config.display_order}:`, error);
          continue;
        }
        results.push(data);
      }
    }

    if (results.length === 0) {
      return NextResponse.json({ error: 'Failed to import any three column design configs' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      count: results.length,
      configs: results,
    });
  } catch (error) {
    console.error('Import error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to import three column design config' },
      { status: error instanceof Error && error.message.includes('Unauthorized') ? 403 : 500 }
    );
  }
}

