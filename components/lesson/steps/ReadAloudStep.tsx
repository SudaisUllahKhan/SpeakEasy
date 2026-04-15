"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { diffWords, calcPronunciationScore, calcFluencyScore } from "@/lib/utils";
import type { ScoredWord } from "@/types";

interface ReadAloudStepProps {
  lesson: { id: string; passageText: string; level: "A1" | "A2" | "B1" };
  userPrefs: { nativeLanguage: string | null };
  onComplete: (data: {
    scoredWords: ScoredWord[];
    pronunciationScore: number;
    fluencyScore: number;
    attemptId: string;
  }) => void;
}

type RecordState = "idle" | "recording" | "processing" | "done";

const WORD_COLOR: Record<ScoredWord["label"], string> = {
  CORRECT: "text-emerald-600 font-semibold",
  CLOSE:   "text-amber-500 font-semibold",
  MISSED:  "text-red-500 line-through opacity-70",
  ADDED:   "text-violet-500 italic",
};

function getSR(): (new () => SpeechRecognition) | null {
  if (typeof window === "undefined") return null;
  const w = window as Window & { webkitSpeechRecognition?: new () => SpeechRecognition };
  return window.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

export function ReadAloudStep({ lesson, userPrefs, onComplete }: ReadAloudStepProps) {
  const [recordState, setRecordState] = useState<RecordState>("idle");
  const [scoredWords, setScoredWords] = useState<ScoredWord[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [useFallback, setUseFallback] = useState(false);
  const [fallbackText, setFallbackText] = useState("");
  const [hasSpeechApi, setHasSpeechApi] = useState(true);
  const [pronunciationScore, setPronunciationScore] = useState<number | null>(null);
  const [fluencyScore, setFluencyScore] = useState<number | null>(null);

  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const finalRef   = useRef<string>("");
  const interimRef = useRef<string>("");
  const startTimeRef = useRef<number>(0);
  // Per-segment confidence from SpeechRecognition — key for honest scoring
  const confidenceSegmentsRef = useRef<Array<{ words: string[]; confidence: number }>>([]);

  useEffect(() => {
    if (!getSR()) setHasSpeechApi(false);
  }, []);

  const processTranscript = useCallback(async (transcript: string, durationMs: number) => {
    setRecordState("processing");

    const expectedWords = lesson.passageText.trim().split(/\s+/);
    const actualWords = transcript.trim().split(/\s+/).filter(Boolean);

    // Build a word-index → confidence map from the segments we collected
    const wordConfidenceMap = new Map<number, number>();
    let wordPos = 0;
    for (const seg of confidenceSegmentsRef.current) {
      for (let i = 0; i < seg.words.length; i++) {
        wordConfidenceMap.set(wordPos, seg.confidence);
        wordPos++;
      }
    }

    const raw = diffWords(expectedWords, actualWords, []);
    const scored: ScoredWord[] = raw.map((w, idx) => {
      const segConf = wordConfidenceMap.get(idx) ?? 0.7; // default if no data

      if (w.label === "MISSED" || w.label === "ADDED") {
        return { ...w, confidence: 0 };
      }

      // Low confidence = mispronounced even if API guessed the word correctly
      if (segConf < 0.45) {
        return { word: w.word, label: "MISSED" as const, confidence: 0 };
      }
      if (segConf < 0.72) {
        return { word: w.word, label: "CLOSE" as const, confidence: segConf * 0.6 };
      }
      // Good confidence — use match quality
      return { ...w, confidence: w.label === "CORRECT" ? segConf : segConf * 0.65 };
    });

    const pScore = calcPronunciationScore(scored);
    const wpm = durationMs > 500 ? Math.round((actualWords.length / (durationMs / 1000)) * 60) : 0;
    const fScore = calcFluencyScore(wpm, lesson.level, 0);

    try {
      const res = await fetch("/api/lessons/score-reading", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lessonId: lesson.id,
          passageText: lesson.passageText,
          level: lesson.level,
          nativeLanguage: userPrefs.nativeLanguage ?? "",
          transcript,
          durationMs,
          scoredWords: scored,
          pronunciationScore: pScore,
          fluencyScore: fScore,
        }),
      });

      if (!res.ok) throw new Error();
      const data = await res.json() as { attemptId: string };

      setScoredWords(scored);
      setPronunciationScore(pScore);
      setFluencyScore(fScore);
      setRecordState("done");
      onComplete({ scoredWords: scored, pronunciationScore: pScore, fluencyScore: fScore, attemptId: data.attemptId });
    } catch {
      setError("Could not save your result. Please try again.");
      setRecordState("idle");
    }
  }, [lesson, userPrefs, onComplete]);

  const startRecording = useCallback(() => {
    const SR = getSR();
    if (!SR) return;
    setError(null);
    finalRef.current = "";
    interimRef.current = "";
    confidenceSegmentsRef.current = [];

    const r = new SR();
    r.continuous = true;
    r.interimResults = true;
    r.lang = "en-US";
    r.maxAlternatives = 1;

    r.onresult = (event: SpeechRecognitionEvent) => {
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          const text = result[0].transcript;
          const confidence = result[0].confidence ?? 0.7; // Safari may omit confidence
          finalRef.current += text + " ";
          // Store confidence per segment for honest scoring
          confidenceSegmentsRef.current.push({
            words: text.trim().split(/\s+/).filter(Boolean),
            confidence,
          });
        } else {
          interimRef.current = result[0].transcript;
        }
      }
    };

    r.onerror = (event: SpeechRecognitionErrorEvent) => {
      if (event.error === "no-speech") return;
      if (event.error === "not-allowed") {
        setError("Microphone access denied. Please allow microphone access and try again.");
        setRecordState("idle");
      }
    };

    r.start();
    recognitionRef.current = r;
    startTimeRef.current = Date.now();
    setRecordState("recording");
  }, []);

  const stopRecording = useCallback(() => {
    const r = recognitionRef.current;
    if (!r) return;
    const durationMs = Date.now() - startTimeRef.current;
    recognitionRef.current = null;

    // Chrome fires final results in onend — process there
    r.onend = () => {
      const transcript = (finalRef.current || interimRef.current).trim();
      if (!transcript) {
        setError("No speech detected. Please speak clearly and try again.");
        setRecordState("idle");
        return;
      }
      void processTranscript(transcript, durationMs);
    };
    r.stop();
  }, [processTranscript]);

  const submitFallback = useCallback(() => {
    const text = fallbackText.trim();
    if (!text) return;
    void processTranscript(text, 30000);
  }, [fallbackText, processTranscript]);

  const reset = useCallback(() => {
    setScoredWords([]);
    setPronunciationScore(null);
    setFluencyScore(null);
    setRecordState("idle");
    finalRef.current = "";
    interimRef.current = "";
    confidenceSegmentsRef.current = [];
  }, []);

  const passageWords = lesson.passageText.split(/\s+/);

  const correctCount = scoredWords.filter((w) => w.label === "CORRECT").length;
  const closeCount   = scoredWords.filter((w) => w.label === "CLOSE").length;
  const missedCount  = scoredWords.filter((w) => w.label === "MISSED").length;

  return (
    <div className="flex-1 flex flex-col px-4 pt-5 pb-6 max-w-xl mx-auto w-full gap-4">
      {/* Passage card */}
      <div className="rounded-2xl overflow-hidden shadow-sm border border-[var(--color-border)] bg-white">
        <div className="px-5 pt-4 pb-1 flex items-center justify-between">
          <span className="text-[11px] font-bold text-[var(--color-primary)] uppercase tracking-widest">
            Read aloud
          </span>
          {scoredWords.length > 0 && (
            <div className="flex items-center gap-3 text-xs font-semibold">
              <span className="text-emerald-600">{correctCount} correct</span>
              {closeCount > 0 && <span className="text-amber-500">{closeCount} close</span>}
              {missedCount > 0 && <span className="text-red-500">{missedCount} missed</span>}
            </div>
          )}
        </div>
        <div className="px-5 py-4">
          <p className="text-[1.15rem] leading-[1.9] font-medium" aria-live="polite" aria-label="Passage text">
            {scoredWords.length > 0
              ? scoredWords.map((sw, i) => (
                  <span key={i} className={`${WORD_COLOR[sw.label]} transition-colors`}>
                    {sw.word}{" "}
                  </span>
                ))
              : passageWords.map((w, i) => (
                  <span key={i} className="text-[var(--color-text)]">{w}{" "}</span>
                ))}
          </p>
        </div>

        {/* Score bar — shown after recording */}
        {scoredWords.length > 0 && pronunciationScore !== null && (
          <div className="px-5 pb-4 pt-1 border-t border-[var(--color-border)] flex gap-6">
            <div className="flex flex-col items-center">
              <span className={["text-xl font-extrabold",
                pronunciationScore >= 7 ? "text-emerald-600" : pronunciationScore >= 4 ? "text-amber-500" : "text-red-500"
              ].join(" ")}>{pronunciationScore.toFixed(1)}</span>
              <span className="text-[10px] text-[var(--color-muted)] uppercase tracking-wide">Pronunciation</span>
            </div>
            {fluencyScore !== null && (
              <div className="flex flex-col items-center">
                <span className={["text-xl font-extrabold",
                  fluencyScore >= 7 ? "text-emerald-600" : fluencyScore >= 4 ? "text-amber-500" : "text-red-500"
                ].join(" ")}>{fluencyScore.toFixed(1)}</span>
                <span className="text-[10px] text-[var(--color-muted)] uppercase tracking-wide">Fluency</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Legend */}
      {scoredWords.length > 0 && (
        <div className="flex flex-wrap items-center gap-4 px-1 text-xs" aria-label="Score legend">
          {[
            { label: "Correct",  cls: "text-emerald-600" },
            { label: "Close",    cls: "text-amber-500"   },
            { label: "Missed",   cls: "text-red-500"     },
            { label: "Added",    cls: "text-violet-500"  },
          ].map(({ label, cls }) => (
            <span key={label} className={`font-semibold ${cls} flex items-center gap-1`}>
              <span className={`w-2 h-2 rounded-full inline-block ${cls.replace("text-", "bg-")}`} />
              {label}
            </span>
          ))}
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="flex items-start gap-3 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm" role="alert">
          <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="shrink-0 mt-0.5" aria-hidden="true">
            <circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/>
          </svg>
          {error}
        </div>
      )}

      {/* Text fallback */}
      {(!hasSpeechApi || useFallback) && recordState === "idle" && (
        <div className="flex flex-col gap-3">
          <p className="text-sm text-[var(--color-text-secondary)] bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
            {!hasSpeechApi
              ? "Voice input isn't supported in this browser. Type the passage text as you would say it."
              : "Type the passage text below:"}
          </p>
          <textarea
            className="w-full min-h-[110px] p-3 rounded-xl border border-[var(--color-border)] text-base resize-none focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] bg-white"
            placeholder="Type the passage here…"
            value={fallbackText}
            onChange={(e) => setFallbackText(e.target.value)}
          />
          <Button variant="primary" className="w-full" onClick={submitFallback} disabled={!fallbackText.trim()}>
            Submit answer
          </Button>
          {useFallback && (
            <button className="text-xs text-[var(--color-muted)] underline self-center" onClick={() => setUseFallback(false)}>
              Try microphone again
            </button>
          )}
        </div>
      )}

      {/* Mic controls */}
      {hasSpeechApi && !useFallback && (
        <div className="flex flex-col items-center gap-4 mt-auto">
          {recordState === "idle" && (
            <>
              <button
                onClick={startRecording}
                className="w-[72px] h-[72px] rounded-full bg-[var(--color-danger)] flex items-center justify-center shadow-lg shadow-red-200 hover:scale-105 active:scale-95 transition-all"
                aria-label="Start recording"
              >
                <svg width="26" height="26" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M12 2a4 4 0 014 4v6a4 4 0 01-8 0V6a4 4 0 014-4z" fill="white"/>
                  <path d="M19 10v1a7 7 0 01-14 0v-1M12 19v4M8 23h8" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
              <p className="text-sm text-[var(--color-muted)]">Tap to start recording</p>
              <button className="text-xs text-[var(--color-muted)] underline" onClick={() => setUseFallback(true)}>
                Can&apos;t use microphone? Type instead
              </button>
            </>
          )}

          {recordState === "recording" && (
            <>
              <button
                onClick={stopRecording}
                className="animate-record-pulse w-[72px] h-[72px] rounded-full bg-[var(--color-danger)] flex items-center justify-center shadow-lg shadow-red-200"
                aria-label="Stop recording"
              >
                <span className="w-6 h-6 bg-white rounded-md" aria-hidden="true" />
              </button>
              <p className="text-sm text-[var(--color-danger)] font-semibold animate-pulse" aria-live="assertive">
                Recording — tap to stop
              </p>
            </>
          )}

          {recordState === "processing" && (
            <div className="flex flex-col items-center gap-3">
              <div className="w-12 h-12 rounded-full border-[3px] border-[var(--color-primary)] border-t-transparent animate-spin" aria-hidden="true" />
              <p className="text-sm text-[var(--color-muted)]" aria-live="polite" role="status">
                Analysing your pronunciation…
              </p>
            </div>
          )}

          {recordState === "done" && (
            <Button variant="secondary" className="w-full" onClick={reset}>
              Record again
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
