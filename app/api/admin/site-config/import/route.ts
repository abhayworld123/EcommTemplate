import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase-server';
import { requireAdmin } from '@/lib/auth';
import * as XLSX from 'xlsx';
import { transformSiteConfigForDatabase } from '@/lib/siteConfigTransformer';

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

    // Transform CSV rows to site_config format
    // Assuming CSV has one row or we take the first row
    const configRow = jsonData[0] as any;
    
    // Validate required fields
    if (!configRow.id && !configRow.Id && !configRow.ID) {
      return NextResponse.json({ 
        error: 'Missing required field: id. CSV must contain an id column.' 
      }, { status: 400 });
    }

    if (!configRow.site_name && !configRow.siteName && !configRow['Site Name']) {
      return NextResponse.json({ 
        error: 'Missing required field: site_name. CSV must contain a site_name column.' 
      }, { status: 400 });
    }
    
    // Transform flat CSV format to nested structure
    const transformedConfig = transformSiteConfigForDatabase({
      id: String(configRow.id || configRow.Id || configRow.ID || '1'),
      site_name: String(configRow.site_name || configRow.siteName || configRow['Site Name'] || ''),
      banner_image: String(configRow.banner_image || configRow.bannerImage || configRow['Banner Image'] || ''),
      description: String(configRow.description || configRow.Description || ''),
      theme_color: String(configRow.theme_color || configRow.themeColor || configRow['Theme Color'] || ''),
      contact_email: String(configRow.contact_email || configRow.contactEmail || configRow['Contact Email'] || ''),
      contact_phone: String(configRow.contact_phone || configRow.contactPhone || configRow['Contact Phone'] || ''),
      contact_address: String(configRow.contact_address || configRow.contactAddress || configRow['Contact Address'] || ''),
      social_media_facebook: String(configRow.social_media_facebook || configRow.socialMediaFacebook || configRow['Social Media Facebook'] || ''),
      social_media_twitter: String(configRow.social_media_twitter || configRow.socialMediaTwitter || configRow['Social Media Twitter'] || ''),
      social_media_instagram: String(configRow.social_media_instagram || configRow.socialMediaInstagram || configRow['Social Media Instagram'] || ''),
      social_media_linkedin: String(configRow.social_media_linkedin || configRow.socialMediaLinkedin || configRow['Social Media LinkedIn'] || ''),
    });

    const supabase = await createServerClient();
    const { data, error } = await supabase
      .from('site_config')
      .upsert(transformedConfig, {
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
      { error: error instanceof Error ? error.message : 'Failed to import site config' },
      { status: error instanceof Error && error.message.includes('Unauthorized') ? 403 : 500 }
    );
  }
}




