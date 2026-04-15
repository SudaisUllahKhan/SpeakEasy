import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const start = Date.now();

  try {
    await prisma.$queryRaw`SELECT 1`;
    const dbLatency = Date.now() - start;

    return NextResponse.json({
      ok: true,
      status: "healthy",
      version: process.env.npm_package_version ?? "1.0.0",
      dbLatencyMs: dbLatency,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    console.error("[health] DB check failed:", err);
    return NextResponse.json(
      {
        ok: false,
        status: "degraded",
        error: "Database unreachable",
        timestamp: new Date().toISOString(),
      },
      { status: 503 }
    );
  }
}
