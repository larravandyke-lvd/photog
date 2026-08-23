import "server-only";

import {
  PHOTO_BUCKET,
  SIGNED_URL_TTL_SECONDS,
  supabase,
} from "@/lib/supabase";
import type { GearInput, GearItem, GearItemWithPhoto, Research } from "@/lib/types";

const TABLE = "gear_items";

/** Attaches a signed URL for each item's stored photo, when it has one. */
async function withPhotoUrls(items: GearItem[]): Promise<GearItemWithPhoto[]> {
  const paths = items.map((item) => item.photo_path).filter((p): p is string => !!p);
  if (paths.length === 0) {
    return items.map((item) => ({ ...item, photo_url: null }));
  }

  const { data, error } = await supabase()
    .storage.from(PHOTO_BUCKET)
    .createSignedUrls(paths, SIGNED_URL_TTL_SECONDS);

  // A missing object should not take the whole page down — fall back to no photo.
  const byPath = new Map<string, string>();
  if (!error && data) {
    for (const entry of data) {
      if (entry.path && entry.signedUrl) byPath.set(entry.path, entry.signedUrl);
    }
  }

  return items.map((item) => ({
    ...item,
    photo_url: item.photo_path ? (byPath.get(item.photo_path) ?? null) : null,
  }));
}

export async function listGear(): Promise<GearItemWithPhoto[]> {
  const { data, error } = await supabase()
    .from(TABLE)
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw new Error(`Failed to list gear: ${error.message}`);
  return withPhotoUrls((data ?? []) as GearItem[]);
}

export async function getGear(id: string): Promise<GearItemWithPhoto | null> {
  const { data, error } = await supabase().from(TABLE).select("*").eq("id", id).maybeSingle();

  if (error) throw new Error(`Failed to load gear ${id}: ${error.message}`);
  if (!data) return null;

  const [item] = await withPhotoUrls([data as GearItem]);
  return item;
}

export async function createGear(input: GearInput): Promise<GearItemWithPhoto> {
  const { data, error } = await supabase().from(TABLE).insert(input).select("*").single();

  if (error) throw new Error(`Failed to create gear: ${error.message}`);
  const [item] = await withPhotoUrls([data as GearItem]);
  return item;
}

export async function updateGear(
  id: string,
  patch: Partial<GearInput>,
): Promise<GearItemWithPhoto> {
  const { data, error } = await supabase()
    .from(TABLE)
    .update(patch)
    .eq("id", id)
    .select("*")
    .single();

  if (error) throw new Error(`Failed to update gear ${id}: ${error.message}`);
  const [item] = await withPhotoUrls([data as GearItem]);
  return item;
}

export async function deleteGear(id: string): Promise<void> {
  const existing = await getGear(id);
  if (existing?.photo_path) {
    await supabase().storage.from(PHOTO_BUCKET).remove([existing.photo_path]);
  }

  const { error } = await supabase().from(TABLE).delete().eq("id", id);
  if (error) throw new Error(`Failed to delete gear ${id}: ${error.message}`);
}

/** Stores a captured photo and points the row at it, replacing any previous one. */
export async function saveGearPhoto(
  id: string,
  bytes: ArrayBuffer,
  contentType: string,
): Promise<GearItemWithPhoto> {
  const existing = await getGear(id);
  if (!existing) throw new Error(`No gear item with id ${id}`);

  const extension = contentType === "image/png" ? "png" : "jpg";
  const path = `${id}/${Date.now()}.${extension}`;

  const { error: uploadError } = await supabase()
    .storage.from(PHOTO_BUCKET)
    .upload(path, bytes, { contentType, upsert: false });

  if (uploadError) throw new Error(`Failed to upload photo: ${uploadError.message}`);

  const { data, error } = await supabase()
    .from(TABLE)
    .update({ photo_path: path })
    .eq("id", id)
    .select("*")
    .single();

  if (error) throw new Error(`Failed to attach photo to ${id}: ${error.message}`);

  if (existing.photo_path) {
    await supabase().storage.from(PHOTO_BUCKET).remove([existing.photo_path]);
  }

  const [item] = await withPhotoUrls([data as GearItem]);
  return item;
}

export async function saveResearch(
  id: string,
  research: Research,
): Promise<GearItemWithPhoto> {
  const { data, error } = await supabase()
    .from(TABLE)
    .update({ research, researched_at: new Date().toISOString() })
    .eq("id", id)
    .select("*")
    .single();

  if (error) throw new Error(`Failed to save research for ${id}: ${error.message}`);
  const [item] = await withPhotoUrls([data as GearItem]);
  return item;
}
