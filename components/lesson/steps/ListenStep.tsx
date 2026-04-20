"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { Waveform } from "@/components/ui/Waveform";

const MAX_REPLAYS = 3;

interface ListenStepProps {
  lesson: { title: string; passageText: string };
  audioUrl: string | null;
  audioSpeed: number;
  replaysUsed: number;
  onReplay: () => void;
  onReady: () => void;
}

interface VoiceOption {
  voice: SpeechSynthesisVoice | null;
  label: string;
  pitch: number;
  rate: number;
  /** If set, this text is spoken instead of passageText (for effects that need preprocessing) */
  preprocess?: (text: string) => string;
}

// ─── Voice label ──────────────────────────────────────────────────────────────

function labelVoice(v: SpeechSynthesisVoice): string {
  const n = v.name.toLowerCase();
  const l = v.lang.toLowerCase();
  if (n.includes("uk") || n.includes("british") || l === "en-gb")
    return n.includes("female") || n.includes("woman") ? "British Female" : "British Male";
  if (n.includes("australia") || l === "en-au") return "Australian";
  if (l === "en-in" || n.includes("india")) return "Indian English";
  if (n.includes("zira") || n.includes("samantha") || n.includes("victoria") ||
      n.includes("karen") || n.includes("female") || n.includes("woman"))
    return "American Female";
  if (n.includes("david") || n.includes("mark") || n.includes("fred") || n.includes("alex"))
    return "American Male";
  if (n.includes("google")) return "Google English";
  return v.name.replace(/^(Microsoft|Google|Apple)\s+/i, "").split(/\s+/).slice(0, 3).join(" ");
}

// ─── Find best matching voice ─────────────────────────────────────────────────

function pickVoice(
  all: SpeechSynthesisVoice[],
  preferFemale: boolean,
): SpeechSynthesisVoice | null {
  const en = all.filter((v) => v.lang.toLowerCase().startsWith("en"));
  if (en.length === 0) return null;

  if (preferFemale) {
    const f = en.find((v) => {
      const n = v.name.toLowerCase();
      return n.includes("female") || n.includes("woman") || n.includes("zira") ||
             n.includes("samantha") || n.includes("victoria") || n.includes("karen") ||
             n.includes("aria") || n.includes("jenny") || n.includes("natasha");
    });
    if (f) return f;
  } else {
    const m = en.find((v) => {
      const n = v.name.toLowerCase();
      return n.includes("male") || n.includes("man") || n.includes("david") ||
             n.includes("mark") || n.includes("ryan") || n.includes("guy") ||
             n.includes("james") || n.includes("eric") || n.includes("fred");
    });
    if (m) return m;
  }
  return en[0] ?? null;
}

// ─── Preset definitions ───────────────────────────────────────────────────────
// Pitch values stay within 0.6–1.45 — the range that actually affects output
// across Chrome/Safari/Firefox. Values outside 0.5–1.5 get clamped silently.

interface PresetDef {
  label: string;
  pitch: number;
  rate: number;
  preferFemale: boolean;
  preprocess?: (text: string) => string;
}

const VOICE_PRESETS: PresetDef[] = [
  {
    label: "Storyteller",
    pitch: 0.85,
    rate: 0.80,
    preferFemale: false,
    // Slight extra spacing between sentences feels warm and deliberate
  },
  {
    label: "Bright & Clear",
    pitch: 1.35,
    rate: 1.00,
    preferFemale: true,
  },
  {
    label: "Deep Voice",
    pitch: 0.65,
    rate: 0.88,
    preferFemale: false,
  },
  {
    label: "News Anchor",
    pitch: 1.10,
    rate: 1.05,
    preferFemale: false,
  },
];

// ─── Build voice list ─────────────────────────────────────────────────────────

function buildVoiceList(): VoiceOption[] {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return [];
  const all = window.speechSynthesis.getVoices();

  // Real English voices — deduplicated by label
  const seen = new Set<string>();
  const real: VoiceOption[] = [];
  for (const v of all) {
    if (!v.lang.toLowerCase().startsWith("en")) continue;
    const label = labelVoice(v);
    if (seen.has(label)) continue;
    seen.add(label);
    real.push({ voice: v, label, pitch: 1.0, rate: 1.0 });
  }

  // Presets — each one picks the most suitable real voice for its gender preference
  const presets: VoiceOption[] = VOICE_PRESETS.map((p) => ({
    voice: pickVoice(all, p.preferFemale),
    label: p.label,
    pitch: p.pitch,
    rate: p.rate,
    preprocess: p.preprocess,
  }));

  return [...real, ...presets];
}

// ─── Component ────────────────────────────────────────────────────────────────

