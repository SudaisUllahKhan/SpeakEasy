"use client";

import { useState, useReducer, useCallback } from "react";
import { useRouter } from "next/navigation";
import { StepIndicator } from "@/components/ui/StepIndicator";
import { ListenStep } from "./steps/ListenStep";
import { ReadAloudStep } from "./steps/ReadAloudStep";
import { QuestionsStep } from "./steps/QuestionsStep";
import { FeedbackStep } from "./steps/FeedbackStep";
import { SummaryStep } from "./steps/SummaryStep";
import type { LessonStep, ScoredWord, QuestionResponse, DifficultWord, PronunciationFeedback, GeneratedQuestion } from "@/types";

interface LessonData {
  id: string;
  title: string;
  slug: string;
  level: "A1" | "A2" | "B1";
  passageText: string;
  audioUrl: string | null;
  audioUrlUK: string | null;
  topicSlug: string;
  topicName: string;
  topicIcon: string;
}

interface UserPrefs {
  level: "A1" | "A2" | "B1";
  accent: "US" | "UK";
  audioSpeed: number;
  nativeLanguage: string | null;
}

interface PlayerState {
  step: LessonStep;
  attemptId: string | null;
  replaysUsed: number;
  scoredWords: ScoredWord[];
  pronunciationScore: number | null;
  fluencyScore: number | null;
  questions: GeneratedQuestion[];
  questionResponses: QuestionResponse[];
  comprehensionScore: number | null;
  difficultWords: DifficultWord[];
  pronunciationTip: PronunciationFeedback | null;
  xpEarned: number;
}

type PlayerAction =
  | { type: "SET_STEP"; step: LessonStep }
  | { type: "SET_ATTEMPT_ID"; id: string }
  | { type: "REPLAY" }
  | { type: "SET_READ_RESULT"; scoredWords: ScoredWord[]; pronunciationScore: number; fluencyScore: number; attemptId: string }
  | { type: "SET_QUESTIONS"; questions: GeneratedQuestion[] }
  | { type: "ADD_RESPONSE"; response: QuestionResponse }
  | { type: "SET_FEEDBACK"; comprehensionScore: number; difficultWords: DifficultWord[]; pronunciationTip: PronunciationFeedback | null; xpEarned: number };

function reducer(state: PlayerState, action: PlayerAction): PlayerState {
  switch (action.type) {
    case "SET_STEP":       return { ...state, step: action.step };
    case "SET_ATTEMPT_ID": return { ...state, attemptId: action.id };
    case "REPLAY":         return { ...state, replaysUsed: state.replaysUsed + 1 };
    case "SET_READ_RESULT":
      return {
        ...state,
        scoredWords: action.scoredWords,
        pronunciationScore: action.pronunciationScore,
        fluencyScore: action.fluencyScore,
        attemptId: action.attemptId,
        step: "questions",
      };
    case "SET_QUESTIONS":
      return { ...state, questions: action.questions, step: "questions" };
    case "ADD_RESPONSE":
      return { ...state, questionResponses: [...state.questionResponses, action.response] };
    case "SET_FEEDBACK":
      return {
        ...state,
        comprehensionScore: action.comprehensionScore,
        difficultWords: action.difficultWords,
        pronunciationTip: action.pronunciationTip,
        xpEarned: action.xpEarned,
        step: "feedback",
      };
    default:
      return state;
  }
}

const INITIAL_STATE: PlayerState = {
  step: "listen",
  attemptId: null,
  replaysUsed: 0,
  scoredWords: [],
  pronunciationScore: null,
  fluencyScore: null,
  questions: [],
  questionResponses: [],
  comprehensionScore: null,
  difficultWords: [],
  pronunciationTip: null,
  xpEarned: 0,
};

interface LessonPlayerProps {
  lesson: LessonData;
  userPrefs: UserPrefs;
}

