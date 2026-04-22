"use client";

import { Archive, DomainKey } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

const DOMAIN_LABELS: Record<DomainKey, string> = {
  medical: "医疗意愿",
  financial: "财务安排",
  daily: "日常生活",
  relationships: "家庭与关系",
  "end-of-life": "临终价值观",
};

const WEIGHT_LABELS = {
  core: { label: "核心价值", color: "bg-sky-100 text-sky-800" },
  strong: { label: "重要价值", color: "bg-stone-100 text-stone-700" },
  moderate: { label: "一般偏好", color: "bg-stone-50 text-stone-500" },
};

const CONFIDENCE_LABELS = {
  explicit: { label: "明确表达", color: "bg-green-100 text-green-700" },
  inferred: { label: "推断", color: "bg-amber-100 text-amber-700" },
};

interface ArchiveViewProps {
  archive: Archive;
  personName: string;
}

export function ArchiveView({ archive, personName }: ArchiveViewProps) {
  return (
    <div className="space-y-8 max-w-3xl">
      {/* Summary */}
      <section>
        <h2 className="text-lg font-semibold text-stone-800 mb-3">总体概述</h2>
        <Card>
          <CardContent className="p-6">
            <p className="text-stone-700 leading-relaxed">{archive.rawSummary}</p>
          </CardContent>
        </Card>
      </section>

      <Separator />

      {/* Values */}
      {archive.values?.length > 0 && (
        <section>
          <h2 className="text-lg font-semibold text-stone-800 mb-3">核心价值观</h2>
          <div className="space-y-3">
            {archive.values.map((v, i) => {
              const w = WEIGHT_LABELS[v.weight] ?? WEIGHT_LABELS.moderate;
              return (
                <Card key={i}>
                  <CardContent className="p-5">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-medium text-stone-900">{v.label}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${w.color}`}>
                        {w.label}
                      </span>
                      <span className="text-xs text-stone-400">
                        {DOMAIN_LABELS[v.domain] ?? v.domain}
                      </span>
                    </div>
                    {v.evidence?.length > 0 && (
                      <ul className="space-y-1">
                        {v.evidence.map((e, j) => (
                          <li key={j} className="text-sm text-stone-600 flex gap-2">
                            <span className="text-stone-300 shrink-0">·</span>
                            <span>{e}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>
      )}

      {/* Scenarios */}
      {archive.scenarios?.length > 0 && (
        <section>
          <h2 className="text-lg font-semibold text-stone-800 mb-3">场景偏好</h2>
          <div className="space-y-3">
            {archive.scenarios.map((s, i) => {
              const c = CONFIDENCE_LABELS[s.confidence] ?? CONFIDENCE_LABELS.inferred;
              return (
                <Card key={i}>
                  <CardContent className="p-5">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs text-stone-400">
                        {DOMAIN_LABELS[s.domain] ?? s.domain}
                      </span>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${c.color}`}>
                        {c.label}
                      </span>
                    </div>
                    <p className="text-sm text-stone-500 mb-1">{s.situation}</p>
                    <p className="text-stone-800 font-medium">{s.preference}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>
      )}

      {/* Quotes */}
      {archive.quotes?.length > 0 && (
        <section>
          <h2 className="text-lg font-semibold text-stone-800 mb-3">
            关键原话 · {personName}
          </h2>
          <div className="space-y-3">
            {archive.quotes.map((q) => (
              <Card key={q.id} className="border-l-4 border-l-sky-300">
                <CardContent className="p-5">
                  <blockquote className="text-stone-800 italic mb-2">
                    「{q.text}」
                  </blockquote>
                  <p className="text-sm text-stone-500">{q.significance}</p>
                  <Badge variant="outline" className="mt-2 text-xs">
                    {DOMAIN_LABELS[q.domain] ?? q.domain}
                  </Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      )}

      {/* Reasoning Patterns */}
      {archive.reasoningPatterns?.length > 0 && (
        <section>
          <h2 className="text-lg font-semibold text-stone-800 mb-3">思维模式</h2>
          <div className="space-y-3">
            {archive.reasoningPatterns.map((r, i) => (
              <Card key={i}>
                <CardContent className="p-5">
                  <p className="font-medium text-stone-900 mb-1">{r.pattern}</p>
                  <p className="text-sm text-stone-500 mb-2">{r.applicability}</p>
                  {r.evidence?.length > 0 && (
                    <ul className="space-y-1">
                      {r.evidence.map((e, j) => (
                        <li key={j} className="text-sm text-stone-600 flex gap-2">
                          <span className="text-stone-300 shrink-0">·</span>
                          <span>{e}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
