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

    // We only need the first row for the single config
    const row = jsonData[0];
    const supabase = await createServerClient();

    const config = {
      id: '1',
      type: String(row.type || 'gradient').toLowerCase(),
      primary_color: row.primary_color || row['Primary Color'] || '#ffffff',
      secondary_color: row.secondary_color || row['Secondary Color'] || '#f3f4f6',
      tertiary_color: row.tertiary_color || row['Tertiary Color'] || '#e5e7eb',
      speed: parseInt(row.speed || '5', 10),
      direction: row.direction || 'diagonal',
      opacity: parseInt(row.opacity || '100', 10),
      blur: parseInt(row.blur || '0', 10),
      is_active: row.is_active === true || row.is_active === 'true' || row.is_active === 1 || row['Is Active'] === true || row['Is Active'] === 'true',
      updated_at: new Date().toISOString(),
    };

    // Validate type
    const validTypes = ['gradient', 'mesh', 'particles', 'grid'];
    if (!validTypes.includes(config.type)) {
      config.type = 'gradient';
    }

    const { data, error } = await supabase
      .from('background_config')
      .upsert(config)
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
      { error: error instanceof Error ? error.message : 'Failed to import background config' },
      { status: error instanceof Error && error.message.includes('Unauthorized') ? 403 : 500 }
    );
  }
}

