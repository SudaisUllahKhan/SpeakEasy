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
  extraRate: number;
}

function labelVoice(v: SpeechSynthesisVoice): string {
  const n = v.name.toLowerCase();
  const l = v.lang.toLowerCase();
  if (n.includes("uk") || n.includes("british") || l === "en-gb")
    return n.includes("female") || n.includes("woman") ? "British Female" : "British Male";
  if (n.includes("australia") || l === "en-au") return "Australian";
  if (l === "en-in" || n.includes("india")) return "Indian English";
  if (n.includes("zira") || n.includes("samantha") || n.includes("victoria") || n.includes("karen") || n.includes("female") || n.includes("woman"))
    return "American Female";
  if (n.includes("david") || n.includes("mark") || n.includes("fred") || n.includes("alex"))
    return "American Male";
  if (n.includes("google")) return "Google English";
  return v.name.replace(/^(Microsoft|Google|Apple)\s+/i, "").split(/\s+/).slice(0, 3).join(" ");
}

// Pitch-based fun presets — work on all browsers, no extra voice needed
const FUN_PRESETS = [
  { label: "Child",       pitch: 1.8,  extraRate: 0.9  },
  { label: "Cartoon",     pitch: 2.0,  extraRate: 1.05 },
  { label: "Robot",       pitch: 0.3,  extraRate: 0.78 },
  { label: "Storyteller", pitch: 1.1,  extraRate: 0.78 },
];

function buildVoiceList(): VoiceOption[] {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return [];
  const all = window.speechSynthesis.getVoices();
  const seen = new Set<string>();
  const real: VoiceOption[] = [];
  for (const v of all) {
    if (!v.lang.toLowerCase().startsWith("en")) continue;
    const label = labelVoice(v);
    if (seen.has(label)) continue;
    seen.add(label);
    real.push({ voice: v, label, pitch: 1.0, extraRate: 1.0 });
  }
  // Fun presets always use null voice so the browser picks its best voice for pitch effects
  const fun: VoiceOption[] = FUN_PRESETS.map((p) => ({ ...p, voice: null }));
  return [...real, ...fun];
}

export function ListenStep({ lesson, audioUrl, audioSpeed, replaysUsed, onReplay, onReady }: ListenStepProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [paused, setPaused] = useState(false);
  const [played, setPlayed] = useState(false);
  const [speed, setSpeed] = useState(audioSpeed);
  const [voices, setVoices] = useState<VoiceOption[]>([]);
  const [selectedVoice, setSelectedVoice] = useState<VoiceOption | null>(null);
  // Ref so speakTTS always reads the latest voice without stale closure
  const selectedVoiceRef = useRef<VoiceOption | null>(null);
  const speedRef = useRef<number>(audioSpeed);
  const ttsFallback = !audioUrl;

  useEffect(() => {
    function load() {
      const opts = buildVoiceList();
      if (opts.length === 0) return;
      setVoices(opts);
      const pref = opts.find((o) => o.label === "British Female")
        ?? opts.find((o) => o.label === "American Female")
        ?? opts[0];
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
    const utt = new SpeechSynthesisUtterance(lesson.passageText);
    const baseRate = s === 0.75 ? 0.82 : s === 1.25 ? 1.12 : 1.0;
    utt.rate  = baseRate * (v?.extraRate ?? 1.0);
    utt.pitch = v?.pitch ?? 1.0;
    utt.lang  = "en-GB";
    if (v?.voice) utt.voice = v.voice;
    utt.onstart = () => { setPlaying(true); setPaused(false); };
    utt.onend   = () => { setPlaying(false); setPaused(false); };
    utt.onerror = () => { setPlaying(false); setPaused(false); };
    window.speechSynthesis.speak(utt);
  }, [lesson.passageText]); // stable — no voice/speed in deps

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

  return (
    <div className="flex-1 flex flex-col px-4 pt-5 pb-6 max-w-xl mx-auto w-full gap-4">
      {audioUrl && (
        <audio ref={audioRef} src={audioUrl} onEnded={handleEnded} aria-label={`Audio for ${lesson.title}`} />
      )}

      {/* Passage card */}
      <div className="rounded-2xl overflow-hidden shadow-sm border border-[var(--color-border)] bg-white">
        <div className="bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-primary-light)] px-5 py-3 flex items-center gap-2">
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
                if (playing && ttsFallback) speakTTS(); // restart TTS at new speed
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
                selectedVoiceRef.current = v; // update ref BEFORE calling speakTTS
                setSelectedVoice(v);
                if (playing || paused) speakTTS(); // restart immediately with new voice
              }}
              className="flex-1 text-sm bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-xl px-3 py-2 text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
              aria-label="Voice"
            >
              {voices.map(({ label }) => (
                <option key={label} value={label}>{label}</option>
              ))}
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
                  : "bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-primary-light)] shadow-lg shadow-[var(--color-primary)]/25 hover:scale-105 active:scale-95",
              ].join(" ")}
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
              className="w-[72px] h-[72px] rounded-full flex items-center justify-center bg-[var(--color-primary)] shadow-lg shadow-[var(--color-primary)]/25 hover:bg-[var(--color-primary-dark)] active:scale-95 transition-all"
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
              className="w-[72px] h-[72px] rounded-full flex items-center justify-center bg-gradient-to-br from-[var(--color-accent)] to-[var(--color-accent-light)] shadow-lg shadow-[var(--color-accent)]/25 hover:scale-105 active:scale-95 transition-all"
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
