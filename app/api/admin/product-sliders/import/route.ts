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

    // Process each row as a slider config
    for (const row of jsonData) {
      const config = {
        title: String(row.title || row.Title || ''),
        type: String(row.type || row.Type || 'all'),
        category: row.category || row.Category || row['Category'] || null,
        limit_count: parseInt(row.limit_count || row.limitCount || row['Limit Count'] || row.limit || row.Limit || '10', 10),
        display_order: parseInt(row.display_order || row.displayOrder || row['Display Order'] || '0', 10),
        show_title: row.show_title === true || row.show_title === 'true' || row.show_title === 1 || row.showTitle === true || row.showTitle === 'true' || row['Show Title'] === true || row['Show Title'] === 'true',
        auto_scroll: row.auto_scroll === true || row.auto_scroll === 'true' || row.auto_scroll === 1 || row.autoScroll === true || row.autoScroll === 'true' || row['Auto Scroll'] === true || row['Auto Scroll'] === 'true',
        scroll_speed: parseInt(row.scroll_speed || row.scrollSpeed || row['Scroll Speed'] || '5', 10),
        is_active: row.is_active !== undefined ? (row.is_active === true || row.is_active === 'true' || row.is_active === 1 || row.isActive === true || row.isActive === 'true' || row['Is Active'] === true || row['Is Active'] === 'true') : true,
        updated_at: new Date().toISOString(),
      };

      // Validate required fields
      if (!config.title) {
        continue; // Skip rows without title
      }

      configs.push(config);
    }

    if (configs.length === 0) {
      return NextResponse.json({ error: 'No valid slider configs found in file' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('product_sliders_config')
      .insert(configs)
      .select();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      count: data?.length || 0,
      configs: data,
    });
  } catch (error) {
    console.error('Import error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to import product sliders config' },
      { status: error instanceof Error && error.message.includes('Unauthorized') ? 403 : 500 }
    );
  }
}


