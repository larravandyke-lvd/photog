'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getItemCode } from '@/lib/itemCode';

const STATUS_LABELS: Record<string, string> = {
  HOLD: 'Hold',
  PREP: 'In prep',
  FOR_SALE: 'Ready to sell',
  LISTED: 'Listed',
  SOLD: 'Sold',
};

type Item = {
  id: string;
  item_number: number;
  title: string | null;
  brand: string | null;
  model_number: string | null;
  serial_number: string | null;
  category: string | null;
  status: string;
  weight_value: number | null;
  weight_unit: string | null;
  has_original_box: boolean;
  ai_price_low: number | null;
  ai_price_high: number | null;
  sold_price: number | null;
  shipping_cost: number | null;
  item_photos: { storage_path: string }[];
};

export default function ExportPage() {
  const [items, setItems] = useState<Item[]>([]);
  const [photoBaseUrl, setPhotoBaseUrl] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setPhotoBaseUrl(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/item-photos`);
    fetch('/api/items')
      .then((r) => r.json())
      .then((d) => {
        const sorted = [...(d.items || [])].sort((a, b) => a.item_number - b.item_number);
        setItems(sorted);
      })
      .finally(() => setLoading(false));
  }, []);

  const totalNet = items.reduce(
    (s, i) => s + (i.sold_price != null ? i.sold_price - (i.shipping_cost || 0) : 0),
    0
  );
  const soldCount = items.filter((i) => i.status === 'SOLD').length;

  if (loading) {
    return (
      <main className="min-h-screen bg-paper flex items-center justify-center">
        <p className="text-ink/40">Loading…</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-paper">
      <div className="print:hidden sticky top-0 bg-charcoal text-paper px-5 py-3 flex items-center justify-between gap-3 z-10">
        <Link href="/" className="text-sm text-paper/70">← Back</Link>
        <div className="flex gap-2">
          <a
            href="/api/export"
            className="text-xs bg-amber text-ink px-3 py-1.5 rounded-full font-medium"
          >
            Download CSV
          </a>
          <button
            onClick={() => window.print()}
            className="text-xs bg-rust text-paper px-3 py-1.5 rounded-full font-medium"
          >
            Print
          </button>
        </div>
      </div>

      <div className="max-w-3xl mx-auto p-6 print:p-2">
        <div className="mb-6 print:mb-4">
          <h1 className="font-serif text-2xl font-semibold">PopPop's Collection — Inventory</h1>
          <p className="text-sm text-ink/60 mt-1">
            {items.length} items · {soldCount} sold · ${totalNet.toFixed(2)} net earned so far
          </p>
        </div>

        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="border-b-2 border-ink text-left text-xs uppercase text-ink/50">
              <th className="py-2 pr-2 w-8 print:w-6">✓</th>
              <th className="py-2 pr-2 w-14">Photo</th>
              <th className="py-2 pr-2">Code</th>
              <th className="py-2 pr-2">Item</th>
              <th className="py-2 pr-2">Serial</th>
              <th className="py-2 pr-2">Weight</th>
              <th className="py-2 pr-2">Status</th>
              <th className="py-2 pr-2 text-right">Price</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => {
              const sticker = getItemCode(item.item_number);
              const cover = item.item_photos?.[0];
              const weight = item.weight_value != null
                ? `${item.weight_value}${item.weight_unit}`
                : '—';
              return (
                <tr key={item.id} className="border-b border-sand align-top">
                  <td className="py-2 pr-2">
                    <div className="w-4 h-4 border border-ink/40 rounded-sm" />
                  </td>
                  <td className="py-2 pr-2">
                    {cover ? (
                      <img
                        src={`${photoBaseUrl}/${cover.storage_path}`}
                        className="w-10 h-10 object-cover rounded-md"
                      />
                    ) : (
                      <div className="w-10 h-10 bg-sand rounded-md" />
                    )}
                  </td>
                  <td className="py-2 pr-2">
                    <span
                      className="inline-block text-xs font-mono font-semibold px-2 py-0.5 rounded-full"
                      style={{ backgroundColor: sticker.bg, color: sticker.text }}
                    >
                      {sticker.code}
                    </span>
                  </td>
                  <td className="py-2 pr-2">
                    <p className="font-medium leading-tight">
                      {[item.brand, item.model_number].filter(Boolean).join(' ') || item.title || 'Untitled'}
                    </p>
                    <p className="text-xs text-ink/50">
                      {item.category}
                      {item.has_original_box ? ' · orig. box' : ''}
                    </p>
                  </td>
                  <td className="py-2 pr-2 text-xs font-mono">{item.serial_number || '—'}</td>
                  <td className="py-2 pr-2 text-xs">{weight}</td>
                  <td className="py-2 pr-2 text-xs">{STATUS_LABELS[item.status]}</td>
                  <td className="py-2 pr-2 text-right text-xs">
                    {item.sold_price != null
                      ? `$${item.sold_price} sold`
                      : item.ai_price_low != null
                      ? `$${item.ai_price_low}–${item.ai_price_high}`
                      : '—'}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </main>
  );
}
