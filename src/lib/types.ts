export type DomainKey = "medical" | "financial" | "daily" | "relationships" | "end-of-life";
export type DomainStatus = "not-started" | "in-progress" | "complete" | "skipped";

export interface Turn {
  questionId: string;
  questionText: string;
  answer: string;
  followUpProbes?: string[];
  followUpAnswers?: string[];
  timestamp: string;
}

export interface ValueEntry {
  label: string;
  weight: "core" | "strong" | "moderate";
  evidence: string[];
  domain: DomainKey;
}

export interface ScenarioEntry {
  domain: DomainKey;
  situation: string;
  preference: string;
  confidence: "explicit" | "inferred";
  sourceQuoteId?: string;
}

export interface QuoteEntry {
  id: string;
  domain: DomainKey;
  text: string;
  significance: string;
}

export interface ReasoningPattern {
  pattern: string;
  applicability: string;
  evidence: string[];
}

export interface Archive {
  values: ValueEntry[];
  scenarios: ScenarioEntry[];
  quotes: QuoteEntry[];
  reasoningPatterns: ReasoningPattern[];
  rawSummary: string;
}

export interface SessionData {
  id: string;
  createdAt: string;
  person: {
    name: string;
    age: number;
    backgroundNotes: string;
  };
  transcript: Partial<Record<DomainKey, Turn[]>>;
  domainStatus: Record<DomainKey, DomainStatus>;
  currentDomain: DomainKey;
  currentQuestionIndex: number;
  archiveGeneratedAt?: string;
  archive?: Archive;
}
