'use client';

import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import ItemCard from '@/components/ItemCard';

const STATUSES = ['ALL', 'HOLD', 'PREP', 'FOR_SALE', 'LISTED', 'SOLD'];

// Same key used by the Add page — one shared "pending research" list so
// items queued from either place show up with a spinner in both.
const PENDING_KEY = 'photog_pending_research';

type Item = {
  id: string;
  item_number: number;
  title: string | null;
  brand: string | null;
  model_number: string | null;
  category: string | null;
  status: string;
  ai_price_low: number | null;
  ai_price_high: number | null;
  listed_venue: string | null;
  duplicate_dismissed: boolean;
  ai_venues: { venue: string; why: string }[] | null;
  item_photos: { storage_path: string }[];
};

function readPendingIds(): Set<string> {
  if (typeof window === 'undefined') return new Set();
  try {
    const list: { id: string }[] = JSON.parse(localStorage.getItem(PENDING_KEY) || '[]');
    return new Set(list.map((p) => p.id));
  } catch {
    return new Set();
  }
}

function addPendingIds(ids: string[]) {
  if (typeof window === 'undefined') return;
  try {
    const list: { id: string }[] = JSON.parse(localStorage.getItem(PENDING_KEY) || '[]');
    const existing = new Set(list.map((p) => p.id));
    const merged = [...list, ...ids.filter((id) => !existing.has(id)).map((id) => ({ id }))];
    localStorage.setItem(PENDING_KEY, JSON.stringify(merged));
  } catch {
    localStorage.setItem(PENDING_KEY, JSON.stringify(ids.map((id) => ({ id }))));
  }
}

function removePendingId(id: string) {
  if (typeof window === 'undefined') return;
  try {
    const list: { id: string }[] = JSON.parse(localStorage.getItem(PENDING_KEY) || '[]');
    localStorage.setItem(PENDING_KEY, JSON.stringify(list.filter((p) => p.id !== id)));
  } catch {
    // ignore
  }
}

// Fire-and-forget, same as the Add page's version — runs independently per
// item and keeps going even if the person navigates away.
async function runResearchInBackground(itemId: string) {
  try {
    const res = await fetch('/api/research', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ itemId }),
    });
    const body = await res.json().catch(() => ({}));
    if (!res.ok || body.error) {
      console.error('Background AI research failed for item', itemId, body.error);
    }
  } catch (e) {
    console.error('Background AI research failed for item', itemId, e);
  } finally {
    removePendingId(itemId);
  }
}

