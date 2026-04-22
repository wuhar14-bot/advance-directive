"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSessionStore } from "@/lib/store";
import { AppHeader } from "@/components/AppHeader";
import { QueryResponseView } from "@/components/QueryResponseView";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Loader2, ArrowLeft, Clock } from "lucide-react";
import { QueryEntry, QueryResponse } from "@/lib/types";

export default function QueryPage() {
  const router = useRouter();
  const { session } = useSessionStore();

  const [scenario, setScenario] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [history, setHistory] = useState<QueryEntry[]>([]);
  const [activeEntry, setActiveEntry] = useState<QueryEntry | null>(null);

  useEffect(() => {
    if (!session) router.push("/");
  }, [session, router]);

  if (!session) return null;

  const archive = session.archive;

  if (!archive) {
    return (
      <div className="flex flex-col h-screen bg-stone-50">
        <AppHeader personName={session.person.name} />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center space-y-3">
            <p className="text-stone-500">请先生成意愿档案，再进行决策查询。</p>
            <Button variant="outline" onClick={() => router.push("/interview")}>
              返回访谈
            </Button>
          </div>
        </div>
      </div>
    );
  }

  async function handleAsk() {
    if (!scenario.trim() || !archive) return;
    setLoading(true);
    setError(false);
    try {
      const res = await fetch("/api/query/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scenario, archive, person: session!.person }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      const response: QueryResponse = data.response;
      const entry: QueryEntry = {
        id: crypto.randomUUID(),
        scenario,
        response,
        timestamp: new Date().toISOString(),
      };
      setHistory((prev) => [entry, ...prev]);
      setActiveEntry(entry);
      setScenario("");
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-stone-50">
      <AppHeader personName={session.person.name} />
      <div className="flex flex-1 overflow-hidden">
        {/* History sidebar */}
        <aside className="w-64 flex-shrink-0 bg-stone-100 border-r border-stone-200 flex flex-col p-4 gap-2 overflow-y-auto">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push("/archive")}
            className="justify-start gap-1 mb-2"
          >
            <ArrowLeft className="w-4 h-4" />
            返回档案
          </Button>
          <p className="text-xs font-medium text-stone-500 uppercase tracking-wide px-1">
            查询历史
          </p>
          {history.length === 0 ? (
            <p className="text-xs text-stone-400 px-1 mt-1">暂无查询记录</p>
          ) : (
            history.map((entry) => (
              <button
                key={entry.id}
                onClick={() => setActiveEntry(entry)}
                className={`text-left text-sm px-3 py-2 rounded-md transition-colors ${
                  activeEntry?.id === entry.id
                    ? "bg-sky-100 text-sky-800"
                    : "text-stone-600 hover:bg-stone-200"
                }`}
              >
                <div className="flex items-center gap-1 text-xs text-stone-400 mb-1">
                  <Clock className="w-3 h-3" />
                  {new Date(entry.timestamp).toLocaleTimeString("zh-CN", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </div>
                <p className="line-clamp-2">{entry.scenario}</p>
              </button>
            ))
          )}
        </aside>

        {/* Main */}
        <main className="flex-1 overflow-y-auto p-8">
          <div className="max-w-2xl space-y-6">
            <div>
              <h1 className="text-xl font-semibold text-stone-900 mb-1">
                决策查询
              </h1>
              <p className="text-sm text-stone-500">
                描述您面临的决策场景，系统将根据 {session.person.name} 的意愿档案给出参考。
              </p>
            </div>

            <div className="space-y-3">
              <Textarea
                value={scenario}
                onChange={(e) => setScenario(e.target.value)}
                placeholder="例如：妈妈现在需要插管维持生命，医生说成功率不高，我们该怎么决定？"
                className="min-h-[100px] text-base"
                disabled={loading}
              />
              {error && (
                <p className="text-sm text-red-500">查询失败，请稍后重试。</p>
              )}
              <Button
                onClick={handleAsk}
                disabled={!scenario.trim() || loading}
                className="bg-sky-500 hover:bg-sky-600 text-white gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    查询中...
                  </>
                ) : (
                  "查询档案"
                )}
              </Button>
            </div>

            {activeEntry && (
              <>
                <Separator />
                <QueryResponseView
                  response={activeEntry.response}
                  scenario={activeEntry.scenario}
                />
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
