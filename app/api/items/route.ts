import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase';

export async function GET() {
  const supabase = supabaseServer();
  const { data, error } = await supabase
    .from('items')
    .select('*, item_photos(*)')
    .order('item_number', { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ items: data });
}

export async function POST(req: Request) {
  const supabase = supabaseServer();
  const cookieUser = req.headers.get('cookie')?.includes('gear_user=eric') ? 'eric' : 'you';

  const { data, error } = await supabase
    .from('items')
    .insert({ status: 'HOLD', created_by: cookieUser })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ item: data });
}
