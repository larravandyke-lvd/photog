"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import GearForm from "@/components/GearForm";
import { money } from "@/lib/format";
import { CATEGORY_LABELS, type GearItemWithPhoto } from "@/lib/types";

export default function InventoryClient({ initialItems }: { initialItems: GearItemWithPhoto[] }) {
  const [items, setItems] = useState(initialItems);
  const [adding, setAdding] = useState(false);

  const totals = useMemo(() => {
    const value = items.reduce(
      (sum, item) => sum + Number(item.estimated_value ?? item.purchase_price ?? 0),
      0,
    );
    return { count: items.length, value };
  }, [items]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Inventory</h1>
          <p className="text-sm text-muted">
            {totals.count} {totals.count === 1 ? "item" : "items"} · {money(totals.value)} estimated value
          </p>
        </div>

        {!adding && (
          <button
            type="button"
            onClick={() => setAdding(true)}
            className="rounded-md bg-accent px-4 py-2 text-sm font-medium text-white"
          >
            Add gear
          </button>
        )}
      </div>

      {adding && (
        <GearForm
          onCancel={() => setAdding(false)}
          onCreated={(item) => {
            setItems((current) => [item, ...current]);
            setAdding(false);
          }}
        />
      )}

      {items.length === 0 ? (
        <p className="rounded-lg border border-dashed border-border p-10 text-center text-sm text-muted">
          Nothing tracked yet. Add your first body, lens, or light.
        </p>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <li key={item.id}>
              <Link
                href={`/gear/${item.id}`}
                className="block overflow-hidden rounded-lg border border-border bg-surface transition hover:border-accent"
              >
                <div className="aspect-4/3 bg-black/5 dark:bg-white/5">
                  {item.photo_url ? (
                    // Signed Supabase URLs expire, so plain <img> beats next/image here.
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={item.photo_url}
                      alt={item.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-xs text-muted">
                      No photo
                    </div>
                  )}
                </div>

                <div className="space-y-1 p-4">
                  <p className="text-xs uppercase tracking-wide text-muted">
                    {CATEGORY_LABELS[item.category] ?? item.category}
                  </p>
                  <p className="font-medium">{item.name}</p>
                  <p className="text-sm text-muted">
                    {[item.brand, item.model].filter(Boolean).join(" ") || "—"}
                  </p>
                  <p className="text-sm">{money(item.estimated_value ?? item.purchase_price)}</p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
