"use client";

import { QueryResponse } from "@/lib/types";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

const SUPPORT_COLORS = {
  strong: "bg-green-100 text-green-700",
  moderate: "bg-amber-100 text-amber-700",
  weak: "bg-red-100 text-red-700",
};

const SUPPORT_LABELS = {
  strong: "档案支持充分",
  moderate: "档案部分支持",
  weak: "档案支持有限",
};

interface QueryResponseViewProps {
  response: QueryResponse;
  scenario: string;
}

export function QueryResponseView({ response, scenario }: QueryResponseViewProps) {
  const supportLevel = (response.hedgedLanguage?.toLowerCase().includes("strong")
    ? "strong"
    : response.hedgedLanguage?.toLowerCase().includes("moderate")
    ? "moderate"
    : "weak") as keyof typeof SUPPORT_COLORS;

  return (
    <div className="space-y-5">
      {/* Scenario echo */}
      <div className="text-sm text-stone-500 italic border-l-2 border-stone-200 pl-3">
        {scenario}
      </div>

      {/* Summary */}
      <Card className="bg-sky-50 border-sky-200">
        <CardContent className="p-5">
          <p className="text-stone-800 leading-relaxed">{response.summary}</p>
          <div className="mt-3 flex items-center gap-2">
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${SUPPORT_COLORS[supportLevel]}`}>
              {SUPPORT_LABELS[supportLevel]}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Suggested direction */}
      {response.suggestedDirection && (
        <div>
          <p className="text-xs font-medium text-stone-500 uppercase tracking-wide mb-2">建议方向</p>
          <p className="text-stone-800 leading-relaxed">{response.suggestedDirection}</p>
        </div>
      )}

      {/* Insufficient info warning */}
      {response.insufficientInfo && (
        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="p-4">
            <p className="text-sm text-amber-800">
              <span className="font-medium">档案未涉及：</span>{response.insufficientInfo}
            </p>
          </CardContent>
        </Card>
      )}

      <Separator />

      {/* Relevant values */}
      {response.relevantValues?.length > 0 && (
        <div>
          <p className="text-xs font-medium text-stone-500 uppercase tracking-wide mb-3">相关价值观</p>
          <div className="space-y-2">
            {response.relevantValues.map((v, i) => (
              <Card key={i}>
                <CardContent className="p-4">
                  <p className="font-medium text-stone-900 mb-1">{v.valueLabel}</p>
                  <p className="text-sm text-stone-600 mb-1">{v.relevance}</p>
                  <p className="text-sm text-stone-500 italic">档案依据：{v.archiveEvidence}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Key quotes */}
      {response.keyQuotes?.length > 0 && (
        <div>
          <p className="text-xs font-medium text-stone-500 uppercase tracking-wide mb-3">相关原话</p>
          <div className="space-y-2">
            {response.keyQuotes.map((q, i) => (
              <Card key={i} className="border-l-4 border-l-sky-300">
                <CardContent className="p-4">
                  <blockquote className="text-stone-800 italic mb-2">「{q.quoteText}」</blockquote>
                  <p className="text-sm text-stone-500">{q.applicationToScenario}</p>
                  <Badge variant="outline" className="mt-2 text-xs">{q.quoteId}</Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
