"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { useState } from "react";

import CameraCapture from "@/components/CameraCapture";
import ResearchPanel from "@/components/ResearchPanel";
import { date, money } from "@/lib/format";
import { CATEGORY_LABELS, type GearItemWithPhoto } from "@/lib/types";

const heading = "text-xs font-medium uppercase tracking-wide text-muted";

export default function GearDetail({ item: initialItem }: { item: GearItemWithPhoto }) {
  const router = useRouter();
  const [item, setItem] = useState(initialItem);
  const [uploading, setUploading] = useState(false);
  const [researching, setResearching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function uploadPhoto(photo: Blob) {
    setUploading(true);
    setError(null);

    const body = new FormData();
    body.append("photo", new File([photo], "capture.jpg", { type: "image/jpeg" }));

    try {
      const response = await fetch(`/api/gear/${item.id}/photo`, { method: "POST", body });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error ?? "Could not save the photo.");

      setItem(payload.item as GearItemWithPhoto);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not save the photo.");
    } finally {
      setUploading(false);
    }
  }

  async function research() {
    setResearching(true);
    setError(null);

    try {
      const response = await fetch("/api/research", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ id: item.id }),
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error ?? "Research failed.");

      setItem(payload.item as GearItemWithPhoto);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Research failed.");
    } finally {
      setResearching(false);
    }
  }

  async function remove() {
    if (!confirm(`Delete ${item.name}? This cannot be undone.`)) return;

    const response = await fetch(`/api/gear/${item.id}`, { method: "DELETE" });
    if (!response.ok) {
      setError("Could not delete this item.");
      return;
    }
    router.push("/");
    router.refresh();
  }

  return (
    <div className="space-y-6">
      <Link href="/" className="text-sm text-muted hover:text-accent">
        ← Inventory
      </Link>

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-wide text-muted">
            {CATEGORY_LABELS[item.category] ?? item.category}
          </p>
          <h1 className="text-2xl font-semibold tracking-tight">{item.name}</h1>
          <p className="text-sm text-muted">
            {[item.brand, item.model].filter(Boolean).join(" ") || "No brand or model recorded"}
          </p>
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={research}
            disabled={researching}
            className="rounded-md bg-accent px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
          >
            {researching ? "Researching…" : item.research ? "Re-research" : "Research with Claude"}
          </button>
          <button
            type="button"
            onClick={remove}
            className="rounded-md border border-border px-4 py-2 text-sm"
          >
            Delete
          </button>
        </div>
      </div>

      {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}

      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-3">
          <div className="aspect-4/3 overflow-hidden rounded-lg border border-border bg-black/5 dark:bg-white/5">
            {item.photo_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={item.photo_url} alt={item.name} className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full items-center justify-center text-xs text-muted">
                No photo yet
              </div>
            )}
          </div>
          <CameraCapture onCapture={uploadPhoto} busy={uploading} />
        </div>

        <dl className="grid gap-4 rounded-lg border border-border bg-surface p-5 sm:grid-cols-2">
          <div>
            <dt className={heading}>Condition</dt>
            <dd className="text-sm">{item.condition}</dd>
          </div>
          <div>
            <dt className={heading}>Serial</dt>
            <dd className="text-sm break-all">{item.serial_number || "—"}</dd>
          </div>
          <div>
            <dt className={heading}>Purchased</dt>
            <dd className="text-sm">{date(item.purchase_date)}</dd>
          </div>
          <div>
            <dt className={heading}>Paid</dt>
            <dd className="text-sm">{money(item.purchase_price)}</dd>
          </div>
          <div>
            <dt className={heading}>Estimated value</dt>
            <dd className="text-sm">{money(item.estimated_value)}</dd>
          </div>
          <div>
            <dt className={heading}>Added</dt>
            <dd className="text-sm">{date(item.created_at)}</dd>
          </div>
          {item.notes && (
            <div className="sm:col-span-2">
              <dt className={heading}>Notes</dt>
              <dd className="text-sm whitespace-pre-wrap">{item.notes}</dd>
            </div>
          )}
        </dl>
      </div>

      {item.research ? (
        <ResearchPanel research={item.research} researchedAt={item.researched_at} />
      ) : (
        <p className="rounded-lg border border-dashed border-border p-6 text-center text-sm text-muted">
          No research yet. Claude will search the web for specs, used-market value, and known
          issues for this item.
        </p>
      )}
    </div>
  );
}
