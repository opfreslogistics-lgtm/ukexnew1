import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data, error } = await supabase
    .from('smtp_settings')
    .select('*')
    .eq('user_id', user.id)
    .single();

  if (error && error.code !== 'PGRST116') {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data });
}

export async function POST(request: NextRequest) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const { smtp_host, smtp_port, smtp_user, smtp_password, smtp_from_email, smtp_from_name } = body;

  // Check if config exists
  const { data: existing } = await supabase
    .from('smtp_settings')
    .select('id')
    .eq('user_id', user.id)
    .single();

  let result;
  if (existing) {
    // Update existing
    result = await supabase
      .from('smtp_settings')
      .update({
        smtp_host,
        smtp_port,
        smtp_user,
        smtp_password,
        smtp_from_email,
        smtp_from_name,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', user.id)
      .select()
      .single();
  } else {
    // Insert new
    result = await supabase
      .from('smtp_settings')
      .insert({
        user_id: user.id,
        smtp_host,
        smtp_port,
        smtp_user,
        smtp_password,
        smtp_from_email,
        smtp_from_name,
      })
      .select()
      .single();
  }

  if (result.error) {
    return NextResponse.json({ error: result.error.message }, { status: 500 });
  }

  return NextResponse.json({ data: result.data });
}
