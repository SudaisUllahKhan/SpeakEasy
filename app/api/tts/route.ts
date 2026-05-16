import { NextRequest, NextResponse } from "next/server";

const AZURE_TTS_KEY = process.env.AZURE_TTS_KEY;
const AZURE_TTS_REGION = process.env.AZURE_TTS_REGION ?? "uksouth";

const VOICE_MAP: Record<string, { name: string; rate?: string; pitch?: string }> = {
  female:      { name: "en-US-AriaNeural" },
  girl:        { name: "en-US-AnaNeural",      pitch: "+10%" },
  human:       { name: "en-US-DavisNeural" },
  boy:         { name: "en-US-AndrewNeural",   pitch: "-5%" },
  american:    { name: "en-US-GuyNeural" },
  british:     { name: "en-GB-RyanNeural" },
  indian:      { name: "en-IN-PrabhatNeural" },
  australian:  { name: "en-AU-WilliamNeural" },
  storyteller: { name: "en-GB-ThomasNeural",   rate: "-15%" },
};

// GET — expo-av can stream directly from this URL
export async function GET(req: NextRequest) {
  if (!AZURE_TTS_KEY) {
    return NextResponse.json({ error: "TTS not configured" }, { status: 500 });
  }

  const { searchParams } = new URL(req.url);
  const text = searchParams.get("text");
  const voiceId = searchParams.get("voiceId") ?? "standard";
  const speedParam = parseFloat(searchParams.get("speed") ?? "1");

  if (!text) {
    return NextResponse.json({ error: "Missing text" }, { status: 400 });
  }

  const voice = VOICE_MAP[voiceId] ?? VOICE_MAP.standard;
  const rate = speedParam >= 2 ? "+90%" : speedParam >= 1.5 ? "+50%" : (voice.rate ?? "0%");
  const pitch = voice.pitch ?? "0%";

  const ssml = `<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="en-US">
  <voice name="${voice.name}">
    <prosody rate="${rate}" pitch="${pitch}">${text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")}</prosody>
  </voice>
</speak>`;

  try {
    const res = await fetch(
      `https://${AZURE_TTS_REGION}.tts.speech.microsoft.com/cognitiveservices/v1`,
      {
        method: "POST",
        headers: {
          "Ocp-Apim-Subscription-Key": AZURE_TTS_KEY,
          "Content-Type": "application/ssml+xml",
          "X-Microsoft-OutputFormat": "audio-16khz-128kbitrate-mono-mp3",
        },
        body: ssml,
      }
    );

    if (!res.ok) {
      console.error("[TTS] Azure error:", res.status, await res.text());
      return NextResponse.json({ error: "TTS request failed" }, { status: 500 });
    }

    const audioBuffer = await res.arrayBuffer();
    return new NextResponse(audioBuffer, {
      headers: {
        "Content-Type": "audio/mpeg",
        "Cache-Control": "public, max-age=3600",
      },
    });
  } catch (err) {
    console.error("[TTS] fetch failed:", err);
    return NextResponse.json({ error: "TTS unavailable" }, { status: 500 });
  }
}
