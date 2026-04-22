"use client";

import { Badge } from "@/components/ui/badge";
import { DomainKey, DomainStatus } from "@/lib/types";

const DOMAIN_LABELS: Record<DomainKey, string> = {
  medical: "Medical Preferences",
  financial: "Financial Wishes",
  daily: "Daily Life & Comfort",
  relationships: "Relationships & Family",
  "end-of-life": "End-of-Life Values",
};

const DOMAIN_ORDER: DomainKey[] = [
  "medical",
  "financial",
  "daily",
  "relationships",
  "end-of-life",
];

interface DomainProgressGridProps {
  currentDomain: DomainKey;
  domainStatus: Record<DomainKey, DomainStatus>;
  onSelectDomain: (domain: DomainKey) => void;
  onSkipDomain: (domain: DomainKey) => void;
}

function StatusBadge({ status }: { status: DomainStatus }) {
  if (status === "not-started") {
    return (
      <Badge variant="outline" className="text-stone-400 text-xs">
        Not started
      </Badge>
    );
  }
  if (status === "in-progress") {
    return (
      <Badge className="bg-sky-100 text-sky-700 text-xs border-0">
        In progress
      </Badge>
    );
  }
  if (status === "complete") {
    return (
      <Badge className="bg-green-50 text-green-600 text-xs border-0">
        Complete
      </Badge>
    );
  }
  return (
    <Badge variant="outline" className="text-stone-400 text-xs">
      Skipped
    </Badge>
  );
}

export function DomainProgressGrid({
  currentDomain,
  domainStatus,
  onSelectDomain,
  onSkipDomain,
}: DomainProgressGridProps) {
  function handleSkipConfirm(domain: DomainKey) {
    const label = DOMAIN_LABELS[domain];
    const confirmed = window.confirm(
      `Skip ${label}? You can return to it later.`
    );
    if (confirmed) {
      onSkipDomain(domain);
    }
  }

  const currentStatus = domainStatus[currentDomain];
  const canSkip = currentStatus !== "skipped" && currentStatus !== "complete";

  return (
    <div className="flex flex-col h-full">
      <nav aria-label="Interview domains" className="flex flex-col gap-1">
        {DOMAIN_ORDER.map((domain) => {
          const status = domainStatus[domain];
          const isActive = domain === currentDomain;
          const isSkipped = status === "skipped";

          return (
            <button
              key={domain}
              onClick={() => onSelectDomain(domain)}
              aria-current={isActive ? "true" : undefined}
              aria-label={
                status === "complete"
                  ? `${DOMAIN_LABELS[domain]} — complete`
                  : status === "skipped"
                  ? `${DOMAIN_LABELS[domain]} — skipped`
                  : DOMAIN_LABELS[domain]
              }
              className={[
                "min-h-[44px] flex flex-col items-start rounded-md py-2 pr-2 text-left w-full",
                isActive
                  ? "border-l-4 border-sky-500 bg-stone-50 pl-3"
                  : "border-l-4 border-transparent pl-3 hover:bg-stone-200 transition-colors duration-150",
              ].join(" ")}
            >
              <span
                className={
                  isSkipped
                    ? "text-sm font-medium text-stone-400 line-through"
                    : "text-sm font-medium text-stone-700"
                }
              >
                {DOMAIN_LABELS[domain]}
              </span>
              <StatusBadge status={status} />
            </button>
          );
        })}
      </nav>

      {canSkip && (
        <button
          onClick={() => handleSkipConfirm(currentDomain)}
          className="text-sm text-stone-500 hover:text-red-600 mt-auto pt-4 border-t border-stone-200 w-full text-left transition-colors duration-150"
        >
          Skip this domain
        </button>
      )}
    </div>
  );
}
