import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase';

export async function POST(req: Request) {
  const supabase = supabaseServer();
  const formData = await req.formData();
  const file = formData.get('file') as File | null;
  const itemId = formData.get('itemId') as string | null;
  const sortOrder = Number(formData.get('sortOrder') || 0);

  if (!file || !itemId) {
    return NextResponse.json({ error: 'file and itemId required' }, { status: 400 });
  }

  const ext = file.type === 'image/png' ? 'png' : 'jpg';
  const path = `${itemId}/${Date.now()}-${sortOrder}.${ext}`;

  const arrayBuffer = await file.arrayBuffer();
  const { error: uploadError } = await supabase.storage
    .from('item-photos')
    .upload(path, arrayBuffer, { contentType: file.type, upsert: false });

  if (uploadError) {
    return NextResponse.json({ error: uploadError.message }, { status: 500 });
  }

  const { data, error } = await supabase
    .from('item_photos')
    .insert({ item_id: itemId, storage_path: path, sort_order: sortOrder })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const { data: pub } = supabase.storage.from('item-photos').getPublicUrl(path);
  return NextResponse.json({ photo: data, url: pub.publicUrl });
}
