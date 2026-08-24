import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase';

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const supabase = supabaseServer();
  const { data, error } = await supabase
    .from('items')
    .select('*, item_photos(*)')
    .eq('id', params.id)
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 404 });
  return NextResponse.json({ item: data });
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const supabase = supabaseServer();
  const body = await req.json();

  const allowed = [
    'title', 'category', 'notes', 'status', 'brand', 'model_number',
    'serial_number', 'has_original_box', 'listed_venue',
    'sold_price', 'sold_venue', 'shipping_cost', 'weight_value', 'weight_unit',
  ];
  const update: Record<string, unknown> = { updated_at: new Date().toISOString() };
  for (const key of allowed) {
    if (key in body) update[key] = body[key];
  }

  const { data, error } = await supabase
    .from('items')
    .update(update)
    .eq('id', params.id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ item: data });
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const supabase = supabaseServer();
  const { error } = await supabase.from('items').delete().eq('id', params.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
