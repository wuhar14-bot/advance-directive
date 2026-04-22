"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Textarea } from "@/components/ui/textarea";

interface ProbePanelProps {
  probes: string[];
  isLoading: boolean;
  hasError: boolean;
  onProbeClick: (probe: string) => void;
}

export function ProbePanel({
  probes,
  isLoading,
  hasError,
  onProbeClick,
}: ProbePanelProps) {
  const [usedProbes, setUsedProbes] = useState<Set<string>>(new Set());
  const [selectedProbe, setSelectedProbe] = useState("");

  function handleProbeClick(probe: string) {
    setUsedProbes((prev) => new Set(prev).add(probe));
    setSelectedProbe(probe);
    onProbeClick(probe);
  }

  return (
    <Accordion
      type="single"
      collapsible
      defaultValue={probes.length > 0 ? "probes" : undefined}
    >
      <AccordionItem value="probes">
        <AccordionTrigger>Suggested follow-ups</AccordionTrigger>
        <AccordionContent>
          {isLoading && (
            <p className="text-sm text-stone-400">
              <Loader2 className="inline w-3 h-3 animate-spin mr-1" />
              Generating suggestions…
            </p>
          )}

          {hasError && !isLoading && (
            <p className="text-sm text-stone-400">Suggestions unavailable</p>
          )}

          {!isLoading && !hasError && probes.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {probes.map((probe) => {
                const isUsed = usedProbes.has(probe);
                return (
                  <button
                    key={probe}
                    role="button"
                    aria-label={`Use follow-up: ${probe}`}
                    onClick={() => handleProbeClick(probe)}
                    className={[
                      "inline-flex items-center px-3 py-1 rounded-full text-sm transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2",
                      isUsed
                        ? "bg-stone-100 text-stone-500"
                        : "bg-sky-100 text-sky-700 hover:bg-sky-200",
                    ].join(" ")}
                  >
                    {probe}
                  </button>
                );
              })}
            </div>
          )}

          {!isLoading && !hasError && probes.length === 0 && (
            <p className="text-sm text-stone-400">
              No suggestions yet. Answer a question to generate follow-ups.
            </p>
          )}

          <div className="mt-3">
            <label className="text-sm text-stone-500 mb-1 block">
              Follow-up note
            </label>
            <Textarea
              readOnly
              placeholder="Click a suggestion above, or type your own follow-up prompt"
              className="text-sm"
              value={selectedProbe}
            />
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
