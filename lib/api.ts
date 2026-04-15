// API helper — Zod-validated response parsing + error normalisation

import { z } from "zod";
import type { ApiResponse } from "@/types";

export async function apiFetch<T>(
  url: string,
  schema: z.ZodType<T>,
  init?: RequestInit
): Promise<ApiResponse<T>> {
  try {
    const res = await fetch(url, {
      headers: { "Content-Type": "application/json" },
      ...init,
    });

    const json = await res.json();

    if (!res.ok) {
      return {
        ok: false,
        error: json?.error ?? `HTTP ${res.status}`,
        code: json?.code,
      };
    }

    const parsed = schema.safeParse(json);
    if (!parsed.success) {
      console.error("[apiFetch] schema mismatch:", parsed.error.issues);
      return { ok: false, error: "Unexpected response format" };
    }

    return { ok: true, data: parsed.data };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Network error",
    };
  }
}

// ─── Common Zod schemas ───────────────────────────────────────────────────────

export const TopicSchema = z.object({
  id: z.string(),
  name: z.string(),
  slug: z.string(),
  icon: z.string(),
  sortOrder: z.number(),
  language: z.string(),
  lessonsCount: z.number().optional(),
  completedCount: z.number().optional(),
});

export const LessonSchema = z.object({
  id: z.string(),
  title: z.string(),
  slug: z.string(),
  level: z.enum(["A1", "A2", "B1"]),
  topicId: z.string(),
  passageText: z.string(),
  audioUrl: z.string().nullable(),
  audioUrlUK: z.string().nullable(),
  durationSeconds: z.number().nullable(),
  sortOrder: z.number(),
  isPublished: z.boolean(),
  language: z.string(),
  status: z.enum(["locked", "available", "completed"]).optional(),
  bestPronunciation: z.number().optional(),
  bestFluency: z.number().optional(),
  bestComprehension: z.number().optional(),
  attempts: z.number().optional(),
});
