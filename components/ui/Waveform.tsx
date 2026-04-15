"use client";

interface WaveformProps {
  active?: boolean;
  barCount?: number;
  className?: string;
}

export function Waveform({ active = false, barCount = 8, className }: WaveformProps) {
  if (!active) {
    return (
      <div className={`flex items-center gap-1 h-6 ${className ?? ""}`} aria-hidden="true">
        {Array.from({ length: barCount }).map((_, i) => (
          <div
            key={i}
            className="w-1 h-1 rounded-full bg-[var(--color-muted)]"
          />
        ))}
      </div>
    );
  }

  return (
    <div
      className={`flex items-end gap-1 h-6 ${className ?? ""}`}
      role="status"
      aria-label="Audio playing"
    >
      {Array.from({ length: barCount }).map((_, i) => (
        <div
          key={i}
          className="wave-bar w-1 rounded-sm"
          style={{ animationDelay: `${(i % 5) * 0.1}s` }}
        />
      ))}
    </div>
  );
}
