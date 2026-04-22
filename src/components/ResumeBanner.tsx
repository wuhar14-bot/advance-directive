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
      aria-label="Previous session detected"
      className="w-full bg-sky-50 border-b border-sky-200 px-6 py-4"
    >
      <div className="max-w-2xl mx-auto flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="flex-1">
          <p className="text-sm font-medium text-stone-900">
            You have a session in progress
          </p>
          <p className="text-sm text-stone-500">
            Would you like to continue where you left off?
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Button
            onClick={onResume}
            className="bg-sky-500 hover:bg-sky-600 text-white border-transparent text-sm"
          >
            Resume session
          </Button>
          <Button variant="ghost" onClick={onStartNew} className="text-sm">
            Start new session
          </Button>
        </div>
      </div>
    </div>
  );
}
