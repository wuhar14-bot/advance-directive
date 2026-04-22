"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AppHeader } from "@/components/AppHeader";
import { ResumeBanner } from "@/components/ResumeBanner";
import { SetupForm } from "@/components/SetupForm";
import { useSessionStore } from "@/lib/store";

export default function Home() {
  const router = useRouter();
  const session = useSessionStore((s) => s.session);
  const clearSession = useSessionStore((s) => s.clearSession);

  const [bannerDismissed, setBannerDismissed] = useState(false);

  const showBanner = !!session && !bannerDismissed;

  function handleResume() {
    router.push("/interview");
  }

  function handleStartNew() {
    clearSession();
    setBannerDismissed(true);
  }

  return (
    <div className="min-h-screen flex flex-col bg-stone-50">
      <AppHeader />
      {showBanner && (
        <ResumeBanner onResume={handleResume} onStartNew={handleStartNew} />
      )}
      <SetupForm />
    </div>
  );
}
