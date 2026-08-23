"use client";

import type { Research } from "@/lib/types";

const heading = "text-xs font-medium uppercase tracking-wide text-muted";

export default function ResearchPanel({
  research,
  researchedAt,
}: {
  research: Research;
  researchedAt: string | null;
}) {
  return (
    <div className="space-y-5 rounded-lg border border-border bg-surface p-5">
      <div>
        <h2 className="text-lg font-semibold tracking-tight">What Claude found</h2>
        {researchedAt && (
          <p className="text-xs text-muted">
            Researched {new Date(researchedAt).toLocaleString("en-US")}
          </p>
        )}
      </div>

      <p className="text-sm leading-relaxed">{research.summary}</p>

      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <p className={heading}>Released</p>
          <p className="text-sm">{research.release_year ?? "Not established"}</p>
        </div>
        <div>
          <p className={heading}>MSRP</p>
          <p className="text-sm">{research.msrp_usd ? `$${research.msrp_usd}` : "Not established"}</p>
        </div>
        <div>
          <p className={heading}>Used market</p>
          <p className="text-sm">
            {research.used_market_value_usd
              ? `$${research.used_market_value_usd}`
              : "Not established"}
          </p>
        </div>
      </div>

      {research.key_specs.length > 0 && (
        <div>
          <p className={heading}>Key specs</p>
          <dl className="mt-2 grid gap-x-6 gap-y-1 sm:grid-cols-2">
            {research.key_specs.map((spec) => (
              <div key={spec.label} className="flex justify-between gap-4 text-sm">
                <dt className="text-muted">{spec.label}</dt>
                <dd className="text-right">{spec.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      )}

      {research.notable_issues.length > 0 && (
        <div>
          <p className={heading}>Known issues</p>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm">
            {research.notable_issues.map((issue) => (
              <li key={issue}>{issue}</li>
            ))}
          </ul>
        </div>
      )}

      {research.care_tips.length > 0 && (
        <div>
          <p className={heading}>Care</p>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm">
            {research.care_tips.map((tip) => (
              <li key={tip}>{tip}</li>
            ))}
          </ul>
        </div>
      )}

      {research.sources.length > 0 && (
        <div>
          <p className={heading}>Sources</p>
          <ul className="mt-2 space-y-1 text-sm">
            {research.sources.map((source) => (
              <li key={source.url}>
                <a
                  href={source.url}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="text-accent underline underline-offset-2"
                >
                  {source.title || source.url}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
