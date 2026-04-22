import { create } from "zustand";
import { persist } from "zustand/middleware";
import { SessionData, DomainKey, DomainStatus, Turn, Archive } from "./types";

const DOMAIN_KEYS: DomainKey[] = [
  "medical",
  "financial",
  "daily",
  "relationships",
  "end-of-life",
];

function emptyDomainStatus(): Record<DomainKey, DomainStatus> {
  return Object.fromEntries(
    DOMAIN_KEYS.map((d) => [d, "not-started"])
  ) as Record<DomainKey, DomainStatus>;
}

interface SessionStore {
  session: SessionData | null;
  lastSavedAt: string | null;
  createSession: (person: SessionData["person"]) => SessionData;
  loadSession: (data: SessionData) => void;
  clearSession: () => void;
  updateAnswer: (
    domain: DomainKey,
    questionId: string,
    questionText: string,
    answer: string
  ) => void;
  setDomainStatus: (domain: DomainKey, status: DomainStatus) => void;
  setCurrentDomain: (domain: DomainKey) => void;
  setCurrentQuestionIndex: (index: number) => void;
  addFollowUpProbes: (
    domain: DomainKey,
    questionId: string,
    probes: string[]
  ) => void;
  setArchive: (archive: Archive) => void;
}

export const useSessionStore = create<SessionStore>()(
  persist(
    (set, get) => ({
      session: null,
      lastSavedAt: null,

      createSession: (person) => {
        const session: SessionData = {
          id: crypto.randomUUID(),
          createdAt: new Date().toISOString(),
          person,
          transcript: {},
          domainStatus: emptyDomainStatus(),
          currentDomain: "medical",
          currentQuestionIndex: 0,
        };
        set({ session, lastSavedAt: new Date().toISOString() });
        return session;
      },

      loadSession: (data) =>
        set({ session: data, lastSavedAt: new Date().toISOString() }),

      clearSession: () => set({ session: null, lastSavedAt: null }),

      updateAnswer: (domain, questionId, questionText, answer) => {
        const { session } = get();
        if (!session) return;
        const turns: Turn[] = session.transcript[domain] ?? [];
        const existingIdx = turns.findIndex((t) => t.questionId === questionId);
        const turn: Turn = {
          questionId,
          questionText,
          answer,
          timestamp: new Date().toISOString(),
          followUpProbes:
            existingIdx >= 0
              ? turns[existingIdx].followUpProbes
              : undefined,
          followUpAnswers:
            existingIdx >= 0
              ? turns[existingIdx].followUpAnswers
              : undefined,
        };
        const updated =
          existingIdx >= 0
            ? turns.map((t, i) => (i === existingIdx ? turn : t))
            : [...turns, turn];
        const newStatus: DomainStatus =
          session.domainStatus[domain] === "not-started"
            ? "in-progress"
            : session.domainStatus[domain];
        set({
          session: {
            ...session,
            transcript: { ...session.transcript, [domain]: updated },
            domainStatus: {
              ...session.domainStatus,
              [domain]: newStatus,
            },
          },
          lastSavedAt: new Date().toISOString(),
        });
      },

      setDomainStatus: (domain, status) => {
        const { session } = get();
        if (!session) return;
        set({
          session: {
            ...session,
            domainStatus: { ...session.domainStatus, [domain]: status },
          },
        });
      },

      setCurrentDomain: (domain) => {
        const { session } = get();
        if (!session) return;
        set({
          session: {
            ...session,
            currentDomain: domain,
            currentQuestionIndex: 0,
          },
        });
      },

      setCurrentQuestionIndex: (index) => {
        const { session } = get();
        if (!session) return;
        set({ session: { ...session, currentQuestionIndex: index } });
      },

      addFollowUpProbes: (domain, questionId, probes) => {
        const { session } = get();
        if (!session) return;
        const turns: Turn[] = session.transcript[domain] ?? [];
        const updated = turns.map((t) =>
          t.questionId === questionId ? { ...t, followUpProbes: probes } : t
        );
        set({
          session: {
            ...session,
            transcript: { ...session.transcript, [domain]: updated },
          },
        });
      },

      setArchive: (archive) => {
        const { session } = get();
        if (!session) return;
        set({
          session: {
            ...session,
            archive,
            archiveGeneratedAt: new Date().toISOString(),
          },
          lastSavedAt: new Date().toISOString(),
        });
      },
    }),
    {
      name: "advance-directive-session",
      partialize: (state) => ({ session: state.session }),
    }
  )
);

/** Convenience hook: returns the current session (may be null) */
export function useCurrentSession() {
  return useSessionStore((s) => s.session);
}
