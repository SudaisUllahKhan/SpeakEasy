import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const Body = z.object({
  attemptId:         z.string(),
  questionText:      z.string(),
  questionType:      z.enum(["FACTUAL", "INFERENCE", "PERSONAL", "REPETITION", "PARAPHRASE"]),
  expectedAnswer:    z.string().nullable(),
  studentTranscript: z.string(),
  nativeLanguage:    z.string().nullable(),
  passageText:       z.string().optional(),
});

const EVAL_SYSTEM_PROMPT = `You are an encouraging English language tutor evaluating a student's spoken answer.

Rules:
- Be generous with semantic equivalence — accept synonyms, partial answers, and grammatically imperfect but comprehensible responses.
- For FACTUAL questions: return isCorrect=true if the core fact is present, regardless of phrasing.
- For INFERENCE questions: accept any reasonable interpretation that shows understanding of the passage.
- For PERSONAL questions: ALWAYS return isCorrect=true — there is no wrong personal opinion.
- For PARAPHRASE questions: return isCorrect=true if the student captures the main idea, even imperfectly.
- Never say "wrong", "incorrect", "bad", or "failed".
- If the student made a grammar or pronunciation mistake, gently show the correct way in correctedVersion.
- feedback must be encouraging, specific, and under 25 words.
- correctedVersion: provide the improved version of what the student said, or null if it was correct.

Respond with valid JSON only:
{
  "isCorrect": true or false,
  "confidence": 0.0 to 1.0,
  "feedback": "encouraging feedback here",
  "correctedVersion": "improved version or null"
}`;

async function evaluateWithGroq(
  questionText: string,
  questionType: string,
  expectedAnswer: string | null,
  studentTranscript: string,
  passageText?: string,
): Promise<{ isCorrect: boolean; confidence: number; feedback: string; correctedVersion: string | null }> {

  const userContent = [
    passageText ? `Passage: "${passageText}"` : null,
    `Question (${questionType}): ${questionText}`,
    expectedAnswer ? `Expected answer: ${expectedAnswer}` : `Expected answer: (open-ended personal response)`,
    `Student's answer: "${studentTranscript}"`,
  ].filter(Boolean).join("\n");

  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "llama-3.3-70b-versatile",
      messages: [
        { role: "system", content: EVAL_SYSTEM_PROMPT },
        { role: "user", content: userContent },
      ],
      temperature: 0.2,
      response_format: { type: "json_object" },
    }),
  });

  if (!response.ok) throw new Error(`Groq error: ${response.status}`);

  const data = await response.json() as {
    choices: Array<{ message: { content: string } }>;
  };

  const raw = data.choices[0]?.message?.content ?? "{}";
  return JSON.parse(raw) as {
    isCorrect: boolean;
    confidence: number;
    feedback: string;
    correctedVersion: string | null;
  };
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const parsed = Body.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const { attemptId, questionText, questionType, expectedAnswer, studentTranscript, passageText } = parsed.data;

  // PERSONAL questions are always correct
  if (questionType === "PERSONAL") {
    const response = await prisma.questionResponse.create({
      data: {
        attemptId, questionText, questionType,
        expectedAnswer: null, studentTranscript,
        isCorrect: true, confidenceScore: 1.0,
        aiFeedback: "Great — thanks for sharing your personal experience!",
        correctedVersion: null,
      },
    });
    return NextResponse.json({ id: response.id, isCorrect: true, confidence: 1.0, feedback: "Great — thanks for sharing your personal experience!", correctedVersion: null });
  }

  // Use Groq if key available
  if (process.env.GROQ_API_KEY) {
    try {
      const result = await evaluateWithGroq(questionText, questionType, expectedAnswer, studentTranscript, passageText);

      const response = await prisma.questionResponse.create({
        data: {
          attemptId, questionText, questionType, expectedAnswer, studentTranscript,
          isCorrect: result.isCorrect,
          confidenceScore: result.confidence,
          aiFeedback: result.feedback,
          correctedVersion: result.correctedVersion,
        },
      });

      return NextResponse.json({ id: response.id, ...result });
    } catch (err) {
      console.error("[evaluate-answer] Groq failed:", err);
    }
  }

  // Fallback — basic keyword matching (honest, not always 9.7)
  const studentLower = studentTranscript.toLowerCase().trim();
  const expectedLower = (expectedAnswer ?? "").toLowerCase();

  let isCorrect = false;
  let feedback = "Try to give a more complete answer next time.";

  if (studentTranscript.length < 3) {
    isCorrect = false;
    feedback = "Try to say a full sentence — even a short one is great!";
  } else if (expectedAnswer === null) {
    isCorrect = true;
    feedback = "Well done sharing your thoughts!";
  } else {
    // Check if student answer contains key words from expected answer
    const keyWords = expectedLower.split(/\s+/).filter(w => w.length > 3);
    const matchCount = keyWords.filter(w => studentLower.includes(w)).length;
    const matchRatio = keyWords.length > 0 ? matchCount / keyWords.length : 0;
    isCorrect = matchRatio >= 0.3 || studentLower.length > 15;
    feedback = isCorrect
      ? "Good answer! You understood the key idea."
      : "Look back at the passage — the answer is there. Try again!";
  }

  const response = await prisma.questionResponse.create({
    data: {
      attemptId, questionText, questionType, expectedAnswer, studentTranscript,
      isCorrect, confidenceScore: isCorrect ? 0.75 : 0.4,
      aiFeedback: feedback, correctedVersion: null,
    },
  });

  return NextResponse.json({ id: response.id, isCorrect, confidence: isCorrect ? 0.75 : 0.4, feedback, correctedVersion: null });
}