export function LessonPlayer({ lesson, userPrefs }: LessonPlayerProps) {
  const router = useRouter();
  const [state, dispatch] = useReducer(reducer, INITIAL_STATE);

  const audioUrl =
    userPrefs.accent === "UK" && lesson.audioUrlUK
      ? lesson.audioUrlUK
      : lesson.audioUrl;

  const handleListenReady = useCallback(() => {
    dispatch({ type: "SET_STEP", step: "read" });
  }, []);

  const handleReplay = useCallback(() => {
    dispatch({ type: "REPLAY" });
  }, []);

  const handleReadComplete = useCallback(
    (data: { scoredWords: ScoredWord[]; pronunciationScore: number; fluencyScore: number; attemptId: string }) => {
      dispatch({ type: "SET_READ_RESULT", ...data });
    },
    []
  );

  const handleQuestionsComplete = useCallback(
    (data: { responses: QuestionResponse[]; comprehensionScore: number; difficultWords: DifficultWord[]; pronunciationTip: PronunciationFeedback | null; xpEarned: number }) => {
      dispatch({
        type: "SET_FEEDBACK",
        comprehensionScore: data.comprehensionScore,
        difficultWords: data.difficultWords,
        pronunciationTip: data.pronunciationTip,
        xpEarned: data.xpEarned,
      });
    },
    []
  );

  const handleSummaryDone = useCallback(
    (action: "replay" | "next" | "review") => {
      if (action === "replay") {
        router.refresh();
      } else if (action === "review") {
        router.push("/review");
      } else {
        router.push(`/topics/${lesson.topicSlug}`);
      }
    },
    [router, lesson.topicSlug]
  );

  return (
    <div className="flex flex-col min-h-dvh bg-[var(--background)]">
      {/* Lesson player top bar */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-sm border-b border-[var(--color-border)] shadow-sm">
        <div className="flex items-center gap-3 px-3 h-14 max-w-xl mx-auto">
          <button
            onClick={() => router.push(`/topics/${lesson.topicSlug}`)}
            className="flex items-center justify-center w-9 h-9 rounded-xl hover:bg-[var(--color-surface-2)] transition-colors shrink-0"
            aria-label="Exit lesson"
          >
            <svg width="18" height="18" fill="none" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"/>
            </svg>
          </button>

          <div className="flex-1 min-w-0 flex flex-col gap-0.5">
            <p className="text-[11px] font-semibold text-[var(--color-muted)] truncate leading-none">
              {lesson.topicName}
            </p>
            <p className="text-sm font-bold text-[var(--color-text)] truncate leading-none">
              {lesson.title}
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <span className={[
              "text-[11px] font-bold px-2 py-0.5 rounded-full",
              lesson.level === "A1" ? "bg-emerald-100 text-emerald-700" :
              lesson.level === "A2" ? "bg-blue-100 text-blue-700" :
                                      "bg-violet-100 text-violet-700",
            ].join(" ")}>
              {lesson.level}
            </span>
          </div>
        </div>
        <div className="px-3 max-w-xl mx-auto pb-2">
          <StepIndicator current={state.step} />
        </div>
      </header>

      {/* Step content */}
      <main className="flex-1 flex flex-col">
        {state.step === "listen" && (
          <ListenStep
            lesson={lesson}
            audioUrl={audioUrl}
            audioSpeed={userPrefs.audioSpeed}
            replaysUsed={state.replaysUsed}
            onReplay={handleReplay}
            onReady={handleListenReady}
          />
        )}

        {state.step === "read" && (
          <ReadAloudStep
            lesson={lesson}
            userPrefs={userPrefs}
            onComplete={handleReadComplete}
          />
        )}

        {state.step === "questions" && (
          <QuestionsStep
            lesson={lesson}
            attemptId={state.attemptId!}
            pronunciationScore={state.pronunciationScore}
            fluencyScore={state.fluencyScore}
            userPrefs={userPrefs}
            onComplete={handleQuestionsComplete}
          />
        )}

        {state.step === "feedback" && (
          <FeedbackStep
            pronunciationScore={state.pronunciationScore}
            fluencyScore={state.fluencyScore}
            comprehensionScore={state.comprehensionScore}
            scoredWords={state.scoredWords}
            difficultWords={state.difficultWords}
            pronunciationTip={state.pronunciationTip}
            questionResponses={state.questionResponses}
            xpEarned={state.xpEarned}
            onContinue={() => dispatch({ type: "SET_STEP", step: "summary" })}
          />
        )}

        {state.step === "summary" && (
          <SummaryStep
            lessonTitle={lesson.title}
            pronunciationScore={state.pronunciationScore}
            fluencyScore={state.fluencyScore}
            comprehensionScore={state.comprehensionScore}
            xpEarned={state.xpEarned}
            difficultWordsCount={state.difficultWords.length}
            onAction={handleSummaryDone}
          />
        )}
      </main>
    </div>
  );
}
