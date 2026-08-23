'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import ItemCard from '@/components/ItemCard';

const STATUSES = ['ALL', 'HOLD', 'PREP', 'FOR_SALE', 'LISTED', 'SOLD'];

type Item = {
  id: string;
  item_number: number;
  title: string | null;
  category: string | null;
  status: string;
  ai_price_low: number | null;
  ai_price_high: number | null;
  item_photos: { storage_path: string }[];
};

export default function DashboardPage() {
  const [items, setItems] = useState<Item[]>([]);
  const [filter, setFilter] = useState('ALL');
  const [loading, setLoading] = useState(true);
  const [photoBaseUrl, setPhotoBaseUrl] = useState('');

  useEffect(() => {
    setPhotoBaseUrl(
      `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/item-photos`
    );
    fetch('/api/items')
      .then((r) => r.json())
      .then((d) => setItems(d.items || []))
      .finally(() => setLoading(false));
  }, []);

  const filtered = filter === 'ALL' ? items : items.filter((i) => i.status === filter);
  const totalLow = filtered.reduce((s, i) => s + (i.ai_price_low || 0), 0);
  const totalHigh = filtered.reduce((s, i) => s + (i.ai_price_high || 0), 0);

  return (
    <main className="min-h-screen bg-paper pb-24">
      <Header subtitle={`${items.length} item${items.length === 1 ? '' : 's'} archived`} />

      <div className="px-4 pt-4 flex items-center justify-between gap-2">
        <div className="flex gap-2 overflow-x-auto">
          {STATUSES.map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`shrink-0 text-xs px-3 py-1.5 rounded-full border ${
                filter === s ? 'bg-ink text-paper border-ink' : 'border-sand text-ink/60'
              }`}
            >
              {s === 'ALL' ? 'All' : s.replace('_', ' ')}
            </button>
          ))}
        </div>
        <Link
          href="/export"
          className="shrink-0 text-xs border border-sand text-ink/70 px-3 py-1.5 rounded-full"
        >
          Inventory book
        </Link>
      </div>

      {totalHigh > 0 && (
        <p className="px-4 pt-3 text-xs text-ink/50">
          Estimated value in view: ${totalLow.toLocaleString()}–${totalHigh.toLocaleString()}
        </p>
      )}

      <div className="grid grid-cols-2 gap-3 p-4">
        {loading && <p className="col-span-2 text-center text-ink/40 py-10">Loading…</p>}
        {!loading && filtered.length === 0 && (
          <p className="col-span-2 text-center text-ink/40 py-10">No items yet — add the first one.</p>
        )}
        {filtered.map((item) => (
          <ItemCard key={item.id} item={item} photoBaseUrl={photoBaseUrl} />
        ))}
      </div>

      <Link
        href="/add"
        className="fixed bottom-6 right-6 bg-rust text-paper w-14 h-14 rounded-full flex items-center justify-center text-3xl shadow-lg"
        aria-label="Add new item"
      >
        +
      </Link>
    </main>
  );
}
