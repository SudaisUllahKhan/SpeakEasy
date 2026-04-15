import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import type { GeneratedQuestion, Level } from "@/types";

const Body = z.object({
  lessonId: z.string(),
  level: z.enum(["A1", "A2", "B1"]),
});

const QUESTION_CONFIG: Record<Level, Array<{ type: GeneratedQuestion["type"]; count: number }>> = {
  A1: [{ type: "FACTUAL",   count: 3 }],
  A2: [{ type: "FACTUAL",   count: 3 }, { type: "INFERENCE", count: 1 }],
  B1: [{ type: "FACTUAL",   count: 2 }, { type: "INFERENCE", count: 1 }, { type: "PERSONAL", count: 1 }, { type: "PARAPHRASE", count: 1 }],
};

function buildPrompt(level: Level, passageText: string): string {
  const configs = QUESTION_CONFIG[level];
  const totalCount = configs.reduce((acc, c) => acc + c.count, 0);
  const typeInstructions = configs.map(c => `- ${c.count} ${c.type} question(s)`).join("\n");

  return `You are a patient English language tutor creating comprehension questions for an ESL student at CEFR level ${level}.

Passage:
"${passageText}"

Generate exactly ${totalCount} questions based strictly on the passage above. Use only vocabulary appropriate for level ${level}.

Question types to generate:
${typeInstructions}

Rules:
- FACTUAL: Ask about specific facts directly stated in the passage. Keep under 10 words.
- INFERENCE: Ask the student to reason about why something happened or what it implies.
- PERSONAL: Ask for the student's own opinion or experience. Set expectedAnswer to null.
- PARAPHRASE: Ask the student to restate the main idea in their own words.
- Every question must relate to THIS specific passage — no generic questions.
- For A1 level: use very simple vocabulary (he, she, it, what, where, who).
- Never ask the same question twice.

Respond with valid JSON only:
{
  "questions": [
    { "text": "question here", "type": "FACTUAL", "expectedAnswer": "answer here" },
    { "text": "question here", "type": "PERSONAL", "expectedAnswer": null }
  ]
}`;
}

async function callGroq(prompt: string): Promise<GeneratedQuestion[]> {
  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "llama-3.3-70b-versatile",
      messages: [
        { role: "user", content: prompt }
      ],
      temperature: 0.4,
      response_format: { type: "json_object" },
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Groq API error: ${err}`);
  }

  const data = await response.json() as {
    choices: Array<{ message: { content: string } }>;
  };

  const raw = data.choices[0]?.message?.content ?? "{}";
  const parsed = JSON.parse(raw) as { questions?: GeneratedQuestion[] };
  return parsed.questions ?? [];
}

// Fallback varied questions if Groq fails
function getFallbackQuestions(level: Level, passageText: string): GeneratedQuestion[] {
  const sentences = passageText.split(/[.!?]/).map(s => s.trim()).filter(Boolean);
  const firstSentence = sentences[0] ?? passageText.substring(0, 60);
  const configs = QUESTION_CONFIG[level];
  const questions: GeneratedQuestion[] = [];
  const usedFactual = new Set<number>();

  const factualTemplates = [
    { text: `What happens in this part: "${firstSentence.substring(0, 40)}..."?`, answer: "See the first sentence of the passage." },
    { text: "Who or what is the passage mainly about?", answer: "The main subject described in the passage." },
    { text: "Where does the situation in the passage take place?", answer: "The location described in the passage." },
    { text: "What is the main activity described in the passage?", answer: "The main activity mentioned in the passage." },
    { text: "What does the passage tell us about the topic?", answer: "The key information from the passage." },
  ];

  for (const cfg of configs) {
    for (let i = 0; i < cfg.count; i++) {
      if (cfg.type === "FACTUAL") {
        let idx = i % factualTemplates.length;
        while (usedFactual.has(idx) && usedFactual.size < factualTemplates.length) {
          idx = (idx + 1) % factualTemplates.length;
        }
        usedFactual.add(idx);
        questions.push({ text: factualTemplates[idx].text, type: "FACTUAL", expectedAnswer: factualTemplates[idx].answer });
      } else if (cfg.type === "INFERENCE") {
        questions.push({ text: "Why do you think this situation happened?", type: "INFERENCE", expectedAnswer: "A reason based on the context in the passage." });
      } else if (cfg.type === "PERSONAL") {
        questions.push({ text: "Has something like this ever happened to you?", type: "PERSONAL", expectedAnswer: null });
      } else if (cfg.type === "PARAPHRASE") {
        questions.push({ text: "Can you describe the main idea of this passage in your own words?", type: "PARAPHRASE", expectedAnswer: "A summary of the main idea of the passage." });
      }
    }
  }
  return questions;
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

  const { lessonId, level } = parsed.data;

  const lesson = await prisma.lesson.findUnique({ where: { id: lessonId } });
  if (!lesson) {
    return NextResponse.json({ error: "Lesson not found" }, { status: 404 });
  }

  // Use Groq if key is available
  if (process.env.GROQ_API_KEY) {
    try {
      const questions = await callGroq(buildPrompt(level, lesson.passageText));
      if (questions.length > 0) {
        return NextResponse.json({ questions });
      }
    } catch (err) {
      console.error("[generate-questions] Groq failed, using fallback:", err);
    }
  }

  // Fallback — passage-aware questions
  return NextResponse.json({ questions: getFallbackQuestions(level, lesson.passageText) });
}
