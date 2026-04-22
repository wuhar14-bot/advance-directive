"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Separator } from "@/components/ui/separator";
import { DomainProgressGrid } from "@/components/DomainProgressGrid";
import { QuestionCard } from "@/components/QuestionCard";
import { ProbePanel } from "@/components/ProbePanel";
import { useSessionStore } from "@/lib/store";
import { DomainKey } from "@/lib/types";

interface Question {
  id: string;
  text: string;
}

function LoadingSkeleton() {
  return (
    <div className="animate-pulse space-y-4">
      <div className="h-8 bg-stone-200 rounded w-3/4" />
      <div className="h-32 bg-stone-200 rounded" />
      <div className="h-10 bg-stone-200 rounded w-1/3" />
    </div>
  );
}

function AppHeader({ personName }: { personName?: string }) {
  return (
    <header className="h-14 flex items-center px-6 border-b border-stone-200 bg-white shrink-0">
      <span className="text-sm font-medium text-stone-700">
        AI Advance Directive
        {personName && (
          <span className="text-stone-400 ml-2">— {personName}</span>
        )}
      </span>
    </header>
  );
}

const DOMAIN_ORDER: DomainKey[] = [
  "medical",
  "financial",
  "daily",
  "relationships",
  "end-of-life",
];

export default function InterviewPage() {
  const router = useRouter();
  const {
    session,
    updateAnswer,
    setDomainStatus,
    setCurrentDomain,
    setCurrentQuestionIndex,
  } = useSessionStore();

  const [questions, setQuestions] = useState<Question[]>([]);
  const [probes, setProbes] = useState<string[]>([]);
  const [probesLoading, setProbesLoading] = useState(false);
  const [probesError, setProbesError] = useState(false);
  const [selectedProbe, setSelectedProbe] = useState("");

  useEffect(() => {
    if (!session) {
      router.push("/");
    }
  }, [session, router]);

  if (!session) return null;

  const currentDomain = session.currentDomain;
  const currentIndex = session.currentQuestionIndex;
  const currentQuestion = questions[currentIndex];
  const currentAnswer =
    session.transcript[currentDomain]?.find(
      (t) => t.questionId === currentQuestion?.id
    )?.answer ?? "";

  function handleAnswerChange(value: string) {
    if (!currentQuestion) return;
    updateAnswer(currentDomain, currentQuestion.id, currentQuestion.text, value);
  }

  function handleNext() {
    if (currentIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentIndex + 1);
    } else {
      setDomainStatus(currentDomain, "complete");
    }
    // Placeholder for Plan 04 probe generation
    setProbesLoading(true);
    setProbesError(false);
    setTimeout(() => setProbesLoading(false), 500);
  }

  function handlePrevious() {
    if (currentIndex > 0) {
      setCurrentQuestionIndex(currentIndex - 1);
    }
  }

  function handleSelectDomain(domain: DomainKey) {
    setCurrentDomain(domain);
    setProbes([]);
    setProbesError(false);
    setSelectedProbe("");
  }

  function handleSkipDomain(domain: DomainKey) {
    setDomainStatus(domain, "skipped");
    if (!session) return;
    // Advance to next non-skipped domain
    const currentIdx = DOMAIN_ORDER.indexOf(domain);
    for (let i = currentIdx + 1; i < DOMAIN_ORDER.length; i++) {
      const next = DOMAIN_ORDER[i];
      if (
        session.domainStatus[next] !== "skipped" &&
        session.domainStatus[next] !== "complete"
      ) {
        setCurrentDomain(next);
        return;
      }
    }
  }

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-stone-50">
      <AppHeader personName={session.person.name} />
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside className="w-64 flex-shrink-0 bg-stone-100 border-r border-stone-200 flex flex-col p-4 gap-2">
          <DomainProgressGrid
            currentDomain={session.currentDomain}
            domainStatus={session.domainStatus}
            onSelectDomain={handleSelectDomain}
            onSkipDomain={handleSkipDomain}
          />
        </aside>

        {/* Main */}
        <main className="flex-1 overflow-y-auto p-8">
          <section aria-label="Current question" className="max-w-2xl">
            {questions.length === 0 ? (
              <LoadingSkeleton />
            ) : (
              <>
                <QuestionCard
                  questionId={currentQuestion.id}
                  questionText={currentQuestion.text}
                  answer={currentAnswer}
                  onAnswerChange={handleAnswerChange}
                  onNext={handleNext}
                  onPrevious={handlePrevious}
                  hasPrevious={currentIndex > 0}
                  hasNext={currentIndex < questions.length - 1}
                  isLoadingNext={probesLoading}
                />
                <Separator className="my-6" />
                <ProbePanel
                  probes={probes}
                  isLoading={probesLoading}
                  hasError={probesError}
                  onProbeClick={setSelectedProbe}
                />
              </>
            )}
          </section>
        </main>
      </div>
    </div>
  );
}
