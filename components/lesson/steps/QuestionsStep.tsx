"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/Button";
import type { GeneratedQuestion, QuestionResponse, DifficultWord, PronunciationFeedback } from "@/types";

interface QuestionsStepProps {
  lesson: { id: string; level: "A1" | "A2" | "B1"; passageText: string };
  attemptId: string;
  pronunciationScore: number | null;
  fluencyScore: number | null;
  userPrefs: { nativeLanguage: string | null; level: "A1" | "A2" | "B1" };
  onComplete: (data: {
    responses: QuestionResponse[];
    comprehensionScore: number;
    difficultWords: DifficultWord[];
    pronunciationTip: PronunciationFeedback | null;
    xpEarned: number;
  }) => void;
}

type QState = "loading" | "ready" | "answering" | "evaluating";

const TYPE_LABEL: Record<string, { label: string; color: string }> = {
  FACTUAL:    { label: "Factual",    color: "bg-blue-100 text-blue-700"    },
  INFERENCE:  { label: "Inference",  color: "bg-violet-100 text-violet-700" },
  PERSONAL:   { label: "Personal",   color: "bg-emerald-100 text-emerald-700" },
  PARAPHRASE: { label: "Paraphrase", color: "bg-amber-100 text-amber-700"   },
};

function getSR(): (new () => SpeechRecognition) | null {
  if (typeof window === "undefined") return null;
  const w = window as Window & { webkitSpeechRecognition?: new () => SpeechRecognition };
  return window.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

export function QuestionsStep({ lesson, attemptId, pronunciationScore, fluencyScore, userPrefs, onComplete }: QuestionsStepProps) {
  const [questions, setQuestions] = useState<GeneratedQuestion[]>([]);
  const [qState, setQState] = useState<QState>("loading");
  const [qIndex, setQIndex] = useState(0);
  const [responses, setResponses] = useState<QuestionResponse[]>([]);
  const [textFallback, setTextFallback] = useState(false);
  const [textAnswer, setTextAnswer] = useState("");
  const [lastFeedback, setLastFeedback] = useState<{ text: string; isCorrect: boolean } | null>(null);
  const [loadError, setLoadError] = useState(false);

  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const finalRef = useRef<string>("");
  const interimRef = useRef<string>("");

  useEffect(() => {
    async function load() {
      setLoadError(false);
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 12000);
        const res = await fetch("/api/lessons/generate-questions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ lessonId: lesson.id, level: lesson.level }),
          signal: controller.signal,
        });
        clearTimeout(timeout);
        if (!res.ok) throw new Error("Failed to load questions");
        const data = await res.json() as { questions: GeneratedQuestion[] };
        if (!data.questions?.length) throw new Error("No questions returned");
        setQuestions(data.questions);
        setQState("ready");
      } catch {
        setLoadError(true);
        setQState("ready");
      }
    }
    load();
  }, [lesson.id, lesson.level]);

  const currentQuestion = questions[qIndex];

  const evaluateTranscript = useCallback(async (transcript: string) => {
    if (!currentQuestion) return;
    setQState("evaluating");

    try {
      const evalRes = await fetch("/api/lessons/evaluate-answer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          attemptId,
          questionText: currentQuestion.text,
          questionType: currentQuestion.type,
          expectedAnswer: currentQuestion.expectedAnswer,
          studentTranscript: transcript,
          nativeLanguage: userPrefs.nativeLanguage,
          passageText: lesson.passageText,
        }),
      });

      const evalData = await evalRes.json() as {
        id: string; isCorrect: boolean; confidence: number;
        feedback: string; correctedVersion: string | null; studentAudioUrl?: string;
      };

      const response: QuestionResponse = {
        id: evalData.id,
        attemptId,
        questionText: currentQuestion.text,
        questionType: currentQuestion.type,
        expectedAnswer: currentQuestion.expectedAnswer,
        studentAudioUrl: evalData.studentAudioUrl ?? null,
        studentTranscript: transcript,
        isCorrect: evalData.isCorrect,
        confidenceScore: evalData.confidence,
        aiFeedback: evalData.feedback,
        correctedVersion: evalData.correctedVersion,
      };

      setLastFeedback({ text: evalData.feedback, isCorrect: evalData.isCorrect });
      const newResponses = [...responses, response];
      setResponses(newResponses);
      setTextAnswer("");

      // Brief pause so user sees feedback, then advance
      await new Promise((r) => setTimeout(r, 1800));
      setLastFeedback(null);

      if (qIndex + 1 >= questions.length) {
        const fbRes = await fetch("/api/lessons/complete", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ attemptId, pronunciationScore, fluencyScore }),
        });
        const fbData = await fbRes.json() as {
          comprehensionScore: number; difficultWords: DifficultWord[];
          pronunciationTip: PronunciationFeedback | null; xpEarned: number;
        };
        onComplete({
          responses: newResponses,
          comprehensionScore: fbData.comprehensionScore,
          difficultWords: fbData.difficultWords ?? [],
          pronunciationTip: fbData.pronunciationTip ?? null,
          xpEarned: fbData.xpEarned,
        });
      } else {
        setQIndex(qIndex + 1);
        setQState("ready");
      }
    } catch {
      // Show a gentle error feedback and allow retry
      setLastFeedback({ text: "Something went wrong evaluating your answer. Please try again.", isCorrect: false });
      setTimeout(() => { setLastFeedback(null); setQState("ready"); }, 2500);
    }
  }, [currentQuestion, attemptId, responses, qIndex, questions.length, pronunciationScore, fluencyScore, userPrefs.nativeLanguage, lesson.passageText, onComplete]);

  const startAnswering = useCallback(() => {
    const SR = getSR();
    if (!SR) {
      setTextFallback(true);
      setQState("answering");
      return;
    }

    setTextFallback(false);
    finalRef.current = "";
    interimRef.current = "";

    const r = new SR();
    r.lang = "en-US";
    r.interimResults = true;
    r.continuous = false; // auto-stops after silence — perfect for short Q&A answers
    r.maxAlternatives = 1;

    r.onresult = (event: SpeechRecognitionEvent) => {
      for (let i = event.resultIndex; i < event.results.length; i++) {
        if (event.results[i].isFinal) {
          finalRef.current += event.results[i][0].transcript + " ";
        } else {
          interimRef.current = event.results[i][0].transcript;
        }
      }
    };

    r.onerror = (event: SpeechRecognitionErrorEvent) => {
      if (event.error === "not-allowed") {
        setTextFallback(true);
      }
    };

    // Auto-fires when recognition stops (silence or manual stop)
    r.onend = () => {
      recognitionRef.current = null;
      const transcript = (finalRef.current || interimRef.current).trim();
      if (transcript) {
        void evaluateTranscript(transcript);
      } else {
        setQState("ready");
      }
    };

    r.start();
    recognitionRef.current = r;
    setQState("answering");
  }, [evaluateTranscript]);

  const stopRecording = useCallback(() => {
    recognitionRef.current?.stop();
    // onend will handle evaluation
  }, []);

  const submitText = useCallback(() => {
    if (!textAnswer.trim()) return;
    void evaluateTranscript(textAnswer.trim());
  }, [textAnswer, evaluateTranscript]);

  const handleSkip = useCallback(async () => {
    if (!currentQuestion) return;
    const skipped: QuestionResponse = {
      id: crypto.randomUUID(),
      attemptId,
      questionText: currentQuestion.text,
      questionType: currentQuestion.type,
      expectedAnswer: currentQuestion.expectedAnswer,
      studentAudioUrl: null,
      studentTranscript: null,
      isCorrect: false,
      confidenceScore: null,
      aiFeedback: null,
      correctedVersion: null,
    };
    const newResponses = [...responses, skipped];
    setResponses(newResponses);

    if (qIndex + 1 >= questions.length) {
      const fbRes = await fetch("/api/lessons/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ attemptId, pronunciationScore, fluencyScore }),
      });
      const fbData = await fbRes.json() as {
        comprehensionScore: number; difficultWords: DifficultWord[];
        pronunciationTip: PronunciationFeedback | null; xpEarned: number;
      };
      onComplete({
        responses: newResponses,
        comprehensionScore: fbData.comprehensionScore ?? 0,
        difficultWords: fbData.difficultWords ?? [],
        pronunciationTip: fbData.pronunciationTip ?? null,
        xpEarned: fbData.xpEarned ?? 0,
      });
    } else {
      setQIndex(qIndex + 1);
      setQState("ready");
    }
  }, [currentQuestion, attemptId, responses, qIndex, questions.length, pronunciationScore, fluencyScore, onComplete]);

  // Loading
  if (qState === "loading") {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-4 px-4" role="status">
        <div className="w-12 h-12 rounded-full border-[3px] border-[var(--color-primary)] border-t-transparent animate-spin" aria-hidden="true" />
        <p className="text-[var(--color-muted)] text-sm">Preparing questions…</p>
      </div>
    );
  }

  if (loadError || !currentQuestion) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center px-4 gap-5 text-center">
        <div className="w-14 h-14 rounded-full bg-amber-50 flex items-center justify-center" aria-hidden="true">
          <svg width="26" height="26" fill="none" viewBox="0 0 24 24" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round">
            <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><path d="M12 9v4M12 17h.01"/>
          </svg>
        </div>
        <div>
          <p className="font-bold text-[var(--color-text)] mb-1">
            {loadError ? "Could not load questions" : "No questions available"}
          </p>
          <p className="text-sm text-[var(--color-text-secondary)]">
            {loadError ? "Check your connection and try again." : "You can continue to feedback."}
          </p>
        </div>
        <Button onClick={() => onComplete({ responses: [], comprehensionScore: 10, difficultWords: [], pronunciationTip: null, xpEarned: 0 })}>
          Continue anyway
        </Button>
      </div>
    );
  }

  const typeInfo = TYPE_LABEL[currentQuestion.type] ?? { label: currentQuestion.type, color: "bg-slate-100 text-slate-600" };

  return (
    <div className="flex-1 flex flex-col px-4 pt-5 pb-6 max-w-xl mx-auto w-full gap-4">
      {/* Progress */}
      <div className="flex items-center gap-2" aria-label={`Question ${qIndex + 1} of ${questions.length}`}>
        {questions.map((_, i) => (
          <div
            key={i}
            className={[
              "h-1.5 flex-1 rounded-full transition-all duration-300",
              i < qIndex  ? "bg-[var(--color-accent)]" :
              i === qIndex ? "bg-[var(--color-primary)]" :
                             "bg-[var(--color-border)]",
            ].join(" ")}
          />
        ))}
      </div>

      {/* Question card */}
      <div className="rounded-2xl overflow-hidden shadow-sm border border-[var(--color-border)] bg-white flex-1 flex flex-col">
        <div className="px-5 pt-5 pb-3 flex items-center justify-between">
          <span className={`text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${typeInfo.color}`}>
            {typeInfo.label}
          </span>
          <span className="text-xs text-[var(--color-muted)] font-medium">
            {qIndex + 1} / {questions.length}
          </span>
        </div>
        <div className="px-5 pb-5 flex-1">
          <p className="text-[1.2rem] font-bold text-[var(--color-text)] leading-snug">
            {currentQuestion.text}
          </p>
        </div>

        {/* Inline feedback bubble */}
        {lastFeedback && (
          <div className={[
            "mx-5 mb-5 px-4 py-3 rounded-xl text-sm font-medium border",
            lastFeedback.isCorrect
              ? "bg-emerald-50 border-emerald-200 text-emerald-800"
              : "bg-amber-50 border-amber-200 text-amber-800",
          ].join(" ")} aria-live="polite">
            {lastFeedback.text}
          </div>
        )}
      </div>

      {/* Answer controls */}
      <div className="flex flex-col items-center gap-3">
        {qState === "ready" && (
          <>
            <button
              onClick={startAnswering}
              className="w-[68px] h-[68px] rounded-full bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-primary-light)] flex items-center justify-center shadow-lg shadow-[var(--color-primary)]/25 hover:scale-105 active:scale-95 transition-all"
              aria-label="Answer by voice"
            >
              <svg width="26" height="26" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M12 2a4 4 0 014 4v6a4 4 0 01-8 0V6a4 4 0 014-4z" fill="white"/>
                <path d="M19 10v1a7 7 0 01-14 0v-1M12 19v4" stroke="white" strokeWidth="1.6" strokeLinecap="round"/>
              </svg>
            </button>
            <p className="text-sm text-[var(--color-muted)]">Tap to answer by voice</p>
            <div className="flex gap-4">
              <button
                onClick={() => { setTextFallback(true); setQState("answering"); }}
                className="text-xs text-[var(--color-muted)] hover:text-[var(--color-text)] underline"
              >
                Type instead
              </button>
              <button
                onClick={() => void handleSkip()}
                className="text-xs text-[var(--color-muted)] hover:text-[var(--color-text)] underline"
              >
                Skip
              </button>
            </div>
          </>
        )}

        {qState === "answering" && !textFallback && (
          <>
            <button
              onClick={stopRecording}
              className="animate-record-pulse w-[68px] h-[68px] rounded-full bg-[var(--color-danger)] flex items-center justify-center shadow-lg shadow-red-200"
              aria-label="Stop recording"
            >
              <span className="w-6 h-6 bg-white rounded-md" aria-hidden="true" />
            </button>
            <p className="text-sm text-[var(--color-danger)] font-semibold animate-pulse" aria-live="assertive">
              Listening — speak your answer
            </p>
            <p className="text-xs text-[var(--color-muted)]">Tap to stop, or pause and it auto-stops</p>
          </>
        )}

        {qState === "answering" && textFallback && (
          <div className="w-full space-y-3">
            <textarea
              value={textAnswer}
              onChange={(e) => setTextAnswer(e.target.value)}
              placeholder="Type your answer here…"
              rows={3}
              className="w-full px-4 py-3 border border-[var(--color-border)] rounded-xl resize-none text-[var(--color-text)] bg-white focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] text-base"
              aria-label="Type your answer"
              autoFocus
            />
            <Button className="w-full" onClick={submitText} disabled={!textAnswer.trim()}>
              Submit answer
            </Button>
          </div>
        )}

        {qState === "evaluating" && (
          <div className="flex flex-col items-center gap-3" role="status">
            <div className="w-12 h-12 rounded-full border-[3px] border-[var(--color-primary)] border-t-transparent animate-spin" aria-hidden="true" />
            <p className="text-sm text-[var(--color-muted)]" aria-live="polite">Evaluating your answer…</p>
          </div>
        )}
      </div>
    </div>
  );
}
