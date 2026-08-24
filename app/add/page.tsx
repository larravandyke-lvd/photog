'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import CameraCapture from '@/components/CameraCapture';
import Header from '@/components/Header';
import { getItemCode } from '@/lib/itemCode';

type Stage = 'choose' | 'capture' | 'uploading' | 'notes' | 'researching' | 'done';

export default function AddItemPage() {
  const [stage, setStage] = useState<Stage>('choose');
  const [itemId, setItemId] = useState<string | null>(null);
  const [itemNumber, setItemNumber] = useState<number | null>(null);
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();
  const libraryInputRef = useRef<HTMLInputElement>(null);

  async function handlePhotosDone(photos: Blob[]) {
    setStage('uploading');
    setError('');
    try {
      const createRes = await fetch('/api/items', { method: 'POST' });
      const { item, error: createErr } = await createRes.json();
      if (createErr) throw new Error(createErr);
      setItemId(item.id);
      setItemNumber(item.item_number);

      for (let i = 0; i < photos.length; i++) {
        const form = new FormData();
        form.append('file', photos[i], `photo-${i}.jpg`);
        form.append('itemId', item.id);
        form.append('sortOrder', String(i));
        const upRes = await fetch('/api/upload', { method: 'POST', body: form });
        if (!upRes.ok) throw new Error('Photo upload failed');
      }

      setStage('notes');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong');
      setStage('choose');
    }
  }

  async function runResearch() {
    if (!itemId) return;
    setStage('researching');
    setError('');
    try {
      const res = await fetch('/api/research', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ itemId, notes }),
      });
      const { error: researchErr } = await res.json();
      if (researchErr) throw new Error(researchErr);
      if (notes) {
        await fetch(`/api/items/${itemId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ notes }),
        });
      }
      setStage('done');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'AI research failed — you can retry from the item page');
      setStage('done');
    }
  }

  if (stage === 'choose') {
    return (
      <main className="min-h-screen bg-paper flex flex-col">
        <Header subtitle="Add a new item" />
        <div className="flex-1 flex flex-col items-center justify-center gap-4 px-6">
          <button
            onClick={() => setStage('capture')}
            className="w-full max-w-xs bg-rust text-paper py-5 rounded-xl text-lg font-medium"
          >
            📷 Take photos
          </button>
          <button
            onClick={() => libraryInputRef.current?.click()}
            className="w-full max-w-xs border-2 border-ink text-ink py-5 rounded-xl text-lg font-medium"
          >
            🖼️ Choose from library
          </button>
          <p className="text-ink/50 text-sm text-center max-w-xs mt-2">
            You can select multiple photos at once from your library or drag them in on a laptop.
          </p>
        </div>
        <input
          ref={libraryInputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => {
            if (e.target.files && e.target.files.length > 0) {
              handlePhotosDone(Array.from(e.target.files));
            }
            e.target.value = '';
          }}
        />
      </main>
    );
  }

  if (stage === 'capture') {
    return (
      <div className="h-screen flex flex-col">
        <button
          onClick={() => setStage('choose')}
          className="absolute top-3 left-3 z-20 bg-charcoal/80 text-paper text-sm px-3 py-1.5 rounded-full"
        >
          ← Back
        </button>
        <CameraCapture onDone={handlePhotosDone} />
        {error && <p className="text-rust text-sm p-3 bg-charcoal">{error}</p>}
      </div>
    );
  }

  if (stage === 'uploading') {
    return (
      <main className="min-h-screen bg-paper flex items-center justify-center">
        <p className="text-ink/60">Uploading photos…</p>
      </main>
    );
  }

  if (stage === 'notes') {
    const sticker = itemNumber ? getItemCode(itemNumber) : null;
    return (
      <main className="min-h-screen bg-paper">
        <Header subtitle={sticker ? `${sticker.name} sticker set` : undefined} />
        <div className="p-5 space-y-4 max-w-md mx-auto">
          <div className="bg-sand/60 rounded-lg p-4 text-center">
            <p className="text-sm text-ink/60">
              Grab a <span className="font-medium">{sticker?.name.toLowerCase()}</span> sticker
              and write:
            </p>
            <p
              className="text-4xl font-serif font-bold mt-2 inline-block px-4 py-1 rounded-full"
              style={{ backgroundColor: sticker?.bg, color: sticker?.text }}
            >
              {sticker?.code}
            </p>
          </div>
          <label className="block">
            <span className="text-sm text-ink/70">Any notes? (optional — helps the AI)</span>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. shutter sticks at 1/1000, comes with original box"
              className="mt-1 w-full border border-sand rounded-lg p-3 text-sm h-24"
            />
          </label>
          <button
            onClick={runResearch}
            className="w-full bg-rust text-paper py-3 rounded-lg font-medium"
          >
            Run AI research
          </button>
        </div>
      </main>
    );
  }

  if (stage === 'researching') {
    return (
      <main className="min-h-screen bg-paper flex items-center justify-center px-6">
        <p className="text-ink/60 text-center">
          Identifying the item, checking condition, and pricing it out…
          <br />
          <span className="text-xs">This takes 10–20 seconds.</span>
        </p>
      </main>
    );
  }

  const sticker = itemNumber ? getItemCode(itemNumber) : null;
  return (
    <main className="min-h-screen bg-paper flex flex-col items-center justify-center px-6 gap-4">
      {error && <p className="text-rust text-sm text-center">{error}</p>}
      <p className="text-ink text-center">
        Item{' '}
        <span
          className="font-semibold px-2 py-0.5 rounded-full"
          style={{ backgroundColor: sticker?.bg, color: sticker?.text }}
        >
          {sticker?.code}
        </span>{' '}
        saved.
      </p>
      <div className="flex gap-3">
        <button
          onClick={() => itemId && router.push(`/item/${itemId}`)}
          className="bg-ink text-paper px-4 py-2 rounded-lg text-sm"
        >
          View item
        </button>
        <button
          onClick={() => router.push('/add')}
          className="bg-rust text-paper px-4 py-2 rounded-lg text-sm"
        >
          Add another
        </button>
      </div>
    </main>
  );
}
