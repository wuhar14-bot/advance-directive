import { SessionData } from "./types";

export function generateSessionId(): string {
  return crypto.randomUUID();
}

export function exportSessionToFile(session: SessionData): void {
  const date = new Date().toISOString().split("T")[0];
  const name = session.person.name.replace(/\s+/g, "-").toLowerCase();
  const filename = `advance-directive-${name}-${date}.json`;
  const blob = new Blob([JSON.stringify(session, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export async function loadSessionFromFile(
  file: File
): Promise<SessionData | null> {
  try {
    const text = await file.text();
    const data = JSON.parse(text);
    // Minimal validation: must have id, person, transcript
    if (!data.id || !data.person || !data.transcript) return null;
    return data as SessionData;
  } catch {
    return null;
  }
}