export function ListenStep({ lesson, audioUrl, audioSpeed, replaysUsed, onReplay, onReady }: ListenStepProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [paused, setPaused] = useState(false);
  const [played, setPlayed] = useState(false);
  const [speed, setSpeed] = useState(audioSpeed);
  const [voices, setVoices] = useState<VoiceOption[]>([]);
  const [selectedVoice, setSelectedVoice] = useState<VoiceOption | null>(null);
  // Refs so speakTTS always reads the latest values without stale closure
  const selectedVoiceRef = useRef<VoiceOption | null>(null);
  const speedRef = useRef<number>(audioSpeed);
  const ttsFallback = !audioUrl;

  useEffect(() => {
    function load() {
      const opts = buildVoiceList();
      if (opts.length === 0) return;
      setVoices(opts);
      // Default: British Female → American Female → first real voice
      const pref =
        opts.find((o) => o.label === "British Female") ??
        opts.find((o) => o.label === "American Female") ??
        opts.find((o) => !VOICE_PRESETS.some((p) => p.label === o.label)) ??
        opts[0];
      const v = pref ?? null;
      setSelectedVoice(v);
      selectedVoiceRef.current = v;
    }
    load();
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.onvoiceschanged = load;
    }
    return () => {
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.onvoiceschanged = null;
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  // Stable function — reads from refs so it always uses latest voice/speed
  const speakTTS = useCallback(() => {
    if (!("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const v = selectedVoiceRef.current;
    const s = speedRef.current;

    const text = v?.preprocess ? v.preprocess(lesson.passageText) : lesson.passageText;
    const utt = new SpeechSynthesisUtterance(text);

    // Base rate from user's speed preference, then multiplied by voice preset rate
    const baseRate = s === 0.75 ? 0.82 : s === 1.25 ? 1.12 : 1.0;
    utt.rate  = baseRate * (v?.rate ?? 1.0);
    utt.pitch = v?.pitch ?? 1.0;
    utt.lang  = "en-GB";
    if (v?.voice) utt.voice = v.voice;
    utt.onstart = () => { setPlaying(true); setPaused(false); };
    utt.onend   = () => { setPlaying(false); setPaused(false); };
    utt.onerror = () => { setPlaying(false); setPaused(false); };
    window.speechSynthesis.speak(utt);
  }, [lesson.passageText]); // stable — voice/speed read via refs

  const handlePlay = useCallback(() => {
    if (played && replaysUsed >= MAX_REPLAYS) return;
    if (played) onReplay();
    setPlayed(true);
    setPaused(false);

    if (ttsFallback) { speakTTS(); return; }

    const audio = audioRef.current;
    if (!audio) return;
    audio.playbackRate = speed;
    audio.currentTime = 0;
    audio.play().catch(() => speakTTS());
    setPlaying(true);
  }, [played, replaysUsed, speed, onReplay, ttsFallback, speakTTS]);

  const handlePause = useCallback(() => {
    if (ttsFallback) {
      window.speechSynthesis.pause();
      setPaused(true);
      setPlaying(false);
    } else {
      audioRef.current?.pause();
      setPaused(true);
      setPlaying(false);
    }
  }, [ttsFallback]);

  const handleResume = useCallback(() => {
    if (ttsFallback) {
      window.speechSynthesis.resume();
      setPaused(false);
      setPlaying(true);
    } else {
      audioRef.current?.play().catch(() => {});
      setPaused(false);
      setPlaying(true);
    }
  }, [ttsFallback]);

  const handleEnded = useCallback(() => { setPlaying(false); setPaused(false); }, []);

  const replaysLeft = MAX_REPLAYS - replaysUsed;
  const showVoicePicker = voices.length > 1;

  // Separate real voices from presets for grouping in the select
  const realVoices = voices.filter((v) => !VOICE_PRESETS.some((p) => p.label === v.label));
  const presetVoices = voices.filter((v) => VOICE_PRESETS.some((p) => p.label === v.label));

  return (
    <div className="flex-1 flex flex-col px-4 pt-5 pb-6 max-w-xl mx-auto w-full gap-4">
      {audioUrl && (
        <audio ref={audioRef} src={audioUrl} onEnded={handleEnded} aria-label={`Audio for ${lesson.title}`} />
      )}

      {/* Passage card */}
      <div className="rounded-2xl overflow-hidden shadow-sm border border-[var(--color-border)] bg-white">
        <div
          className="px-5 py-3 flex items-center gap-2"
          style={{ background: "linear-gradient(135deg, #7C3AED, #9333EA)" }}
        >
          <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true">
            <path d="M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2z"/>
            <path d="M22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z"/>
          </svg>
          <span className="text-[11px] font-bold text-white uppercase tracking-widest">Listen, then read aloud</span>
        </div>
        <div className="px-5 py-5">
          <p className="text-[var(--color-text)] text-[1.15rem] leading-[1.85] font-medium">
            {lesson.passageText}
          </p>
        </div>
      </div>

      {/* Controls card */}
      <div className="rounded-2xl bg-white shadow-sm border border-[var(--color-border)] px-5 py-5 flex flex-col items-center gap-4">
        {/* Waveform */}
        <div className="h-9 flex items-center">
          <Waveform active={playing} barCount={14} className="h-9" />
        </div>

        {/* Speed selector */}
        <div className="flex items-center gap-1 bg-[var(--color-surface-2)] rounded-full p-1" role="group" aria-label="Playback speed">
          {([0.75, 1.0, 1.25] as const).map((s) => (
            <button
              key={s}
              onClick={() => {
                setSpeed(s);
                speedRef.current = s;
                if (audioRef.current) audioRef.current.playbackRate = s;
                if (playing && ttsFallback) speakTTS();
              }}
              className={[
                "px-4 py-1.5 rounded-full text-sm font-bold transition-all duration-150 min-w-[54px]",
                speed === s
                  ? "bg-[var(--color-primary)] text-white shadow-sm"
                  : "text-[var(--color-text-secondary)] hover:text-[var(--color-text)]",
              ].join(" ")}
              aria-pressed={speed === s}
            >
              {s}×
            </button>
          ))}
        </div>

        {/* Voice picker */}
        {showVoicePicker && (
          <div className="flex items-center gap-2.5 w-full">
            <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="text-[var(--color-primary)] shrink-0" aria-hidden="true">
              <path d="M12 1a3 3 0 013 3v6a3 3 0 01-6 0V4a3 3 0 013-3z"/>
              <path d="M19 10v1a7 7 0 01-14 0v-1M12 19v4"/>
            </svg>
            <select
              value={selectedVoice?.label ?? ""}
              onChange={(e) => {
                const v = voices.find((o) => o.label === e.target.value);
                if (!v) return;
                selectedVoiceRef.current = v;
                setSelectedVoice(v);
                if (playing || paused) speakTTS();
              }}
              className="flex-1 text-sm bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-xl px-3 py-2 text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
              aria-label="Voice"
            >
              {realVoices.length > 0 && (
                <optgroup label="System voices">
                  {realVoices.map(({ label }) => (
                    <option key={label} value={label}>{label}</option>
                  ))}
                </optgroup>
              )}
              {presetVoices.length > 0 && (
                <optgroup label="Voice styles">
                  {presetVoices.map(({ label }) => (
                    <option key={label} value={label}>{label}</option>
                  ))}
                </optgroup>
              )}
            </select>
          </div>
        )}

        {/* Play / Pause / Resume button */}
        <div className="flex flex-col items-center gap-2">
          {!playing && !paused && (
            <button
              onClick={handlePlay}
              disabled={!played ? false : replaysLeft <= 0}
              aria-label="Play audio"
              className={[
                "w-[72px] h-[72px] rounded-full flex items-center justify-center transition-all duration-200",
                replaysLeft <= 0 && played
                  ? "bg-[var(--color-surface-2)] opacity-40 cursor-not-allowed"
                  : "shadow-lg hover:scale-105 active:scale-95",
              ].join(" ")}
              style={
                replaysLeft <= 0 && played
                  ? {}
                  : { background: "linear-gradient(135deg, #7C3AED, #9333EA)", boxShadow: "0 4px 20px rgba(124,58,237,0.40)" }
              }
            >
              <svg width="26" height="26" fill="white" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M8 5v14l11-7z"/>
              </svg>
            </button>
          )}

          {playing && (
            <button
              onClick={handlePause}
              aria-label="Pause audio"
              className="w-[72px] h-[72px] rounded-full flex items-center justify-center hover:opacity-90 active:scale-95 transition-all"
              style={{ background: "linear-gradient(135deg, #7C3AED, #9333EA)", boxShadow: "0 4px 20px rgba(124,58,237,0.40)" }}
            >
              <span className="flex gap-1.5">
                <span className="w-[5px] h-6 bg-white rounded-full" />
                <span className="w-[5px] h-6 bg-white rounded-full" />
              </span>
            </button>
          )}

          {paused && (
            <button
              onClick={handleResume}
              aria-label="Resume audio"
              className="w-[72px] h-[72px] rounded-full flex items-center justify-center hover:scale-105 active:scale-95 transition-all"
              style={{ background: "linear-gradient(135deg, #F97316, #FB923C)", boxShadow: "0 4px 20px rgba(249,115,22,0.40)" }}
            >
              <svg width="26" height="26" fill="white" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M8 5v14l11-7z"/>
              </svg>
            </button>
          )}

          <p className="text-xs text-[var(--color-muted)] h-4">
            {playing ? "Playing — tap to pause" :
             paused  ? "Paused — tap to resume" :
             played && replaysLeft > 0 ? `${replaysLeft} replay${replaysLeft !== 1 ? "s" : ""} left` :
             played && replaysLeft <= 0 ? "No replays remaining" :
             "Tap to listen"}
          </p>
        </div>
      </div>

      {/* CTA */}
      <div className="mt-auto flex flex-col gap-2">
        <Button
          variant="primary"
          size="lg"
          className="w-full"
          onClick={onReady}
          disabled={!played}
        >
          I&apos;m Ready to Read →
        </Button>
        {!played && (
          <p className="text-center text-xs text-[var(--color-muted)]">
            Listen to the passage first
          </p>
        )}
      </div>
    </div>
  );
}
