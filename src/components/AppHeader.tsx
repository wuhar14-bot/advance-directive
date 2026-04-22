"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useSessionStore } from "@/lib/store";
import { exportSessionToFile } from "@/lib/session";

interface AppHeaderProps {
  personName?: string;
}

function AutoSaveIndicator() {
  const lastSavedAt = useSessionStore((s) => s.lastSavedAt);
  const [faded, setFaded] = useState(false);

  useEffect(() => {
    if (!lastSavedAt) return;
    setFaded(true);
    const timer = setTimeout(() => setFaded(false), 300);
    return () => clearTimeout(timer);
  }, [lastSavedAt]);

  if (!lastSavedAt) return null;

  const time = new Date(lastSavedAt).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <span
      aria-live="polite"
      aria-label="Auto-save status"
      className={`text-sm text-green-600 transition-opacity duration-300 ${faded ? "opacity-50" : "opacity-100"}`}
    >
      已保存 · {time}
    </span>
  );
}

export function AppHeader({ personName }: AppHeaderProps) {
  const session = useSessionStore((s) => s.session);

  function handleExport() {
    if (!session) {
      alert("暂无内容可导出，请先完成至少一个问题的回答。");
      return;
    }
    exportSessionToFile(session);
  }

  return (
    <header className="h-14 bg-white border-b border-stone-200 flex items-center px-6 shrink-0">
      {/* Left: app name */}
      <span className="text-sm font-semibold text-stone-700">
        意定监护访谈
      </span>

      {/* Center: person name */}
      <div className="flex-1 flex justify-center">
        {personName && (
          <span className="text-sm text-stone-500">{personName}</span>
        )}
      </div>

      {/* Right: auto-save + export */}
      <div className="flex items-center gap-4">
        <AutoSaveIndicator />
        <Button variant="outline" onClick={handleExport} className="text-sm">
          导出会话
        </Button>
      </div>
    </header>
  );
}