export default function DashboardPage() {
  const [items, setItems] = useState<Item[]>([]);
  const [filter, setFilter] = useState('ALL');
  const [loading, setLoading] = useState(true);
  const [photoBaseUrl, setPhotoBaseUrl] = useState('');
  const [selectMode, setSelectMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [pendingIds, setPendingIds] = useState<Set<string>>(new Set());
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  function loadItems() {
    return fetch('/api/items')
      .then((r) => r.json())
      .then((d) => setItems(d.items || []));
  }

  useEffect(() => {
    setPhotoBaseUrl(
      `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/item-photos`
    );
    loadItems().finally(() => setLoading(false));
    setPendingIds(readPendingIds());
  }, []);

  // While anything is pending, poll every 3s: refresh which items are still
  // pending (so badges clear as each finishes) and re-fetch item data (so
  // titles/prices update live without a manual refresh). Stops polling once
  // nothing is pending.
  useEffect(() => {
    if (pendingIds.size === 0) {
      if (pollRef.current) clearInterval(pollRef.current);
      return;
    }
    pollRef.current = setInterval(() => {
      const stillPending = readPendingIds();
      setPendingIds(stillPending);
      loadItems();
    }, 3000);
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pendingIds.size]);

  const filtered = filter === 'ALL' ? items : items.filter((i) => i.status === filter);
  const totalLow = filtered.reduce((s, i) => s + (i.ai_price_low || 0), 0);
  const totalHigh = filtered.reduce((s, i) => s + (i.ai_price_high || 0), 0);

  function dedupeKey(i: Item): string | null {
    if (i.brand && i.model_number) {
      return `${i.brand.trim().toLowerCase()}|${i.model_number.trim().toLowerCase()}`;
    }
    if (i.title) return `title:${i.title.trim().toLowerCase()}`;
    return null;
  }
  const keyCounts: Record<string, number> = {};
  for (const i of items) {
    const key = dedupeKey(i);
    if (!key) continue;
    keyCounts[key] = (keyCounts[key] || 0) + 1;
  }
  const duplicateIds = new Set(
    items
      .filter((i) => {
        const key = dedupeKey(i);
        return key && !i.duplicate_dismissed && keyCounts[key] > 1;
      })
      .map((i) => i.id)
  );

  function toggleSelected(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function exitSelectMode() {
    setSelectMode(false);
    setSelectedIds(new Set());
  }

  function runResearchOnSelected() {
    const ids = Array.from(selectedIds);
    if (ids.length === 0) return;
    addPendingIds(ids);
    setPendingIds(readPendingIds());
    // Fire independently and in parallel — not awaited sequentially — so
    // each item's research runs on its own regardless of the others.
    ids.forEach((id) => runResearchInBackground(id));
    exitSelectMode();
  }

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
        <div className="flex gap-2 shrink-0">
          {!selectMode && (
            <button
              onClick={() => setSelectMode(true)}
              className="text-xs border border-sand text-ink/70 px-3 py-1.5 rounded-full"
            >
              Select
            </button>
          )}
          {selectMode && (
            <button
              onClick={exitSelectMode}
              className="text-xs border border-sand text-ink/70 px-3 py-1.5 rounded-full"
            >
              Cancel
            </button>
          )}
          <Link
            href="/export"
            className="shrink-0 text-xs border border-sand text-ink/70 px-3 py-1.5 rounded-full"
          >
            Inventory book
          </Link>
        </div>
      </div>

      {totalHigh > 0 && (
        <p className="px-4 pt-3 text-xs text-ink/50">
          Estimated value in view: ${totalLow.toLocaleString()}–${totalHigh.toLocaleString()}
        </p>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-3 p-4">
        {loading && <p className="col-span-2 text-center text-ink/40 py-10">Loading…</p>}
        {!loading && filtered.length === 0 && (
          <p className="col-span-2 text-center text-ink/40 py-10">No items yet — add the first one.</p>
        )}
        {filtered.map((item) => {
          const isPending = pendingIds.has(item.id);
          const isSelected = selectedIds.has(item.id);
          return (
            <div
              key={item.id}
              className="relative"
              // Capture-phase click: in select mode, this fires before the
              // ItemCard's own Link navigation, so we can intercept the tap
              // and toggle selection instead of navigating to the item page.
              onClickCapture={(e) => {
                if (selectMode) {
                  e.preventDefault();
                  e.stopPropagation();
                  toggleSelected(item.id);
                }
              }}
            >
              <ItemCard item={item} photoBaseUrl={photoBaseUrl} isDuplicate={duplicateIds.has(item.id)} />
              {selectMode && (
                <div
                  className={`absolute top-2 left-2 w-6 h-6 rounded-full border-2 flex items-center justify-center text-xs font-bold pointer-events-none ${
                    isSelected ? 'bg-rust border-rust text-paper' : 'bg-paper/90 border-sand text-transparent'
                  }`}
                >
                  ✓
                </div>
              )}
              {isPending && (
                <div className="absolute top-2 right-2 bg-ink/85 text-paper text-[10px] px-2 py-1 rounded-full flex items-center gap-1 pointer-events-none">
                  <span className="inline-block w-2 h-2 rounded-full bg-paper animate-pulse" />
                  Researching
                </div>
              )}
            </div>
          );
        })}
      </div>

      {selectMode && selectedIds.size > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-ink text-paper px-5 py-3 rounded-full shadow-lg flex items-center gap-3">
          <span className="text-sm">{selectedIds.size} selected</span>
          <button
            onClick={runResearchOnSelected}
            className="bg-rust text-paper text-sm px-4 py-1.5 rounded-full font-medium"
          >
            Run AI research
          </button>
        </div>
      )}

      {!selectMode && (
        <Link
          href="/add"
          className="fixed bottom-6 right-6 bg-rust text-paper w-14 h-14 rounded-full flex items-center justify-center text-3xl shadow-lg"
          aria-label="Add new item"
        >
          +
        </Link>
      )}
    </main>
  );
}
