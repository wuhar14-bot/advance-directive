"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSessionStore } from "@/lib/store";
import { AppHeader } from "@/components/AppHeader";
import { ArchiveView } from "@/components/ArchiveView";
import { Button } from "@/components/ui/button";
import { Download, ArrowLeft, MessageSquare } from "lucide-react";

export default function ArchivePage() {
  const router = useRouter();
  const { session } = useSessionStore();

  useEffect(() => {
    if (!session) router.push("/");
  }, [session, router]);

  if (!session) return null;

  const archive = session.archive;

  function handleExport() {
    if (!archive) return;
    const blob = new Blob(
      [JSON.stringify({ person: session!.person, archive, generatedAt: session!.archiveGeneratedAt }, null, 2)],
      { type: "application/json" }
    );
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${session!.person.name}-意定监护档案.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-stone-50">
      <AppHeader personName={session.person.name} />
      <div className="flex-1 overflow-y-auto p-8">
        <div className="max-w-3xl">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push("/interview")}
                className="gap-1"
              >
                <ArrowLeft className="w-4 h-4" />
                返回访谈
              </Button>
              <h1 className="text-xl font-semibold text-stone-900">
                意定监护档案 · {session.person.name}
              </h1>
            </div>
            {archive && (
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  onClick={() => router.push("/query")}
                  className="gap-1 bg-sky-500 hover:bg-sky-600 text-white"
                >
                  <MessageSquare className="w-4 h-4" />
                  决策查询
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleExport}
                  className="gap-1"
                >
                  <Download className="w-4 h-4" />
                  导出 JSON
                </Button>
              </div>
            )}
          </div>

          {!archive ? (
            <div className="text-stone-500 text-sm">档案尚未生成。</div>
          ) : (
            <ArchiveView archive={archive} personName={session.person.name} />
          )}
        </div>
      </div>
    </div>
  );
}
