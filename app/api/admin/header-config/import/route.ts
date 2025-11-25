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

    // Transform CSV rows to header_config format
    const configRow = jsonData[0] as any;
    
    // Validate required fields
    if (!configRow.id && !configRow.Id && !configRow.ID) {
      return NextResponse.json({ 
        error: 'Missing required field: id. CSV must contain an id column.' 
      }, { status: 400 });
    }
    
    // Handle navigation_items - support JSON string or pipe-separated format
    let navigationItems: any[] = [];
    const navItemsValue = configRow.navigation_items || configRow.navigationItems || configRow['Navigation Items'] || '';
    if (navItemsValue) {
      if (typeof navItemsValue === 'string') {
        try {
          navigationItems = JSON.parse(navItemsValue);
        } catch {
          // Try pipe-separated format: "Label1|href1,Label2|href2"
          navigationItems = navItemsValue.split(',').map((item: string) => {
            const [label, href] = item.trim().split('|');
            return { label: label?.trim() || '', href: href?.trim() || '' };
          }).filter((item: any) => item.label && item.href);
        }
      } else if (Array.isArray(navItemsValue)) {
        navigationItems = navItemsValue;
      }
    }

    const supabase = await createServerClient();
    const { data, error } = await supabase
      .from('header_config')
      .upsert({
        id: String(configRow.id || configRow.Id || configRow.ID || '1'),
        style: String(configRow.style || configRow.Style || 'default'),
        background_color: String(configRow.background_color || configRow.backgroundColor || configRow['Background Color'] || '#ffffff'),
        text_color: String(configRow.text_color || configRow.textColor || configRow['Text Color'] || '#1f2937'),
        hover_color: String(configRow.hover_color || configRow.hoverColor || configRow['Hover Color'] || '#2563eb'),
        accent_color: String(configRow.accent_color || configRow.accentColor || configRow['Accent Color'] || '#2563eb'),
        logo_url: configRow.logo_url || configRow.logoUrl || configRow['Logo URL'] || null,
        logo_text: configRow.logo_text || configRow.logoText || configRow['Logo Text'] || null,
        sticky: configRow.sticky === true || configRow.sticky === 'true' || configRow.sticky === 1 || configRow.sticky === '1',
        transparent_on_top: configRow.transparent_on_top === true || configRow.transparent_on_top === 'true' || configRow.transparent_on_top === 1 || configRow.transparent_on_top === '1',
        navigation_items: navigationItems,
        show_search: configRow.show_search === true || configRow.show_search === 'true' || configRow.show_search === 1 || configRow.show_search === '1',
        show_cart: configRow.show_cart !== undefined ? (configRow.show_cart === true || configRow.show_cart === 'true' || configRow.show_cart === 1 || configRow.show_cart === '1') : true,
        show_user_menu: configRow.show_user_menu !== undefined ? (configRow.show_user_menu === true || configRow.show_user_menu === 'true' || configRow.show_user_menu === 1 || configRow.show_user_menu === '1') : true,
        height: String(configRow.height || configRow.Height || '80px'),
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
      { error: error instanceof Error ? error.message : 'Failed to import header config' },
      { status: error instanceof Error && error.message.includes('Unauthorized') ? 403 : 500 }
    );
  }
}


