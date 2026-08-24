import Link from 'next/link';
import { getItemCode } from '@/lib/itemCode';

const STATUS_STYLES: Record<string, string> = {
  HOLD: 'bg-sand text-ink/70',
  PREP: 'bg-amber/30 text-ink',
  FOR_SALE: 'bg-moss/20 text-moss',
  LISTED: 'bg-gold/25 text-ink',
  SOLD: 'bg-ink text-paper',
};

const STATUS_LABELS: Record<string, string> = {
  HOLD: 'Hold',
  PREP: 'In prep',
  FOR_SALE: 'Ready to sell',
  LISTED: 'Listed',
  SOLD: 'Sold',
};

type Photo = { storage_path: string };
type Venue = { venue: string; why: string };
type Item = {
  id: string;
  item_number: number;
  title: string | null;
  category: string | null;
  status: string;
  ai_price_low: number | null;
  ai_price_high: number | null;
  listed_venue: string | null;
  ai_venues: Venue[] | null;
  item_photos: Photo[];
};

export default function ItemCard({ item, photoBaseUrl }: { item: Item; photoBaseUrl: string }) {
  const cover = item.item_photos?.[0];
  const sticker = getItemCode(item.item_number);
  return (
    <Link
      href={`/item/${item.id}`}
      className="block bg-white rounded-xl overflow-hidden border border-sand shadow-sm"
    >
      <div className="aspect-square bg-sand/40 relative">
        {cover ? (
          <img
            src={`${photoBaseUrl}/${cover.storage_path}`}
            className="w-full h-full object-cover"
            alt=""
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-ink/30 text-sm">
            No photo
          </div>
        )}
        <span
          className="absolute top-2 left-2 text-xs px-2 py-0.5 rounded-full font-mono font-semibold"
          style={{ backgroundColor: sticker.bg, color: sticker.text }}
        >
          {sticker.code}
        </span>
      </div>
      <div className="p-3">
        <p className="text-sm font-medium text-ink truncate">
          {item.title || 'Untitled item'}
        </p>
        <p className="text-xs text-ink/50 truncate">{item.category || '—'}</p>
        {item.listed_venue && (
          <p className="text-xs text-moss truncate">on {item.listed_venue}</p>
        )}
        <div className="flex items-center justify-between mt-2">
          <span className={`text-xs px-2 py-0.5 rounded-full ${STATUS_STYLES[item.status] || ''}`}>
            {STATUS_LABELS[item.status] || item.status}
          </span>
          {item.ai_price_low != null && (
            <span className="text-xs text-ink/60">
              ${item.ai_price_low}–${item.ai_price_high}
            </span>
          )}
        </div>
        {item.ai_venues && item.ai_venues.length > 0 && (
          <ul className="mt-2 space-y-0.5 border-t border-sand pt-2">
            {item.ai_venues.slice(0, 3).map((v, i) => (
              <li key={i} className="text-xs text-ink/60 truncate">
                <span className="font-semibold text-rust">{i + 1}.</span> {v.venue}
              </li>
            ))}
          </ul>
        )}
      </div>
    </Link>
  );
}
