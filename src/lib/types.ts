export const CATEGORIES = [
  "camera-body",
  "lens",
  "lighting",
  "support",
  "audio",
  "storage",
  "bag",
  "accessory",
  "other",
] as const;

export type Category = (typeof CATEGORIES)[number];

export const CONDITIONS = ["mint", "excellent", "good", "fair", "poor"] as const;

export type Condition = (typeof CONDITIONS)[number];

/** One researched fact about a piece of gear, as returned by the Claude API. */
export type ResearchFact = { label: string; value: string };

export type ResearchSource = { title: string; url: string };

export type Research = {
  summary: string;
  key_specs: ResearchFact[];
  release_year: string | null;
  msrp_usd: string | null;
  used_market_value_usd: string | null;
  notable_issues: string[];
  care_tips: string[];
  sources: ResearchSource[];
};

/** A row of `gear_items`, as stored in Supabase. */
export type GearItem = {
  id: string;
  name: string;
  category: Category;
  brand: string | null;
  model: string | null;
  serial_number: string | null;
  condition: Condition;
  purchase_date: string | null;
  purchase_price: number | null;
  estimated_value: number | null;
  notes: string | null;
  photo_path: string | null;
  research: Research | null;
  researched_at: string | null;
  created_at: string;
  updated_at: string;
};

/** A gear item decorated with a short-lived signed URL for its photo. */
export type GearItemWithPhoto = GearItem & { photo_url: string | null };

export type GearInput = {
  name: string;
  category: Category;
  brand?: string | null;
  model?: string | null;
  serial_number?: string | null;
  condition: Condition;
  purchase_date?: string | null;
  purchase_price?: number | null;
  estimated_value?: number | null;
  notes?: string | null;
};

export const CATEGORY_LABELS: Record<Category, string> = {
  "camera-body": "Camera body",
  lens: "Lens",
  lighting: "Lighting",
  support: "Tripod / support",
  audio: "Audio",
  storage: "Storage / media",
  bag: "Bag / case",
  accessory: "Accessory",
  other: "Other",
};
