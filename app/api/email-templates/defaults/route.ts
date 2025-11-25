import { createServerClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function POST() {
  const supabase = createServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Call the function to insert default templates
    const { error } = await supabase.rpc('insert_default_email_templates', {
      p_user_id: user.id
    });

    if (error) {
      console.error('Error inserting default templates:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Default email templates loaded successfully' 
    });
  } catch (error: any) {
    console.error('Error loading default templates:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
