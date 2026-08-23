'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Header from '@/components/Header';
import { getItemCode } from '@/lib/itemCode';

const STATUSES = ['HOLD', 'PREP', 'FOR_SALE', 'LISTED', 'SOLD'];

type Venue = { venue: string; why: string };
type Photo = { id: string; storage_path: string };
type Item = {
  id: string;
  item_number: number;
  title: string | null;
  category: string | null;
  notes: string | null;
  status: string;
  ai_identification: string | null;
  ai_condition_assessment: string | null;
  ai_price_low: number | null;
  ai_price_high: number | null;
  ai_price_notes: string | null;
  ai_venues: Venue[] | null;
  ai_auction_strategy: string | null;
  weight_value: number | null;
  weight_unit: 'g' | 'oz' | null;
  ai_weight_estimate_g: number | null;
  ai_shipping_recommendation: string | null;
  sold_price: number | null;
  shipping_cost: number | null;
  sold_venue: string | null;
  item_photos: Photo[];
};

export default function ItemDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [item, setItem] = useState<Item | null>(null);
  const [notes, setNotes] = useState('');
  const [weightValue, setWeightValue] = useState('');
  const [weightUnit, setWeightUnit] = useState<'g' | 'oz'>('g');
  const [saving, setSaving] = useState(false);
  const [researching, setResearching] = useState(false);
  const [photoBaseUrl, setPhotoBaseUrl] = useState('');

  useEffect(() => {
    setPhotoBaseUrl(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/item-photos`);
    load();
  }, [id]);

  async function load() {
    const res = await fetch(`/api/items/${id}`);
    const { item } = await res.json();
    setItem(item);
    setNotes(item?.notes || '');
    setWeightValue(item?.weight_value != null ? String(item.weight_value) : '');
    setWeightUnit(item?.weight_unit || 'g');
  }

  async function updateItem(fields: Partial<Item>) {
    setSaving(true);
    await fetch(`/api/items/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(fields),
    });
    await load();
    setSaving(false);
  }

  async function runResearch() {
    setResearching(true);
    await fetch('/api/research', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        itemId: id,
        notes,
        weightValue: weightValue ? Number(weightValue) : undefined,
        weightUnit: weightValue ? weightUnit : undefined,
      }),
    });
    await load();
    setResearching(false);
  }

  if (!item) {
    return (
      <main className="min-h-screen bg-paper flex items-center justify-center">
        <p className="text-ink/40">Loading…</p>
      </main>
    );
  }

  const sticker = getItemCode(item.item_number);

  return (
    <main className="min-h-screen bg-paper pb-16">
      <Header subtitle={`${sticker.name} sticker set`} />

      <div className="px-4 pt-3">
        <span
          className="inline-block text-sm font-mono font-semibold px-3 py-1 rounded-full"
          style={{ backgroundColor: sticker.bg, color: sticker.text }}
        >
          {sticker.code}
        </span>
      </div>


      {item.item_photos?.length > 0 && (
        <div className="flex gap-2 overflow-x-auto p-3 bg-charcoal">
          {item.item_photos.map((p) => (
            <img
              key={p.id}
              src={`${photoBaseUrl}/${p.storage_path}`}
              className="h-40 w-40 object-cover rounded-lg shrink-0"
            />
          ))}
        </div>
      )}

      <div className="p-4 space-y-5 max-w-lg mx-auto">
        <div>
          <input
            defaultValue={item.title || ''}
            onBlur={(e) => updateItem({ title: e.target.value })}
            placeholder="Item title"
            className="w-full text-lg font-serif font-semibold bg-transparent border-b border-sand pb-1"
          />
          <input
            defaultValue={item.category || ''}
            onBlur={(e) => updateItem({ category: e.target.value })}
            placeholder="Category"
            className="w-full text-sm text-ink/60 bg-transparent mt-1"
          />
        </div>

        <div>
          <p className="text-xs text-ink/50 mb-1">Status</p>
          <div className="flex gap-2 flex-wrap">
            {STATUSES.map((s) => (
              <button
                key={s}
                onClick={() => updateItem({ status: s })}
                className={`text-xs px-3 py-1.5 rounded-full border ${
                  item.status === s ? 'bg-ink text-paper border-ink' : 'border-sand text-ink/60'
                }`}
              >
                {s.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>

        {item.status === 'SOLD' && (
          <div className="space-y-2">
            <div className="grid grid-cols-2 gap-3">
              <label className="block">
                <span className="text-xs text-ink/50">Sold price</span>
                <input
                  defaultValue={item.sold_price ?? ''}
                  type="number"
                  step="0.01"
                  placeholder="$"
                  onBlur={(e) => updateItem({ sold_price: Number(e.target.value) })}
                  className="w-full border border-sand rounded-lg p-2 text-sm mt-0.5"
                />
              </label>
              <label className="block">
                <span className="text-xs text-ink/50">Shipping cost (what it cost you)</span>
                <input
                  defaultValue={item.shipping_cost ?? ''}
                  type="number"
                  step="0.01"
                  placeholder="$"
                  onBlur={(e) => updateItem({ shipping_cost: Number(e.target.value) })}
                  className="w-full border border-sand rounded-lg p-2 text-sm mt-0.5"
                />
              </label>
            </div>
            <input
              defaultValue={item.sold_venue ?? ''}
              placeholder="Sold on..."
              onBlur={(e) => updateItem({ sold_venue: e.target.value })}
              className="w-full border border-sand rounded-lg p-2 text-sm"
            />
            {item.sold_price != null && (
              <div className="bg-moss/10 rounded-lg p-3">
                <p className="text-xs text-ink/50">Net earned</p>
                <p className="text-xl font-serif font-bold text-moss">
                  ${(item.sold_price - (item.shipping_cost || 0)).toFixed(2)}
                </p>
              </div>
            )}
          </div>
        )}

        <div>
          <p className="text-xs text-ink/50 mb-1">Weight (for shipping)</p>
          <div className="flex gap-2">
            <input
              value={weightValue}
              onChange={(e) => setWeightValue(e.target.value)}
              onBlur={() =>
                updateItem({
                  weight_value: weightValue ? Number(weightValue) : null,
                  weight_unit: weightValue ? weightUnit : null,
                })
              }
              type="number"
              step="0.1"
              placeholder="e.g. 450"
              className="flex-1 border border-sand rounded-lg p-2 text-sm"
            />
            <div className="flex border border-sand rounded-lg overflow-hidden">
              {(['g', 'oz'] as const).map((u) => (
                <button
                  key={u}
                  onClick={() => {
                    setWeightUnit(u);
                    if (weightValue) updateItem({ weight_value: Number(weightValue), weight_unit: u });
                  }}
                  className={`px-3 py-2 text-sm ${
                    weightUnit === u ? 'bg-ink text-paper' : 'text-ink/60'
                  }`}
                >
                  {u}
                </button>
              ))}
            </div>
          </div>
          {item.ai_weight_estimate_g != null && !item.weight_value && (
            <p className="text-xs text-ink/50 mt-1">
              AI read ~{Math.round(item.ai_weight_estimate_g)}g from a scale photo — confirm or override above.
            </p>
          )}
        </div>

        <div>
          <p className="text-xs text-ink/50 mb-1">Notes</p>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            onBlur={() => updateItem({ notes })}
            className="w-full border border-sand rounded-lg p-3 text-sm h-20"
          />
        </div>

        <div className="border-t border-sand pt-4">
          <div className="flex items-center justify-between">
            <h2 className="font-serif font-semibold">AI Research</h2>
            <button
              onClick={runResearch}
              disabled={researching}
              className="text-xs bg-rust text-paper px-3 py-1.5 rounded-full disabled:opacity-50"
            >
              {researching ? 'Working…' : item.ai_identification ? 'Re-run' : 'Run research'}
            </button>
          </div>

          {item.ai_identification && (
            <div className="mt-3 space-y-4">
              <div>
                <p className="text-xs text-ink/50">Identification</p>
                <p className="text-sm">{item.ai_identification}</p>
              </div>
              <div>
                <p className="text-xs text-ink/50">Condition</p>
                <p className="text-sm">{item.ai_condition_assessment}</p>
              </div>
              <div className="bg-sand/50 rounded-lg p-3">
                <p className="text-xs text-ink/50">Suggested price range</p>
                <p className="text-2xl font-serif font-bold text-rust">
                  ${item.ai_price_low}–${item.ai_price_high}
                </p>
                <p className="text-xs text-ink/50 mt-1">{item.ai_price_notes}</p>
              </div>
              {item.ai_venues && item.ai_venues.length > 0 && (
                <div>
                  <p className="text-xs text-ink/50 mb-1">Best places to sell</p>
                  <ul className="space-y-1.5">
                    {item.ai_venues.map((v, i) => (
                      <li key={i} className="text-sm">
                        <span className="font-medium">{v.venue}:</span>{' '}
                        <span className="text-ink/70">{v.why}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              <div>
                <p className="text-xs text-ink/50">Auction / listing strategy</p>
                <p className="text-sm">{item.ai_auction_strategy}</p>
              </div>
              {item.ai_shipping_recommendation && (
                <div>
                  <p className="text-xs text-ink/50">Shipping advice</p>
                  <p className="text-sm">{item.ai_shipping_recommendation}</p>
                </div>
              )}
            </div>
          )}
        </div>

        <button
          onClick={() => router.push('/')}
          className="text-sm text-ink/50 underline"
        >
          ← Back to all items
        </button>
      </div>
    </main>
  );
}
