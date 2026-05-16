import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getMobileSession } from "@/lib/mobile-auth";
import { prisma } from "@/lib/prisma";
import type { Level, ScoredWord } from "@/types";

export const maxDuration = 90;

// ─── JSON path (SpeechRecognition — client-scored) ────────────────────────────
interface ClientScoredBody {
  lessonId: string;
  passageText: string;
  level: Level;
  nativeLanguage: string;
  transcript: string;
  durationMs: number;
  scoredWords: ScoredWord[];
  pronunciationScore: number;
  fluencyScore: number;
}

async function handleJsonBody(req: NextRequest, userId: string): Promise<NextResponse> {
  const body = await req.json().catch(() => null) as ClientScoredBody | null;
  if (!body?.lessonId || !body?.transcript) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const { lessonId, transcript, durationMs, scoredWords, pronunciationScore, fluencyScore } = body;

  const attempt = await prisma.lessonAttempt.create({
    data: {
      userId,
      lessonId,
      readingTranscript: transcript,
      pronunciationScore,
      fluencyScore,
      readingDurationMs: durationMs,
    },
  });

  // Flag difficult words (missed or low confidence)
  const difficult = scoredWords.filter((w) => w.label === "MISSED" || w.label === "CLOSE" || w.confidence < 0.75);
  for (const dw of difficult) {
    const clean = dw.word.toLowerCase().replace(/[^a-z]/g, "");
    if (!clean) continue;
    await prisma.difficultWord.upsert({
      where: { userId_word: { userId, word: clean } },
      update: { timesIncorrect: { increment: 1 } },
      create: { userId, word: clean, timesIncorrect: 1, nextReviewAt: new Date() },
    });
  }

  return NextResponse.json({ attemptId: attempt.id, scoredWords, pronunciationScore, fluencyScore, transcript });
}

// ─── FormData path (Groq Whisper STT) ────────────────────────────────────────
async function handleFormData(req: NextRequest, userId: string): Promise<NextResponse> {
  const formData = await req.formData();
  const audioFile = formData.get("audio") as File | null;
  const lessonId = formData.get("lessonId") as string;
  const passageText = formData.get("passageText") as string;
  const level = (formData.get("level") as Level) ?? "A1";

  if (!lessonId || !passageText) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  if (!audioFile) {
    return NextResponse.json({ error: "No audio file received" }, { status: 400 });
  }

  const groqKey = process.env.GROQ_API_KEY;
  if (!groqKey) {
    return NextResponse.json({ error: "GROQ_API_KEY not configured" }, { status: 500 });
  }

  const { diffWords, calcPronunciationScore, calcFluencyScore } = await import("@/lib/utils");

  try {
    const attempt = await prisma.lessonAttempt.create({
      data: { userId, lessonId, readingDurationMs: 0 },
    });

    const audioBuffer = await audioFile.arrayBuffer();
    const OpenAI = (await import("openai")).default;
    // Groq is OpenAI-SDK compatible — just swap baseURL + key
    const groq = new OpenAI({
      apiKey: groqKey,
      baseURL: "https://api.groq.com/openai/v1",
    });

    const file = new File([audioBuffer], "recording.m4a", { type: "audio/m4a" });
    const whisperResult = await groq.audio.transcriptions.create({
      file,
      model: "whisper-large-v3-turbo",
      response_format: "verbose_json",
      timestamp_granularities: ["word"],
    });

    const transcript = whisperResult.text;
    const whisperWords = (whisperResult.words ?? []).map((w) => ({
      word: w.word,
      start: w.start,
      end: w.end,
      probability: (w as { probability?: number }).probability ?? 0.9,
    }));

    const expectedWords = passageText.trim().split(/\s+/);
    const actualWords = transcript.trim().split(/\s+/);
    const scoredWords = diffWords(expectedWords, actualWords, whisperWords);
    const pronunciationScore = calcPronunciationScore(scoredWords);

    const durationSec = whisperWords.length > 0
      ? whisperWords[whisperWords.length - 1].end
      : 60;
    const wpm = Math.round((actualWords.length / durationSec) * 60);
    let pauseCount = 0;
    for (let i = 1; i < whisperWords.length; i++) {
      if (whisperWords[i].start - whisperWords[i - 1].end > 2) pauseCount++;
    }
    const fluencyScore = calcFluencyScore(wpm, level, pauseCount);

    await prisma.lessonAttempt.update({
      where: { id: attempt.id },
      data: {
        readingTranscript: transcript,
        pronunciationScore,
        fluencyScore,
        readingDurationMs: Math.round(durationSec * 1000),
      },
    });

    const difficult = scoredWords.filter((w) => w.label !== "CORRECT" || w.confidence < 0.4);
    for (const dw of difficult) {
      const clean = dw.word.toLowerCase().replace(/[^a-z]/g, "");
      if (!clean) continue;
      await prisma.difficultWord.upsert({
        where: { userId_word: { userId, word: clean } },
        update: { timesIncorrect: { increment: 1 } },
        create: { userId, word: clean, timesIncorrect: 1, nextReviewAt: new Date() },
      });
    }

    return NextResponse.json({ attemptId: attempt.id, scoredWords, pronunciationScore, fluencyScore, transcript });
  } catch (err) {
    console.error("[score-reading] Groq Whisper failed:", err);
    return NextResponse.json({ error: "Scoring failed" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const mobileSession = await getMobileSession(req);
  const userId = mobileSession?.userId ?? (await auth())?.user?.id;
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const contentType = req.headers.get("content-type") ?? "";
  if (contentType.includes("application/json")) {
    return handleJsonBody(req, userId);
  }
  return handleFormData(req, userId);
}
