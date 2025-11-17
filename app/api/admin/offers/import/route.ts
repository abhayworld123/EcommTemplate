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
      raw: false, // Convert all values to strings
    });

    console.log('Parsed CSV data:', JSON.stringify(jsonData, null, 2));

    if (!jsonData || jsonData.length === 0) {
      return NextResponse.json({ error: 'No data found in file' }, { status: 400 });
    }

    // Transform CSV/Excel rows to offers format
    // Handle both camelCase (offerId, imageUrl, etc.) and snake_case (offer_id, image_url, etc.)
    const offers = jsonData.map((row: any, index: number) => {
      // Log each row for debugging
      console.log(`Processing row ${index}:`, row);
      
      return {
      offer_id: String(row.offerId || row.offer_id || row.offerid || `OFF${String(index + 1).padStart(3, '0')}`),
      title: String(row.title || row.Title || ''),
      description: String(row.description || row.Description || ''),
      image_url: String(row.imageUrl || row.image_url || row.imageurl || ''),
      cta_text: String(row.ctaText || row.cta_text || row.ctatext || 'Shop Now'),
      cta_link: String(row.ctaLink || row.cta_link || row.ctalink || '/products'),
      discount: parseInt(String(row.discount || row.Discount || 0), 10),
      bg_gradient: (row.bgGradient || row.bg_gradient || row.bggradient) ? String(row.bgGradient || row.bg_gradient || row.bggradient) : null,
      is_active: row.isActive !== undefined 
        ? (row.isActive === true || row.isActive === 'true' || row.isActive === 'TRUE' || row.isActive === '1')
        : row.is_active !== undefined
        ? (row.is_active === true || row.is_active === 'true' || row.is_active === 'TRUE' || row.is_active === '1')
        : true,
      display_order: parseInt(String(row.displayOrder || row.display_order || row.displayorder || index + 1), 10),
      };
    }).filter((offer: any) => {
      const isValid = offer.title && offer.offer_id;
      if (!isValid) {
        console.log('Filtered out invalid offer:', offer);
      }
      return isValid;
    });

    console.log('Transformed offers:', JSON.stringify(offers, null, 2));

    if (offers.length === 0) {
      return NextResponse.json({ 
        error: 'No valid offers found. Please ensure your CSV has at least a title and offerId column.' 
      }, { status: 400 });
    }

    const supabase = await createServerClient();
    const { data, error } = await supabase
      .from('offers')
      .upsert(offers, {
        onConflict: 'offer_id'
      })
      .select();

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!data || data.length === 0) {
      return NextResponse.json({ 
        error: 'Failed to insert offers. No data returned from database.' 
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      count: data.length,
      offers: data,
    });
  } catch (error) {
    console.error('Import error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to import offers' },
      { status: error instanceof Error && error.message.includes('Unauthorized') ? 403 : 500 }
    );
  }
}




