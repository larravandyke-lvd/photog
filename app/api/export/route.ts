import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase';
import { getItemCode } from '@/lib/itemCode';

export const dynamic = 'force-dynamic';

function csvEscape(v: unknown): string {
  if (v === null || v === undefined) return '';
  const s = String(v);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const idsParam = searchParams.get('ids');
  const filterIds = idsParam ? idsParam.split(',').filter(Boolean) : null;

  const supabase = supabaseServer();
  let query = supabase.from('items').select('*').order('item_number', { ascending: true });

  // When ?ids=... is present (e.g. from the dashboard's multi-select
  // "Export" action), only include those specific items in the CSV.
  if (filterIds && filterIds.length > 0) {
    query = query.in('id', filterIds);
  }

  const { data: items, error } = await query;

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const headers = [
    'Sticker Code', 'Status', 'Brand', 'Model Number', 'Title', 'Category',
    'Serial Number', 'Original Box', 'Weight', 'Price Low', 'Price High',
    'Listing Title', 'Listing Description', 'Listed On',
    'Sold Price', 'Shipping Cost', 'Net Earned', 'Sold Venue', 'Notes',
  ];

  const rows = (items || []).map((i) => {
    const sticker = getItemCode(i.item_number);
    const net = i.sold_price != null ? (i.sold_price - (i.shipping_cost || 0)).toFixed(2) : '';
    const weight = i.weight_value != null ? `${i.weight_value}${i.weight_unit || ''}` : '';
    return [
      sticker.code,
      i.status,
      i.brand || '',
      i.model_number || '',
      i.title || '',
      i.category || '',
      i.serial_number || '',
      i.has_original_box ? 'Yes' : '',
      weight,
      i.ai_price_low ?? '',
      i.ai_price_high ?? '',
      i.listing_title || '',
      i.listing_description || '',
      i.listed_venue || '',
      i.sold_price ?? '',
      i.shipping_cost ?? '',
      net,
      i.sold_venue || '',
      i.notes || '',
    ];
  });

  const csv = [headers, ...rows]
    .map((row) => row.map(csvEscape).join(','))
    .join('\n');

  const filename = filterIds ? 'poppops-collection-selected.csv' : 'poppops-collection-inventory.csv';

  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv',
      'Content-Disposition': `attachment; filename="${filename}"`,
    },
  });
}
