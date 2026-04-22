"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Separator } from "@/components/ui/separator";
import { DomainProgressGrid } from "@/components/DomainProgressGrid";
import { QuestionCard } from "@/components/QuestionCard";
import { ProbePanel } from "@/components/ProbePanel";
import { Button } from "@/components/ui/button";
import { useSessionStore } from "@/lib/store";
import { AppHeader } from "@/components/AppHeader";
import { DomainKey, SessionData, Turn } from "@/lib/types";

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
    addFollowUpProbes,
  } = useSessionStore();

  const [questions, setQuestions] = useState<Question[]>([]);
  const [questionsLoading, setQuestionsLoading] = useState(false);
  const [questionsError, setQuestionsError] = useState(false);
  const [probes, setProbes] = useState<string[]>([]);
  const [probesLoading, setProbesLoading] = useState(false);
  const [probesError, setProbesError] = useState(false);
  const [selectedProbe, setSelectedProbe] = useState("");

  useEffect(() => {
    if (!session) {
      router.push("/");
    }
  }, [session, router]);

  const fetchQuestionsForDomain = useCallback(
    async (
      domain: DomainKey,
      person: SessionData["person"],
      completedDomains: DomainKey[]
    ) => {
      setQuestionsLoading(true);
      setQuestionsError(false);
      try {
        const res = await fetch("/api/interview/questions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ domain, person, completedDomains }),
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        setQuestions(data.questions ?? []);
      } catch {
        setQuestionsError(true);
        setQuestions([]);
      } finally {
        setQuestionsLoading(false);
      }
    },
    []
  );

  const fetchProbes = useCallback(
    async (
      domain: DomainKey,
      questionId: string,
      question: string,
      answer: string,
      previousTurns: Turn[]
    ) => {
      setProbesLoading(true);
      setProbesError(false);
      setProbes([]);
      try {
        const res = await fetch("/api/interview/followup", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            domain,
            question,
            answer,
            previousTurns: previousTurns.slice(-3),
          }),
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        const fetched: string[] = data.probes ?? [];
        setProbes(fetched);
        if (fetched.length > 0) {
          addFollowUpProbes(domain, questionId, fetched);
        }
      } catch {
        setProbesError(true);
      } finally {
        setProbesLoading(false);
      }
    },
    [addFollowUpProbes]
  );

  // Fetch questions when domain changes (lazy: only if no questions loaded)
  useEffect(() => {
    if (!session) return;
    if (questions.length === 0 && !questionsLoading) {
      const domain = session.currentDomain;
      const completedDomains = (
        Object.keys(session.domainStatus) as DomainKey[]
      ).filter((d) => session.domainStatus[d] === "complete");
      fetchQuestionsForDomain(domain, session.person, completedDomains);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.currentDomain]);

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
    if (!currentQuestion) return;
    if (currentIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentIndex + 1);
    } else {
      setDomainStatus(currentDomain, "complete");
    }
    // Fire probe generation async — does NOT block navigation
    const turns = session!.transcript[currentDomain] ?? [];
    fetchProbes(
      currentDomain,
      currentQuestion.id,
      currentQuestion.text,
      currentAnswer,
      turns
    );
  }

  function handlePrevious() {
    if (currentIndex > 0) {
      setCurrentQuestionIndex(currentIndex - 1);
    }
  }

  function handleSelectDomain(domain: DomainKey) {
    setCurrentDomain(domain);
    setQuestions([]);
    setQuestionsError(false);
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
            {questionsError ? (
              <div className="space-y-4">
                <p className="text-stone-500">
                  Could not load questions. Check your connection and try again.
                </p>
                <Button
                  variant="outline"
                  onClick={() =>
                    fetchQuestionsForDomain(
                      session.currentDomain,
                      session.person,
                      (Object.keys(session.domainStatus) as DomainKey[]).filter(
                        (d) => session.domainStatus[d] === "complete"
                      )
                    )
                  }
                >
                  Try again
                </Button>
              </div>
            ) : questionsLoading || questions.length === 0 ? (
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
