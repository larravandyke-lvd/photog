import InventoryClient from "@/components/InventoryClient";
import { listGear } from "@/lib/gear";
import type { GearItemWithPhoto } from "@/lib/types";

// Signed photo URLs are short-lived, so the list is always rendered fresh.
export const dynamic = "force-dynamic";

export default async function HomePage() {
  let items: GearItemWithPhoto[] = [];
  let failure: string | null = null;

  try {
    items = await listGear();
  } catch (error) {
    failure = error instanceof Error ? error.message : "Could not reach Supabase.";
  }

  if (failure) {
    return (
      <div className="rounded-lg border border-border bg-surface p-6">
        <h1 className="text-lg font-semibold">Inventory unavailable</h1>
        <p className="mt-2 text-sm text-muted">{failure}</p>
        <p className="mt-2 text-sm text-muted">
          Check <code>SUPABASE_URL</code> and <code>SUPABASE_SERVICE_ROLE_KEY</code>, and make sure{" "}
          <code>supabase/migrations/0001_init.sql</code> has been applied.
        </p>
      </div>
    );
  }

  return <InventoryClient initialItems={items} />;
}
