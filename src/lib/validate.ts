import { CATEGORIES, CONDITIONS, type GearInput } from "@/lib/types";

function text(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed === "" ? null : trimmed;
}

function money(value: unknown): number | null {
  if (value === null || value === undefined || value === "") return null;
  const parsed = typeof value === "number" ? value : Number(value);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : null;
}

/** Parses an untrusted request body into a gear payload, or explains why it can't. */
export function parseGearInput(
  body: unknown,
  { partial = false }: { partial?: boolean } = {},
): { ok: true; value: GearInput } | { ok: false; error: string } {
  if (typeof body !== "object" || body === null) {
    return { ok: false, error: "Expected a JSON object." };
  }

  const raw = body as Record<string, unknown>;
  const name = text(raw.name);
  if (!partial && !name) return { ok: false, error: "`name` is required." };

  const category = text(raw.category) ?? (partial ? null : "other");
  if (category && !CATEGORIES.includes(category as GearInput["category"])) {
    return { ok: false, error: `\`category\` must be one of: ${CATEGORIES.join(", ")}.` };
  }

  const condition = text(raw.condition) ?? (partial ? null : "good");
  if (condition && !CONDITIONS.includes(condition as GearInput["condition"])) {
    return { ok: false, error: `\`condition\` must be one of: ${CONDITIONS.join(", ")}.` };
  }

  const purchaseDate = text(raw.purchase_date);
  if (purchaseDate && !/^\d{4}-\d{2}-\d{2}$/.test(purchaseDate)) {
    return { ok: false, error: "`purchase_date` must be an ISO date (YYYY-MM-DD)." };
  }

  const value: Record<string, unknown> = {};
  if (name !== null) value.name = name;
  if (category !== null) value.category = category;
  if (condition !== null) value.condition = condition;
  if ("brand" in raw) value.brand = text(raw.brand);
  if ("model" in raw) value.model = text(raw.model);
  if ("serial_number" in raw) value.serial_number = text(raw.serial_number);
  if ("notes" in raw) value.notes = text(raw.notes);
  if ("purchase_date" in raw) value.purchase_date = purchaseDate;
  if ("purchase_price" in raw) value.purchase_price = money(raw.purchase_price);
  if ("estimated_value" in raw) value.estimated_value = money(raw.estimated_value);

  return { ok: true, value: value as GearInput };
}
