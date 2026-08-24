'use client';

import { useState, useEffect } from 'react';

export default function ShippingCalculator({
  weightValue,
  weightUnit,
}: {
  weightValue: number | null;
  weightUnit: 'g' | 'oz' | null;
}) {
  const [fromZip, setFromZip] = useState('');
  const [toZip, setToZip] = useState('');
  const [length, setLength] = useState('');
  const [width, setWidth] = useState('');
  const [height, setHeight] = useState('');
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('shipping_from_zip');
    setFromZip(saved || '20874');
    if (!saved) localStorage.setItem('shipping_from_zip', '20874');
  }, []);

  function saveFromZip(zip: string) {
    setFromZip(zip);
    localStorage.setItem('shipping_from_zip', zip);
  }

  // Convert to pounds/oz for carrier tools, which are US-imperial by default
  const weightLb =
    weightValue && weightUnit === 'g'
      ? weightValue / 453.6
      : weightValue && weightUnit === 'oz'
      ? weightValue / 16
      : null;
  const weightLbDisplay = weightLb ? weightLb.toFixed(2) : '';
  const weightOzDisplay =
    weightValue && weightUnit === 'oz'
      ? weightValue.toFixed(1)
      : weightValue && weightUnit === 'g'
      ? (weightValue / 28.35).toFixed(1)
      : '';

  const uspsUrl = 'https://postcalc.usps.com/';
  const upsUrl = 'https://wwwapps.ups.com/ctc/request?loc=en_US';
  const fedexUrl = 'https://www.fedex.com/en-us/shipping/get-rates-quote.html';

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="w-full border border-sand text-ink/70 text-sm py-2.5 rounded-lg"
      >
        Calculate shipping cost
      </button>
    );
  }

  return (
    <div className="border border-sand rounded-lg p-3 space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium">Shipping calculator</p>
        <button onClick={() => setOpen(false)} className="text-xs text-ink/50">
          Close
        </button>
      </div>

      {weightLbDisplay && (
        <p className="text-xs text-ink/50">
          Item weight: {weightLbDisplay} lb ({weightOzDisplay} oz) — carried over from what you entered.
        </p>
      )}

      <div className="grid grid-cols-2 gap-2">
        <label className="block">
          <span className="text-xs text-ink/50">From ZIP</span>
          <input
            value={fromZip}
            onChange={(e) => saveFromZip(e.target.value)}
            placeholder="e.g. 20878"
            className="w-full border border-sand rounded-lg p-2 text-sm mt-0.5"
          />
        </label>
        <label className="block">
          <span className="text-xs text-ink/50">To ZIP</span>
          <input
            value={toZip}
            onChange={(e) => setToZip(e.target.value)}
            placeholder="buyer's ZIP"
            className="w-full border border-sand rounded-lg p-2 text-sm mt-0.5"
          />
        </label>
      </div>

      <div className="grid grid-cols-3 gap-2">
        <label className="block">
          <span className="text-xs text-ink/50">L (in)</span>
          <input
            value={length}
            onChange={(e) => setLength(e.target.value)}
            type="number"
            className="w-full border border-sand rounded-lg p-2 text-sm mt-0.5"
          />
        </label>
        <label className="block">
          <span className="text-xs text-ink/50">W (in)</span>
          <input
            value={width}
            onChange={(e) => setWidth(e.target.value)}
            type="number"
            className="w-full border border-sand rounded-lg p-2 text-sm mt-0.5"
          />
        </label>
        <label className="block">
          <span className="text-xs text-ink/50">H (in)</span>
          <input
            value={height}
            onChange={(e) => setHeight(e.target.value)}
            type="number"
            className="w-full border border-sand rounded-lg p-2 text-sm mt-0.5"
          />
        </label>
      </div>

      <p className="text-xs text-ink/50">
        Carriers don't allow pre-filled rate links, so tap a button below to open their official
        calculator, then enter the numbers above there for an exact live quote.
      </p>

      <div className="grid grid-cols-3 gap-2">
        <a
          href={uspsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-center text-xs bg-ink text-paper py-2 rounded-lg"
        >
          USPS
        </a>
        <a
          href={upsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-center text-xs bg-ink text-paper py-2 rounded-lg"
        >
          UPS
        </a>
        <a
          href={fedexUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-center text-xs bg-ink text-paper py-2 rounded-lg"
        >
          FedEx
        </a>
      </div>

      <div className="text-xs text-ink/50 border-t border-sand pt-2">
        <span className="font-medium">Other / oversized (tripods, light stands, cases):</span>{' '}
        Greyhound Package Express and regional freight carriers can beat UPS/FedEx on large,
        heavy, awkward-shaped items — worth a quick check for anything over ~30 lb or 3 ft long.
      </div>
    </div>
  );
}
