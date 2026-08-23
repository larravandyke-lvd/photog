import "server-only";

import Anthropic from "@anthropic-ai/sdk";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import { z } from "zod";

import type { GearItem, Research } from "@/lib/types";
import { CATEGORY_LABELS } from "@/lib/types";

const MODEL = "claude-opus-5";

/** Guards against a server-tool turn ping-ponging forever on `pause_turn`. */
const MAX_RESUMES = 4;

const ResearchSchema = z.object({
  summary: z.string(),
  key_specs: z.array(z.object({ label: z.string(), value: z.string() })),
  release_year: z.string().nullable(),
  msrp_usd: z.string().nullable(),
  used_market_value_usd: z.string().nullable(),
  notable_issues: z.array(z.string()),
  care_tips: z.array(z.string()),
  sources: z.array(z.object({ title: z.string(), url: z.string() })),
});

let cached: Anthropic | null = null;

function client(): Anthropic {
  if (cached) return cached;
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error("Claude research is not configured. Set ANTHROPIC_API_KEY (see .env.example).");
  }
  cached = new Anthropic();
  return cached;
}

function describe(item: GearItem): string {
  const lines = [
    `Name: ${item.name}`,
    `Category: ${CATEGORY_LABELS[item.category] ?? item.category}`,
  ];
  if (item.brand) lines.push(`Brand: ${item.brand}`);
  if (item.model) lines.push(`Model: ${item.model}`);
  if (item.condition) lines.push(`Owner-reported condition: ${item.condition}`);
  if (item.purchase_date) lines.push(`Purchased: ${item.purchase_date}`);
  if (item.purchase_price != null) lines.push(`Paid: $${item.purchase_price}`);
  if (item.notes) lines.push(`Owner notes: ${item.notes}`);
  return lines.join("\n");
}

const SYSTEM = `You research photography equipment for an owner's inventory record.

Search the web for the specific piece of gear described, then report what you
actually found. Priorities, in order: correct identification of the exact model,
current used-market value, key specifications, and any well-documented reliability
problems. If you cannot confirm something, say so rather than estimating — an
inventory used for insurance is worse than useless when it carries invented numbers.`;

/**
 * Researches a gear item in two calls.
 *
 * The first call does the web research; the second reshapes that prose into the
 * stored schema. They are kept separate because citations (which the web-search
 * results carry) and `output_config.format` cannot be combined in one request.
 */
export async function researchGear(item: GearItem): Promise<Research> {
  const anthropic = client();

  const messages: Anthropic.Beta.BetaMessageParam[] = [
    {
      role: "user",
      content: `Research this piece of photography gear:\n\n${describe(item)}`,
    },
  ];

  let findings: Anthropic.Beta.BetaMessage | null = null;

  for (let attempt = 0; attempt <= MAX_RESUMES; attempt++) {
    const response: Anthropic.Beta.BetaMessage = await anthropic.beta.messages.create({
      model: MODEL,
      max_tokens: 8000,
      system: SYSTEM,
      thinking: { type: "adaptive" },
      // On a policy decline the API re-runs the request on a fallback model
      // inside the same call, instead of simply returning nothing.
      betas: ["server-side-fallback-2026-07-01"],
      fallbacks: "default",
      tools: [{ type: "web_search_20260209", name: "web_search", max_uses: 8 }],
      messages,
    });

    if (response.stop_reason === "refusal") {
      throw new Error("Claude declined to research this item.");
    }

    // A long server-tool turn can stop early; resume it by replaying the
    // partial assistant turn back into the conversation.
    if (response.stop_reason === "pause_turn") {
      messages.push({ role: "assistant", content: response.content });
      continue;
    }

    findings = response;
    break;
  }

  if (!findings) {
    throw new Error("Research did not finish — the search turn kept pausing.");
  }

  const prose = findings.content
    .filter((block): block is Anthropic.Beta.BetaTextBlock => block.type === "text")
    .map((block) => block.text)
    .join("\n\n")
    .trim();

  if (!prose) {
    throw new Error("Research returned no usable findings.");
  }

  const structured = await anthropic.messages.parse({
    model: MODEL,
    max_tokens: 4000,
    system:
      "Reformat the research notes into the given schema. Use only what the notes " +
      "state — never fill a field from your own knowledge. Use null for a value the " +
      "notes do not establish, and an empty array for a list they do not mention. " +
      "Money fields are plain strings such as \"1200\" or \"900-1100\", without a currency symbol.",
    messages: [{ role: "user", content: `Research notes:\n\n${prose}` }],
    output_config: { format: zodOutputFormat(ResearchSchema) },
  });

  if (!structured.parsed_output) {
    throw new Error("Could not structure the research findings.");
  }

  return structured.parsed_output;
}
