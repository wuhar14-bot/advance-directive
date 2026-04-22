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
        <AccordionTrigger>建议追问</AccordionTrigger>
        <AccordionContent>
          {isLoading && (
            <p className="text-sm text-stone-400">
              <Loader2 className="inline w-3 h-3 animate-spin mr-1" />
              生成建议中…
            </p>
          )}

          {hasError && !isLoading && (
            <p className="text-sm text-stone-400">暂时无法生成建议</p>
          )}

          {!isLoading && !hasError && probes.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {probes.map((probe) => {
                const isUsed = usedProbes.has(probe);
                return (
                  <button
                    key={probe}
                    role="button"
                    aria-label={`使用追问：${probe}`}
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
              回答问题后将自动生成追问建议。
            </p>
          )}

          <div className="mt-3">
            <label className="text-sm text-stone-500 mb-1 block">
              追问提示
            </label>
            <Textarea
              readOnly
              placeholder="点击上方建议，或自行输入追问内容"
              className="text-sm"
              value={selectedProbe}
            />
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
