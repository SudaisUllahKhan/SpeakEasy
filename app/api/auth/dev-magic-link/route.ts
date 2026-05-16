import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

// DEV only — returns the latest magic link URL from the console fallback
export async function GET() {
  if (process.env.NODE_ENV !== "development") {
    return NextResponse.json({ error: "Not available" }, { status: 404 });
  }

  const logPath = path.join(process.cwd(), ".magic-link.txt");
  if (!fs.existsSync(logPath)) {
    return NextResponse.json({ url: null });
  }

  const content = fs.readFileSync(logPath, "utf-8");
  const match = content.match(/URL: (http[^\s]+)/);
  const emailMatch = content.match(/To: ([^\s]+)/);

  return NextResponse.json({
    url: match?.[1] ?? null,
    email: emailMatch?.[1] ?? null,
    generatedAt: content.split("\n")[0] ?? null,
  });
}
