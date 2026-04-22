"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

interface QuestionCardProps {
  questionId: string;
  questionText: string;
  answer: string;
  onAnswerChange: (value: string) => void;
  onNext: () => void;
  onPrevious: () => void;
  hasPrevious: boolean;
  hasNext: boolean;
  isLoadingNext?: boolean;
}

export function QuestionCard({
  questionId: _questionId,
  questionText,
  answer,
  onAnswerChange,
  onNext,
  onPrevious,
  hasPrevious,
  hasNext,
  isLoadingNext = false,
}: QuestionCardProps) {
  const [showEmptyError, setShowEmptyError] = useState(false);

  function handleNext() {
    if (!answer.trim()) {
      setShowEmptyError(true);
      return;
    }
    setShowEmptyError(false);
    onNext();
  }

  function handleAnswerChange(value: string) {
    if (value.trim()) setShowEmptyError(false);
    onAnswerChange(value);
  }

  return (
    <Card className="max-w-2xl">
      <CardContent className="p-8">
        <p
          id="question-text"
          className="text-2xl font-semibold text-stone-900 leading-snug mb-6"
        >
          {questionText}
        </p>

        <Textarea
          aria-label="Answer"
          aria-describedby="question-text"
          value={answer}
          onChange={(e) => handleAnswerChange(e.target.value)}
          placeholder="Type the person's answer here…"
          className="min-h-[120px] text-base"
        />

        {showEmptyError && (
          <p role="alert" className="text-red-500 text-sm mt-1">
            Please enter an answer before continuing
          </p>
        )}

        <div className="flex gap-3 mt-6">
          <Button
            variant="outline"
            onClick={onPrevious}
            disabled={!hasPrevious}
          >
            Previous
          </Button>
          <Button
            onClick={handleNext}
            disabled={!answer.trim() || isLoadingNext}
            aria-busy={isLoadingNext}
            className="bg-sky-500 hover:bg-sky-600 text-white"
          >
            {isLoadingNext ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                Saving...
              </>
            ) : hasNext ? (
              "Next Question"
            ) : (
              "Finish Domain"
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
