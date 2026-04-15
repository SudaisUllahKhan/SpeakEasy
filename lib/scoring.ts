import type { Level, WordStatus } from '@prisma/client'

// ── Target WPM by level ───────────────────────────────────────────────────────
export const TARGET_WPM: Record<Level, number> = {
  A1: 90,
  A2: 110,
  B1: 130,
}

// ── Level XP multipliers ─────────────────────────────────────────────────────
export const LEVEL_MULTIPLIER: Record<Level, number> = {
  A1: 1.0,
  A2: 1.5,
  B1: 2.0,
}

// ── SM-2 review intervals (days) ─────────────────────────────────────────────
export const SM2_INTERVALS = [1, 3, 7, 14, 30, 60] as const
export const MASTERY_THRESHOLD = 5 // consecutive correct to mark as mastered

// ── Pronunciation Score (1–10) ───────────────────────────────────────────────
// = (wordAccuracyRatio * 0.6 + avgWhisperConfidence * 0.4) * 10
export interface WordScoreInput {
  status: WordStatus
  confidence: number // 0–1 from Whisper
}

export function calculatePronunciationScore(
  words: WordScoreInput[],
  avgWhisperConfidence: number
): number {
  if (words.length === 0) return 0

  const correct = words.filter((w) => w.status === 'CORRECT').length
  const close   = words.filter((w) => w.status === 'CLOSE').length
  const total   = words.length

  const wordAccuracyRatio = (correct + close * 0.5) / total
  const raw = (wordAccuracyRatio * 0.6 + avgWhisperConfidence * 0.4) * 10

  return clamp(Math.round(raw * 10) / 10, 1, 10)
}

// ── Fluency Score (1–10) ─────────────────────────────────────────────────────
// Based on WPM vs target, pause frequency, rushing detection
export interface FluencyInput {
  wpm: number
  level: Level
  longPauseCount: number // pauses > 2 seconds
  totalWords: number
}

export function calculateFluencyScore({
  wpm,
  level,
  longPauseCount,
  totalWords,
}: FluencyInput): number {
  const target = TARGET_WPM[level]

  // WPM component: full score at target, penalise deviation
  const wpmRatio = wpm / target
  let wpmScore: number

  if (wpmRatio >= 0.85 && wpmRatio <= 1.5) {
    wpmScore = 10 // within acceptable range
  } else if (wpmRatio < 0.85) {
    wpmScore = Math.max(1, 10 * (wpmRatio / 0.85))
  } else {
    // rushing (> 50% above target)
    wpmScore = Math.max(4, 10 - (wpmRatio - 1.5) * 10)
  }

  // Pause penalty: -0.5 per long pause, max -3
  const pausePenalty = Math.min(3, longPauseCount * 0.5)

  const raw = wpmScore - pausePenalty
  return clamp(Math.round(raw * 10) / 10, 1, 10)
}

// ── Comprehension Score (1–10) ────────────────────────────────────────────────
export function calculateComprehensionScore(
  correctAnswers: number,
  totalQuestions: number
): number {
  if (totalQuestions === 0) return 10
  return clamp(Math.round((correctAnswers / totalQuestions) * 100) / 10, 1, 10)
}

// ── XP per lesson ────────────────────────────────────────────────────────────
export function calculateXp(
  pronunciationScore: number,
  fluencyScore: number,
  comprehensionScore: number,
  level: Level,
  isRetry: boolean
): number {
  const base = (pronunciationScore + fluencyScore + comprehensionScore) * LEVEL_MULTIPLIER[level]
  const xp = Math.round(isRetry ? base * 0.5 : base)
  return Math.max(1, xp)
}

// ── SM-2 next review ─────────────────────────────────────────────────────────
export interface Sm2State {
  timesCorrect: number
  timesIncorrect: number
  interval: number     // current interval index in SM2_INTERVALS
  easeFactor: number   // default 2.5
}

export function sm2NextReview(
  state: Sm2State,
  isCorrect: boolean
): { nextReviewAt: Date; interval: number; easeFactor: number; isMastered: boolean } {
  let { timesCorrect, interval, easeFactor } = state

  if (!isCorrect) {
    // Reset on failure
    return {
      nextReviewAt: addDays(new Date(), 1),
      interval: 0,
      easeFactor: Math.max(1.3, easeFactor - 0.2),
      isMastered: false,
    }
  }

  timesCorrect += 1
  const isMastered = timesCorrect >= MASTERY_THRESHOLD

  const nextIntervalIdx = Math.min(interval + 1, SM2_INTERVALS.length - 1)
  const days = SM2_INTERVALS[nextIntervalIdx]
  const newEaseFactor = Math.min(2.5, easeFactor + 0.1)

  return {
    nextReviewAt: addDays(new Date(), days),
    interval: nextIntervalIdx,
    easeFactor: newEaseFactor,
    isMastered,
  }
}

// ── Streak helpers ────────────────────────────────────────────────────────────
export function isStreakActive(lastStreakDate: Date | null): boolean {
  if (!lastStreakDate) return false
  const today = startOfDay(new Date())
  const last  = startOfDay(lastStreakDate)
  const diffMs = today.getTime() - last.getTime()
  const diffDays = diffMs / (1000 * 60 * 60 * 24)
  return diffDays <= 1
}

// ── Utilities ─────────────────────────────────────────────────────────────────
function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value))
}

function addDays(date: Date, days: number): Date {
  const d = new Date(date)
  d.setDate(d.getDate() + days)
  return d
}

function startOfDay(date: Date): Date {
  const d = new Date(date)
  d.setHours(0, 0, 0, 0)
  return d
}

// ── Difficult word threshold ──────────────────────────────────────────────────
export const DIFFICULT_WORD_CONFIDENCE_THRESHOLD = 0.4
export const MAX_ACTIVE_DIFFICULT_WORDS = 100
