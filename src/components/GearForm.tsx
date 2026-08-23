"use client";

import { useState } from "react";

import { CATEGORIES, CATEGORY_LABELS, CONDITIONS, type GearItemWithPhoto } from "@/lib/types";

type Props = {
  onCreated: (item: GearItemWithPhoto) => void;
  onCancel: () => void;
};

const field = "w-full rounded-md border border-border bg-surface px-3 py-2 text-sm";
const label = "block text-xs font-medium uppercase tracking-wide text-muted";

export default function GearForm({ onCreated, onCancel }: Props) {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError(null);

    const form = new FormData(event.currentTarget);
    const payload = Object.fromEntries(form.entries());

    try {
      const response = await fetch("/api/gear", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error ?? "Could not save this item.");

      onCreated(body.item as GearItemWithPhoto);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not save this item.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form
      onSubmit={submit}
      className="space-y-4 rounded-lg border border-border bg-surface p-5"
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label className={label} htmlFor="name">
            Name
          </label>
          <input id="name" name="name" required className={field} placeholder="R5 body #2" />
        </div>

        <div>
          <label className={label} htmlFor="brand">
            Brand
          </label>
          <input id="brand" name="brand" className={field} placeholder="Canon" />
        </div>

        <div>
          <label className={label} htmlFor="model">
            Model
          </label>
          <input id="model" name="model" className={field} placeholder="EOS R5" />
        </div>

        <div>
          <label className={label} htmlFor="category">
            Category
          </label>
          <select id="category" name="category" defaultValue="camera-body" className={field}>
            {CATEGORIES.map((category) => (
              <option key={category} value={category}>
                {CATEGORY_LABELS[category]}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className={label} htmlFor="condition">
            Condition
          </label>
          <select id="condition" name="condition" defaultValue="good" className={field}>
            {CONDITIONS.map((condition) => (
              <option key={condition} value={condition}>
                {condition}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className={label} htmlFor="serial_number">
            Serial number
          </label>
          <input id="serial_number" name="serial_number" className={field} />
        </div>

        <div>
          <label className={label} htmlFor="purchase_date">
            Purchase date
          </label>
          <input id="purchase_date" name="purchase_date" type="date" className={field} />
        </div>

        <div>
          <label className={label} htmlFor="purchase_price">
            Paid (USD)
          </label>
          <input
            id="purchase_price"
            name="purchase_price"
            type="number"
            min="0"
            step="0.01"
            className={field}
          />
        </div>

        <div>
          <label className={label} htmlFor="estimated_value">
            Estimated value (USD)
          </label>
          <input
            id="estimated_value"
            name="estimated_value"
            type="number"
            min="0"
            step="0.01"
            className={field}
          />
        </div>

        <div className="sm:col-span-2">
          <label className={label} htmlFor="notes">
            Notes
          </label>
          <textarea id="notes" name="notes" rows={3} className={field} />
        </div>
      </div>

      {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}

      <div className="flex gap-2">
        <button
          type="submit"
          disabled={saving}
          className="rounded-md bg-accent px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
        >
          {saving ? "Saving…" : "Add to inventory"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="rounded-md border border-border px-4 py-2 text-sm"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
