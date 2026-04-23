"use client";

import { useState, useEffect } from "react";
import { Loader2, PenLine } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

const OTHER_OPTION = "以上都不太符合，我想说…";

interface QuestionCardProps {
  questionId: string;
  questionText: string;
  options: string[];
  answer: string;
  onAnswerChange: (value: string) => void;
  onNext: () => void;
  onPrevious: () => void;
  hasPrevious: boolean;
  hasNext: boolean;
  isLoadingNext?: boolean;
}

export function QuestionCard({
  questionId,
  questionText,
  options,
  answer,
  onAnswerChange,
  onNext,
  onPrevious,
  hasPrevious,
  hasNext,
  isLoadingNext = false,
}: QuestionCardProps) {
  const [showEmptyError, setShowEmptyError] = useState(false);
  const [isCustomMode, setIsCustomMode] = useState(false);
  const [customText, setCustomText] = useState("");

  const selectableOptions = options.filter((o) => o !== OTHER_OPTION);
  const hasOtherOption = options.some((o) => o === OTHER_OPTION);

  useEffect(() => {
    if (!answer) {
      setIsCustomMode(false);
      setCustomText("");
      return;
    }
    const matchesOption = selectableOptions.some((o) => o === answer);
    if (matchesOption) {
      setIsCustomMode(false);
      setCustomText("");
    } else {
      setIsCustomMode(true);
      setCustomText(answer);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [questionId]);

  function handleSelectOption(optionText: string) {
    setShowEmptyError(false);
    setIsCustomMode(false);
    setCustomText("");
    onAnswerChange(optionText);
  }

  function handleSelectOther() {
    setShowEmptyError(false);
    setIsCustomMode(true);
    onAnswerChange(customText);
  }

  function handleCustomTextChange(value: string) {
    setCustomText(value);
    if (value.trim()) setShowEmptyError(false);
    onAnswerChange(value);
  }

  function handleNext() {
    if (!answer.trim()) {
      setShowEmptyError(true);
      return;
    }
    setShowEmptyError(false);
    onNext();
  }

  const hasOptions = selectableOptions.length > 0;

  return (
    <Card className="max-w-2xl">
      <CardContent className="p-8">
        <p
          id="question-text"
          className="text-2xl font-semibold text-stone-900 leading-snug mb-6"
        >
          {questionText}
        </p>

        {hasOptions ? (
          <div role="radiogroup" aria-label="回答选项" className="space-y-3 mb-4">
            {selectableOptions.map((option, i) => {
              const isSelected = !isCustomMode && answer === option;
              return (
                <button
                  key={i}
                  role="radio"
                  aria-checked={isSelected}
                  onClick={() => handleSelectOption(option)}
                  className={`w-full text-left p-4 rounded-xl transition-all duration-150 cursor-pointer ${
                    isSelected
                      ? "border-2 border-sky-500 bg-sky-50 text-stone-900"
                      : "border border-stone-200 bg-white text-stone-700 hover:border-stone-300 hover:bg-stone-50"
                  }`}
                >
                  <span className="flex items-start gap-3">
                    <span
                      className={`mt-0.5 w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center ${
                        isSelected ? "border-sky-500" : "border-stone-300"
                      }`}
                    >
                      {isSelected && (
                        <span className="w-2.5 h-2.5 rounded-full bg-sky-500" />
                      )}
                    </span>
                    <span className="text-base leading-relaxed">{option}</span>
                  </span>
                </button>
              );
            })}

            {hasOtherOption && (
              <button
                role="radio"
                aria-checked={isCustomMode}
                onClick={handleSelectOther}
                className={`w-full text-left p-4 rounded-xl transition-all duration-150 cursor-pointer ${
                  isCustomMode
                    ? "border-2 border-sky-500 bg-sky-50 text-stone-900"
                    : "border border-stone-200 bg-white text-stone-700 hover:border-stone-300 hover:bg-stone-50"
                }`}
              >
                <span className="flex items-start gap-3">
                  <PenLine
                    className={`mt-0.5 w-5 h-5 flex-shrink-0 ${
                      isCustomMode ? "text-sky-500" : "text-stone-400"
                    }`}
                  />
                  <span className="text-base leading-relaxed">
                    {OTHER_OPTION}
                  </span>
                </span>
              </button>
            )}

            {isCustomMode && (
              <div className="pl-8 animate-in slide-in-from-top-2 duration-200">
                <Textarea
                  aria-label="自定义回答"
                  value={customText}
                  onChange={(e) => handleCustomTextChange(e.target.value)}
                  placeholder="在此输入老人的回答…"
                  className="min-h-[100px] text-base"
                  autoFocus
                />
              </div>
            )}
          </div>
        ) : (
          <Textarea
            aria-label="回答"
            aria-describedby="question-text"
            value={answer}
            onChange={(e) => {
              if (e.target.value.trim()) setShowEmptyError(false);
              onAnswerChange(e.target.value);
            }}
            placeholder="在此输入老人的回答…"
            className="min-h-[120px] text-base mb-4"
          />
        )}

        {showEmptyError && (
          <p role="alert" className="text-red-500 text-sm mt-1 mb-2">
            请先选择或输入回答再继续
          </p>
        )}

        <div className="flex gap-3 mt-4">
          <Button
            variant="outline"
            onClick={onPrevious}
            disabled={!hasPrevious}
          >
            上一题
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
                保存中...
              </>
            ) : hasNext ? (
              "下一题"
            ) : (
              "完成此领域"
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
