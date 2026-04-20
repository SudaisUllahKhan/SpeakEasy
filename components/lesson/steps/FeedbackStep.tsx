"use client";

import { Button } from "@/components/ui/Button";
import type { ScoredWord, DifficultWord, PronunciationFeedback, QuestionResponse } from "@/types";

interface FeedbackStepProps {
  pronunciationScore: number | null;
  fluencyScore: number | null;
  comprehensionScore: number | null;
  scoredWords: ScoredWord[];
  difficultWords: DifficultWord[];
  pronunciationTip: PronunciationFeedback | null;
  questionResponses: QuestionResponse[];
  xpEarned: number;
  onContinue: () => void;
}

function ScoreTile({ label, score, gradient }: { label: string; score: number | null; gradient: string }) {
  const display = score !== null ? score.toFixed(1) : "—";
  const pct = score !== null ? (score / 10) * 100 : 0;
  return (
    <div className="flex-1 min-w-0 rounded-2xl bg-white border border-[var(--color-border)] shadow-sm p-3 flex flex-col items-center gap-1.5">
      <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wide text-[var(--color-muted)] text-center leading-tight">{label}</span>
      <span className={`text-2xl sm:text-3xl font-extrabold bg-gradient-to-br ${gradient} bg-clip-text text-transparent tabular-nums`}>
        {display}
      </span>
      <div className="w-full h-1.5 bg-[var(--color-surface-2)] rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full bg-gradient-to-r ${gradient} transition-all duration-700`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

function speakWord(word: string) {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
  window.speechSynthesis.cancel();
  const utt = new SpeechSynthesisUtterance(word);
  utt.lang = "en-US";
  utt.rate = 0.8;
  window.speechSynthesis.speak(utt);
}

export function FeedbackStep({
  pronunciationScore, fluencyScore, comprehensionScore,
  difficultWords, pronunciationTip, questionResponses, xpEarned, onContinue,
}: FeedbackStepProps) {
  const correctAnswers = questionResponses.filter((r) => r.isCorrect).length;

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-xl mx-auto px-4 py-5 space-y-5">

        {/* Score tiles */}
        <div className="flex gap-3">
          <ScoreTile label="Pronunciation" score={pronunciationScore} gradient="from-blue-500 to-blue-700" />
          <ScoreTile label="Fluency"       score={fluencyScore}       gradient="from-violet-500 to-violet-700" />
          <ScoreTile label="Comprehension" score={comprehensionScore} gradient="from-emerald-500 to-emerald-700" />
        </div>

        {/* XP banner */}
        <div className="rounded-2xl bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-primary-light)] p-4 flex items-center justify-between text-white shadow-md">
          <div className="flex items-center gap-2">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="white" aria-hidden="true">
              <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"/>
            </svg>
            <span className="font-bold text-sm">XP Earned this lesson</span>
          </div>
          <span className="text-3xl font-extrabold tabular-nums">+{xpEarned}</span>
        </div>

        {/* Pronunciation tip */}
        {pronunciationTip && (
          <div className="rounded-2xl bg-white border border-[var(--color-border)] shadow-sm p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center">
                <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="#3B82F6" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true">
                  <path d="M12 2a4 4 0 014 4v6a4 4 0 01-8 0V6a4 4 0 014-4z"/><path d="M19 10v1a7 7 0 01-14 0v-1M12 19v4"/>
                </svg>
              </div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600">Pronunciation tip</span>
            </div>
            <p className="font-bold text-[var(--color-text)] text-lg">
              &ldquo;{pronunciationTip.word}&rdquo;
              <span className="ml-2 text-sm font-normal text-[var(--color-muted)]">[{pronunciationTip.phonetic}]</span>
            </p>
            <p className="text-sm text-[var(--color-text-secondary)] mt-1">{pronunciationTip.tip}</p>
          </div>
        )}

        {/* Question results */}
        {questionResponses.length > 0 && (
          <div className="rounded-2xl bg-white border border-[var(--color-border)] shadow-sm overflow-hidden">
            <div className="px-4 py-3 border-b border-[var(--color-border)] flex items-center justify-between">
              <span className="text-sm font-bold text-[var(--color-text)]">Comprehension</span>
              <span className={["text-sm font-bold px-2.5 py-0.5 rounded-full",
                correctAnswers === questionResponses.length ? "bg-emerald-100 text-emerald-700" :
                correctAnswers >= questionResponses.length / 2 ? "bg-amber-100 text-amber-700" :
                "bg-red-100 text-red-700"
              ].join(" ")}>
                {correctAnswers}/{questionResponses.length} correct
              </span>
            </div>
            <div className="divide-y divide-[var(--color-border)]">
              {questionResponses.map((r, i) => (
                <div key={r.id || i} className="px-4 py-3 flex items-start gap-3">
                  <div className={["w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5",
                    r.isCorrect ? "bg-emerald-100" : "bg-amber-100"
                  ].join(" ")} aria-hidden="true">
                    {r.isCorrect ? (
                      <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="#059669" strokeWidth="3" strokeLinecap="round">
                        <path d="M5 13l4 4L19 7"/>
                      </svg>
                    ) : (
                      <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="#D97706" strokeWidth="3" strokeLinecap="round">
                        <path d="M8 12h8"/>
                      </svg>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[var(--color-text)]">{r.questionText}</p>
                    {r.studentTranscript && (
                      <p className="text-xs text-[var(--color-text-secondary)] mt-0.5">
                        You said: &ldquo;{r.studentTranscript}&rdquo;
                      </p>
                    )}
                    {r.aiFeedback && (
                      <p className="text-xs text-[var(--color-primary)] mt-1 italic">{r.aiFeedback}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Difficult words */}
        {difficultWords.length > 0 && (
          <div className="rounded-2xl bg-white border border-[var(--color-border)] shadow-sm p-4">
            <p className="text-sm font-bold text-[var(--color-text)] mb-3">
              Words to practise ({difficultWords.length})
            </p>
            <div className="flex flex-wrap gap-2">
              {difficultWords.map((dw) => (
                <button
                  key={dw.id}
                  onClick={() => speakWord(dw.word)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-full text-sm font-medium text-[var(--color-text)] hover:bg-white hover:border-[var(--color-primary)] transition-colors"
                  aria-label={`Hear pronunciation of ${dw.word}`}
                >
                  <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                    <path d="M11 5L6 9H2v6h4l5 4V5z"/>
                    <path d="M15.54 8.46a5 5 0 010 7.07M19.07 4.93a10 10 0 010 14.14"/>
                  </svg>
                  {dw.word}
                  {dw.phonetic && <span className="text-[var(--color-muted)] text-[10px]">[{dw.phonetic}]</span>}
                </button>
              ))}
            </div>
          </div>
        )}

        <Button variant="primary" size="lg" className="w-full" onClick={onContinue}>
          See full summary →
        </Button>
      </div>
    </div>
  );
}
