'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Header from '@/components/Header';
import ShippingCalculator from '@/components/ShippingCalculator';
import { getItemCode } from '@/lib/itemCode';

const STATUSES = ['HOLD', 'PREP', 'FOR_SALE', 'LISTED', 'SOLD'];
const VENUE_OPTIONS = ['eBay', 'Facebook Marketplace', 'KEH', 'MPB', 'Craigslist', 'Local/In-person', 'Other'];

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={() => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      }}
      className="text-xs bg-sand text-ink px-2 py-1 rounded-full shrink-0"
    >
      {copied ? 'Copied!' : 'Copy'}
    </button>
  );
}

type Venue = { venue: string; why: string; shipping_setting?: string };
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
  listing_title: string | null;
  listing_description: string | null;
  listed_venue: string | null;
  duplicate_dismissed: boolean;
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
  const [duplicateMatches, setDuplicateMatches] = useState<{ id: string; item_number: number }[]>([]);
  const [deleting, setDeleting] = useState(false);

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

    const hasDedupeInfo = (item?.brand && item?.model_number) || item?.title;
    if (hasDedupeInfo && !item.duplicate_dismissed) {
      const allRes = await fetch('/api/items');
      const { items: allItems } = await allRes.json();
      type Candidate = { id: string; item_number: number; title: string | null; brand: string | null; model_number: string | null };
      const key =
        item.brand && item.model_number
          ? `${item.brand.trim().toLowerCase()}|${item.model_number.trim().toLowerCase()}`
          : `title:${item.title!.trim().toLowerCase()}`;
      const matches = (allItems || []).filter((i: Candidate) => {
        if (i.id === item.id) return false;
        const iKey =
          i.brand && i.model_number
            ? `${i.brand.trim().toLowerCase()}|${i.model_number.trim().toLowerCase()}`
            : i.title
            ? `title:${i.title.trim().toLowerCase()}`
            : null;
        return iKey === key;
      });
      setDuplicateMatches(matches);
    } else {
      setDuplicateMatches([]);
    }
  }

  async function dismissDuplicate() {
    await updateItem({ duplicate_dismissed: true });
    setDuplicateMatches([]);
  }

  async function deleteItem() {
    if (!confirm('Delete this item permanently? This cannot be undone.')) return;
    setDeleting(true);
    await fetch(`/api/items/${id}`, { method: 'DELETE' });
    router.push('/');
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
    try {
      const res = await fetch('/api/research', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          itemId: id,
          notes,
          weightValue: weightValue ? Number(weightValue) : undefined,
          weightUnit: weightValue ? weightUnit : undefined,
        }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        alert(`AI research failed: ${body.error || res.statusText}`);
      }
    } catch (err) {
      alert(`AI research failed: ${err instanceof Error ? err.message : String(err)}`);
    }
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

      {duplicateMatches.length > 0 && (
        <div className="mx-4 mt-3 bg-rust/10 border border-rust/40 rounded-lg p-3">
          <p className="text-sm text-rust font-medium">
            ⚠ Possible duplicate of{' '}
            {duplicateMatches
              .map((m) => getItemCode(m.item_number).code)
              .join(', ')}{' '}
            — same title.
          </p>
          <button
            onClick={dismissDuplicate}
            className="text-xs text-ink/60 underline mt-1"
          >
            Not a duplicate — clear this flag
          </button>
        </div>
      )}

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

        {(item.status === 'LISTED' || item.status === 'SOLD') && (
          <div>
            <p className="text-xs text-ink/50 mb-1">Listed on</p>
            <div className="flex gap-2 flex-wrap">
              {VENUE_OPTIONS.map((v) => (
                <button
                  key={v}
                  onClick={() => updateItem({ listed_venue: v })}
                  className={`text-xs px-3 py-1.5 rounded-full border ${
                    item.listed_venue === v ? 'bg-moss text-paper border-moss' : 'border-sand text-ink/60'
                  }`}
                >
                  {v}
                </button>
              ))}
              <button
                onClick={() => updateItem({ listed_venue: null })}
                className={`text-xs px-3 py-1.5 rounded-full border ${
                  !item.listed_venue ? 'bg-ink text-paper border-ink' : 'border-sand text-ink/40'
                }`}
              >
                Decide later
              </button>
            </div>
          </div>
        )}

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
              defaultValue={item.sold_venue ?? item.listed_venue ?? ''}
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
          <div className="mt-3">
            <ShippingCalculator weightValue={item.weight_value} weightUnit={item.weight_unit} />
          </div>
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
              {item.listing_title && (
                <div>
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-ink/50">Listing title</p>
                    <CopyButton text={item.listing_title} />
                  </div>
                  <p className="text-sm mt-1">{item.listing_title}</p>
                </div>
              )}
              {item.listing_description && (
                <div>
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-ink/50">Listing description</p>
                    <CopyButton text={item.listing_description} />
                  </div>
                  <p className="text-sm mt-1 whitespace-pre-wrap">{item.listing_description}</p>
                </div>
              )}
              {item.ai_venues && item.ai_venues.length > 0 && (
                <div>
                  <p className="text-xs text-ink/50 mb-1">Best places to sell</p>
                  <ul className="space-y-2">
                    {item.ai_venues.map((v, i) => (
                      <li key={i} className="text-sm bg-white border border-sand rounded-lg p-2.5">
                        <p>
                          <span className="text-xs font-semibold text-rust mr-1">
                            {i === 0 ? '1st choice' : i === 1 ? '2nd choice' : `${i + 1}th choice`}
                          </span>
                          <span className="font-medium">{v.venue}:</span>{' '}
                          <span className="text-ink/70">{v.why}</span>
                        </p>
                        {v.shipping_setting && (
                          <p className="text-xs text-ink/50 mt-1">
                            Shipping: {v.shipping_setting}
                          </p>
                        )}
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

        <div className="border-t border-sand pt-4">
          <button
            onClick={deleteItem}
            disabled={deleting}
            className="text-sm text-rust underline disabled:opacity-50"
          >
            {deleting ? 'Deleting…' : 'Delete this item permanently'}
          </button>
        </div>
      </div>
    </main>
  );
}
