'use client';

import { useState } from 'react';

export default function ShippingCalculator({
  weightValue,
  weightUnit,
}: {
  weightValue: number | null;
  weightUnit: 'g' | 'oz' | null;
}) {
  const [open, setOpen] = useState(false);

  const weightLb =
    weightValue && weightUnit === 'g'
      ? weightValue / 453.6
      : weightValue && weightUnit === 'oz'
      ? weightValue / 16
      : null;
  const weightOz =
    weightValue && weightUnit === 'oz'
      ? weightValue
      : weightValue && weightUnit === 'g'
      ? weightValue / 28.35
      : null;
  const weightDisplay =
    weightLb != null && weightOz != null
      ? `${weightLb.toFixed(2)} lb (${weightOz.toFixed(1)} oz)`
      : null;

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="w-full border border-sand text-ink/70 text-sm py-2.5 rounded-lg"
      >
        Shipping: which option per platform
      </button>
    );
  }

  return (
    <div className="border border-sand rounded-lg p-3 space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium">Calculated shipping, per platform</p>
        <button onClick={() => setOpen(false)} className="text-xs text-ink/50">
          Close
        </button>
      </div>

      {weightDisplay ? (
        <p className="text-xs text-ink/50">
          This item&apos;s weight: <span className="font-medium">{weightDisplay}</span> — enter
          this in whichever platform you list on below.
        </p>
      ) : (
        <p className="text-xs text-rust">
          Enter this item&apos;s weight above first — every platform below needs it to quote
          shipping.
        </p>
      )}

      <div className="space-y-2.5 text-sm">
        <div className="bg-sand/40 rounded-lg p-2.5">
          <p className="font-medium">eBay</p>
          <p className="text-xs text-ink/60 mt-0.5">
            Choose &quot;Calculated: Cost varies by buyer location&quot; when listing, and enter
            this weight + your package dimensions. eBay quotes the buyer a live, accurate rate at
            checkout using their discounted USPS/UPS rates — no need to pick a number yourself.
          </p>
        </div>

        <div className="bg-sand/40 rounded-lg p-2.5">
          <p className="font-medium">Mercari</p>
          <p className="text-xs text-ink/60 mt-0.5">
            Mercari&apos;s prepaid labels are single-priced nationwide by weight tier — not by
            buyer distance. Pick the correct weight tier at listing time (it rounds up to the
            next tier, so weigh with packaging included) and it shows you the exact label price
            immediately.
          </p>
        </div>

        <div className="bg-sand/40 rounded-lg p-2.5">
          <p className="font-medium">Poshmark</p>
          <p className="text-xs text-ink/60 mt-0.5">
            Poshmark charges one flat rate for anything up to 5 lb, shown directly in the app
            when you list — no calculation needed. Heavier items (up to 15 lb) use a simple
            upgraded label you purchase after the sale, from the order screen.
          </p>
        </div>

        <div className="bg-sand/40 rounded-lg p-2.5">
          <p className="font-medium">Facebook Marketplace</p>
          <p className="text-xs text-ink/60 mt-0.5">
            No built-in calculated shipping — this one&apos;s mostly local pickup (see the listing
            description&apos;s pickup details). If a buyer wants it shipped, either quote a flat
            price yourself or point them to buy it through Mercari/Poshmark instead, where the
            label pricing is already handled.
          </p>
        </div>
      </div>
    </div>
  );
}
