"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useSessionStore } from "@/lib/store";
import { loadSessionFromFile } from "@/lib/session";

export function SetupForm() {
  const router = useRouter();
  const { createSession, loadSession } = useSessionStore();

  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [backgroundNotes, setBackgroundNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [fileError, setFileError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const isValid = name.trim().length > 0 && age.trim().length > 0;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!isValid || loading) return;
    setLoading(true);
    createSession({ name: name.trim(), age: Number(age), backgroundNotes });
    router.push("/interview");
  }

  function handleResumeFromFile() {
    setFileError(null);
    fileInputRef.current?.click();
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const data = await loadSessionFromFile(file);
    if (!data) {
      setFileError(
        "文件格式不正确，请选择有效的会话文件。"
      );
      // Reset file input so same file can be re-selected after error
      e.target.value = "";
      return;
    }
    loadSession(data);
    router.push("/interview");
  }

  return (
    <div className="min-h-screen flex flex-col bg-stone-50">
      <div className="flex-1 flex items-center justify-center px-6 py-16">
        <div className="w-full max-w-lg">
          <h1 className="text-[28px] font-semibold text-stone-900 mb-8 text-center">
            意定监护访谈
          </h1>

          <Card className="p-8">
            <CardContent className="p-0">
              <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                {/* Name field */}
                <div className="flex flex-col gap-1.5">
                  <label
                    htmlFor="person-name"
                    className="text-sm font-medium text-stone-700"
                  >
                    姓名
                  </label>
                  <input
                    id="person-name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full rounded-md border border-stone-200 bg-white px-3 py-2 text-base text-stone-900 placeholder:text-stone-400 outline-none focus-visible:border-sky-500 focus-visible:ring-2 focus-visible:ring-sky-500/30 transition-[border-color,box-shadow]"
                    placeholder="老人姓名"
                    autoComplete="off"
                  />
                </div>

                {/* Age field */}
                <div className="flex flex-col gap-1.5">
                  <label
                    htmlFor="person-age"
                    className="text-sm font-medium text-stone-700"
                  >
                    年龄
                  </label>
                  <input
                    id="person-age"
                    type="number"
                    min="1"
                    max="120"
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    className="w-full rounded-md border border-stone-200 bg-white px-3 py-2 text-base text-stone-900 placeholder:text-stone-400 outline-none focus-visible:border-sky-500 focus-visible:ring-2 focus-visible:ring-sky-500/30 transition-[border-color,box-shadow]"
                    placeholder="例如：78"
                  />
                </div>

                {/* Background field */}
                <div className="flex flex-col gap-1.5">
                  <label
                    htmlFor="person-background"
                    className="text-sm font-medium text-stone-700"
                  >
                    简要背景
                  </label>
                  <Textarea
                    id="person-background"
                    rows={4}
                    value={backgroundNotes}
                    onChange={(e) => setBackgroundNotes(e.target.value)}
                    placeholder="简单介绍老人的生活经历、健康状况和家庭情况，帮助生成更贴切的问题。"
                    className="text-base text-stone-900 min-h-[96px]"
                  />
                </div>

                {/* Begin Interview button */}
                <Button
                  type="submit"
                  disabled={!isValid || loading}
                  aria-busy={loading}
                  className="w-full bg-sky-500 hover:bg-sky-600 text-white border-transparent h-10 text-sm font-medium"
                >
                  {loading ? (
                    <>
                      <Loader2
                        className="w-4 h-4 animate-spin mr-2"
                        aria-label="加载中"
                      />
                      准备访谈中...
                    </>
                  ) : (
                    "开始访谈"
                  )}
                </Button>

                {/* Resume from file */}
                <div className="flex flex-col items-center gap-1">
                  <button
                    type="button"
                    onClick={handleResumeFromFile}
                    className="text-stone-500 text-sm underline hover:text-stone-700 transition-colors"
                  >
                    从文件恢复
                  </button>
                  {fileError && (
                    <p role="alert" className="text-red-600 text-sm mt-1 text-center">
                      {fileError}
                    </p>
                  )}
                </div>

                {/* Hidden file input */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".json"
                  onChange={handleFileChange}
                  className="hidden"
                  aria-hidden="true"
                />
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
