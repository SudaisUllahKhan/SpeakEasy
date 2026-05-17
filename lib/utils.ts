import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import type { Level, ScoredWord, WhisperWord } from "@/types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// ─── XP Calculation ───────────────────────────────────────────────────────────

const LEVEL_MULTIPLIER: Record<Level, number> = { A1: 1.0, A2: 1.5, B1: 2.0 };

export function calculateXP(
  pronunciationScore: number,
  fluencyScore: number,
  comprehensionScore: number,
  level: Level,
  isRetry = false
): number {
  const base =
    (pronunciationScore + fluencyScore + comprehensionScore) *
    LEVEL_MULTIPLIER[level];
  return Math.round(isRetry ? base * 0.5 : base);
}

// ─── Score Helpers ────────────────────────────────────────────────────────────

export function calcPronunciationScore(scoredWords: ScoredWord[]): number {
  if (scoredWords.length === 0) return 0;
  const total = scoredWords.length;
  const correctCount = scoredWords.filter((w) => w.label === "CORRECT").length;
  const closeCount = scoredWords.filter((w) => w.label === "CLOSE").length;
  const avgConfidence =
    scoredWords.reduce((acc, w) => acc + w.confidence, 0) / total;
  const wordAccuracyRatio = (correctCount + closeCount * 0.5) / total;
  return Math.min(10, Math.round((wordAccuracyRatio * 0.6 + avgConfidence * 0.4) * 10 * 10) / 10);
}

const WPM_TARGET: Record<Level, number> = { A1: 90, A2: 110, B1: 130 };

export function calcFluencyScore(
  wordsPerMinute: number,
  level: Level,
  pauseCount: number
): number {
  const target = WPM_TARGET[level];
  const ratio = wordsPerMinute / target;
  let score = 10;
  // Only penalise pauses counted as > 3s (natural sentence pauses ≤ 3s are fine)
  // -0.3 per long pause, capped at -2 total
  score -= Math.min(2, pauseCount * 0.3);
  // Penalise rushing only if > 60% above target
  if (ratio > 1.6) score -= (ratio - 1.6) * 5;
  // Penalise only very slow reading (< 55% of target), gently
  if (ratio < 0.55) score -= (0.55 - ratio) * 8;
  return Math.max(1, Math.min(10, Math.round(score * 10) / 10));
}

export function calcComprehensionScore(correct: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((correct / total) * 10 * 10) / 10;
}

// ─── SM-2 Spaced Repetition ───────────────────────────────────────────────────

const SM2_INTERVALS = [1, 3, 7, 14, 30, 60];

export function nextReviewInterval(
  currentInterval: number,
  isCorrect: boolean
): number {
  if (!isCorrect) return 1;
  const currentIdx = SM2_INTERVALS.indexOf(currentInterval);
  const nextIdx = Math.min(currentIdx + 1, SM2_INTERVALS.length - 1);
  return SM2_INTERVALS[nextIdx];
}

export function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

// ─── Levenshtein Word Diff ────────────────────────────────────────────────────

export function diffWords(
  expected: string[],
  actual: string[],
  whisperWords: WhisperWord[]
): ScoredWord[] {
  const result: ScoredWord[] = [];
  const whisperMap = new Map(
    whisperWords.map((w) => [w.word.toLowerCase().replace(/[^a-z]/g, ""), w])
  );

  for (let i = 0; i < expected.length; i++) {
    const exp = expected[i].toLowerCase().replace(/[^a-z]/g, "");
    const act = actual[i]?.toLowerCase().replace(/[^a-z]/g, "") ?? "";
    const whisper = whisperMap.get(act) ?? whisperMap.get(exp);
    const confidence = whisper?.probability ?? 0;

    if (exp === act) {
      result.push({ word: expected[i], label: "CORRECT", confidence });
    } else if (act && levenshtein(exp, act) <= 2) {
      result.push({ word: expected[i], label: "CLOSE", confidence: confidence * 0.7 });
    } else {
      result.push({ word: expected[i], label: "MISSED", confidence: 0 });
    }
  }

  // Mark extra words as ADDED
  for (let i = expected.length; i < actual.length; i++) {
    result.push({ word: actual[i], label: "ADDED", confidence: 0 });
  }

  return result;
}

function levenshtein(a: string, b: string): number {
  const m = a.length, n = b.length;
  const dp = Array.from({ length: m + 1 }, (_, i) =>
    Array.from({ length: n + 1 }, (_, j) => (i === 0 ? j : j === 0 ? i : 0))
  );
  for (let i = 1; i <= m; i++)
    for (let j = 1; j <= n; j++)
      dp[i][j] =
        a[i - 1] === b[j - 1]
          ? dp[i - 1][j - 1]
          : 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
  return dp[m][n];
}

// ─── Streak ───────────────────────────────────────────────────────────────────

export function isSameCalendarDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export function isYesterday(date: Date): boolean {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return isSameCalendarDay(date, yesterday);
}

// ─── Join Code Generator ──────────────────────────────────────────────────────

export function generateJoinCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "SPK-";
  for (let i = 0; i < 3; i++)
    code += chars[Math.floor(Math.random() * chars.length)];
  return code;
}
