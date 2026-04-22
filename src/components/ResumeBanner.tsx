"use client";

import { Button } from "@/components/ui/button";

interface ResumeBannerProps {
  onResume: () => void;
  onStartNew: () => void;
}

export function ResumeBanner({ onResume, onStartNew }: ResumeBannerProps) {
  return (
    <div
      role="banner"
      aria-label="检测到未完成的会话"
      className="w-full bg-sky-50 border-b border-sky-200 px-6 py-4"
    >
      <div className="max-w-2xl mx-auto flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="flex-1">
          <p className="text-sm font-medium text-stone-900">
            您有一个未完成的访谈
          </p>
          <p className="text-sm text-stone-500">
            是否继续上次的访谈？
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Button
            onClick={onResume}
            className="bg-sky-500 hover:bg-sky-600 text-white border-transparent text-sm"
          >
            继续访谈
          </Button>
          <Button variant="ghost" onClick={onStartNew} className="text-sm">
            新建访谈
          </Button>
        </div>
      </div>
    </div>
  );
}
