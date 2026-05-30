import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { defaultSiteSettings, mapSiteSettingsRow, mapSiteSettingsToRow, type SiteSettings } from '@/lib/site-settings';

export async function GET() {
  const supabase = await createClient();
  const { data, error } = await supabase.from('site_settings').select('*').maybeSingle();

  if (error) {
    console.error('Failed loading site settings', error.message);
    return NextResponse.json(defaultSiteSettings);
  }

  return NextResponse.json(mapSiteSettingsRow(data));
}

export async function POST(request: Request) {
  const body = (await request.json()) as Partial<SiteSettings>;
  const supabase = await createClient();
  const { data: sessionData, error: sessionError } = await supabase.auth.getSession();

  if (sessionError || !sessionData?.session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const payload = {
    ...mapSiteSettingsToRow({
      ...defaultSiteSettings,
      ...body,
    } as SiteSettings),
    id: 1,
  };

  const { data, error } = await supabase.from('site_settings').upsert(payload, { onConflict: 'id' }).single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(mapSiteSettingsRow(data));
}
