'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}

function LoginForm() {
  const [pin, setPin] = useState('');
  const [name, setName] = useState<'you' | 'eric'>('you');
  const [error, setError] = useState('');
  const router = useRouter();
  const params = useSearchParams();

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    const res = await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pin, name }),
    });
    if (res.ok) {
      router.push(params.get('next') || '/');
    } else {
      setError('Wrong PIN — try again.');
    }
  }

  return (
    <main className="min-h-screen bg-paper flex items-center justify-center p-6">
      <form onSubmit={submit} className="w-full max-w-xs space-y-5">
        <div>
          <h1 className="text-2xl font-semibold text-ink">Gear Inventory</h1>
          <p className="text-ink/60 text-sm mt-1">Enter the shared PIN to continue.</p>
        </div>
        <div className="flex gap-2">
          {(['you', 'eric'] as const).map((n) => (
            <button
              type="button"
              key={n}
              onClick={() => setName(n)}
              className={`flex-1 py-2 rounded-lg border text-sm capitalize ${
                name === n ? 'bg-ink text-paper border-ink' : 'border-sand text-ink/70'
              }`}
            >
              {n}
            </button>
          ))}
        </div>
        <input
          type="password"
          inputMode="numeric"
          value={pin}
          onChange={(e) => setPin(e.target.value)}
          placeholder="PIN"
          className="w-full border border-sand rounded-lg px-4 py-3 text-lg tracking-widest text-center"
          autoFocus
        />
        {error && <p className="text-rust text-sm">{error}</p>}
        <button
          type="submit"
          className="w-full bg-rust text-paper py-3 rounded-lg font-medium"
        >
          Enter
        </button>
      </form>
    </main>
  );
}
