import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import type { Level, ScoredWord } from "@/types";

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
  const difficult = scoredWords.filter((w) => w.label === "MISSED" || (w.label === "CLOSE" && w.confidence < 0.5));
  for (const dw of difficult.slice(0, 5)) {
    const clean = dw.word.toLowerCase().replace(/[^a-z]/g, "");
    if (!clean) continue;
    await prisma.difficultWord.upsert({
      where: { userId_word: { userId, word: clean } },
      update: { timesIncorrect: { increment: 1 } },
      create: { userId, word: clean, timesIncorrect: 1 },
    });
  }

  return NextResponse.json({ attemptId: attempt.id, scoredWords, pronunciationScore, fluencyScore, transcript });
}

// ─── FormData path (Whisper STT — when OpenAI key available) ──────────────────
async function handleFormData(req: NextRequest, userId: string): Promise<NextResponse> {
  const formData = await req.formData();
  const audioFile = formData.get("audio") as File | null;
  const lessonId = formData.get("lessonId") as string;
  const passageText = formData.get("passageText") as string;
  const level = formData.get("level") as Level;

  if (!audioFile || !lessonId || !passageText) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const { diffWords, calcPronunciationScore, calcFluencyScore } = await import("@/lib/utils");

  try {
    const attempt = await prisma.lessonAttempt.create({
      data: { userId, lessonId, readingDurationMs: 0 },
    });

    const audioBuffer = await audioFile.arrayBuffer();
    const OpenAI = (await import("openai")).default;
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    const file = new File([audioBuffer], "recording.webm", { type: audioFile.type });
    const whisperResult = await openai.audio.transcriptions.create({
      file,
      model: "whisper-1",
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

    const durationSec = whisperWords.length > 0 ? whisperWords[whisperWords.length - 1].end : 60;
    const wpm = Math.round((actualWords.length / durationSec) * 60);
    let pauseCount = 0;
    for (let i = 1; i < whisperWords.length; i++) {
      if (whisperWords[i].start - whisperWords[i - 1].end > 2) pauseCount++;
    }
    const fluencyScore = calcFluencyScore(wpm, level, pauseCount);

    await prisma.lessonAttempt.update({
      where: { id: attempt.id },
      data: { readingTranscript: transcript, pronunciationScore, fluencyScore, readingDurationMs: Math.round(durationSec * 1000) },
    });

    const difficult = scoredWords.filter((w) => w.label !== "CORRECT" || w.confidence < 0.4);
    for (const dw of difficult.slice(0, 5)) {
      const clean = dw.word.toLowerCase().replace(/[^a-z]/g, "");
      if (!clean) continue;
      await prisma.difficultWord.upsert({
        where: { userId_word: { userId, word: clean } },
        update: { timesIncorrect: { increment: 1 } },
        create: { userId, word: clean, timesIncorrect: 1 },
      });
    }

    return NextResponse.json({ attemptId: attempt.id, scoredWords, pronunciationScore, fluencyScore, transcript });
  } catch (err) {
    console.error("[score-reading] Whisper failed:", err);
    return NextResponse.json({ error: "Scoring failed" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const contentType = req.headers.get("content-type") ?? "";
  if (contentType.includes("application/json")) {
    return handleJsonBody(req, session.user.id);
  }
  return handleFormData(req, session.user.id);
}
