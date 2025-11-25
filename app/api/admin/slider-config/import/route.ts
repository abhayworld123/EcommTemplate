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

    // Transform CSV rows to slider_config format
    // Assuming CSV has one row or we take the first row
    const configRow = jsonData[0] as any;
    
    // Validate required fields
    if (!configRow.id && !configRow.Id && !configRow.ID) {
      return NextResponse.json({ 
        error: 'Missing required field: id. CSV must contain an id column.' 
      }, { status: 400 });
    }
    
    // Handle images - support both array and comma-separated string
    let imagesArray: string[] = [];
    const imagesValue = configRow.images || configRow.Images || configRow['Images'] || '';
    if (imagesValue) {
      if (Array.isArray(imagesValue)) {
        imagesArray = imagesValue;
      } else if (typeof imagesValue === 'string') {
        imagesArray = imagesValue.split(',').map((url: string) => url.trim()).filter((url: string) => url.length > 0);
      }
    }
    
    // Validate max 10 images
    if (imagesArray.length > 10) {
      return NextResponse.json(
        { error: 'images cannot exceed 10 images' },
        { status: 400 }
      );
    }
    
    // Handle autoplay - support boolean, string, or number
    const autoplayValue = configRow.autoplay || configRow.Autoplay || configRow['Autoplay'] || false;
    const autoplay = autoplayValue === true || autoplayValue === 'true' || autoplayValue === 1 || autoplayValue === '1';

    const supabase = await createServerClient();
    const { data, error } = await supabase
      .from('slider_config')
      .upsert({
        id: String(configRow.id || configRow.Id || configRow.ID || '1'),
        images: imagesArray,
        autoplay: autoplay,
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'id'
      })
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
      { error: error instanceof Error ? error.message : 'Failed to import slider config' },
      { status: error instanceof Error && error.message.includes('Unauthorized') ? 403 : 500 }
    );
  }
}


