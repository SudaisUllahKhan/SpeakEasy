// Professional SVG icon set for SpeakEasy
// All icons are 24×24 viewBox, stroke-based, accessible

interface IconProps {
  size?: number;
  className?: string;
  "aria-hidden"?: boolean;
}

const base = (props: IconProps) => ({
  width: props.size ?? 20,
  height: props.size ?? 20,
  fill: "none",
  viewBox: "0 0 24 24",
  strokeWidth: 1.8,
  stroke: "currentColor",
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  className: props.className,
  "aria-hidden": props["aria-hidden"] ?? true,
});

export function MicIcon(p: IconProps) {
  return (
    <svg {...base(p)}>
      <path d="M12 1a4 4 0 014 4v6a4 4 0 01-8 0V5a4 4 0 014-4z" />
      <path d="M19 10v1a7 7 0 01-14 0v-1" />
      <path d="M12 19v4" />
      <path d="M8 23h8" />
    </svg>
  );
}

export function SpeakerIcon(p: IconProps) {
  return (
    <svg {...base(p)}>
      <path d="M11 5L6 9H2v6h4l5 4V5z" />
      <path d="M15.54 8.46a5 5 0 010 7.07" />
      <path d="M19.07 4.93a10 10 0 010 14.14" />
    </svg>
  );
}

export function FlameIcon(p: IconProps) {
  return (
    <svg {...base(p)}>
      <path d="M12 2c0 0-5 4.5-5 9a5 5 0 0010 0c0-1.5-.5-3-1.5-4C15 9 13 11 12 11c0 0 1-3-1-5-1 2-2 3-2 5a3 3 0 006 0c0-2-1-3.5-3-5z" />
    </svg>
  );
}

export function StarIcon(p: IconProps) {
  return (
    <svg {...base(p)}>
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
    </svg>
  );
}

export function TrophyIcon(p: IconProps) {
  return (
    <svg {...base(p)}>
      <path d="M6 9H4a2 2 0 000 4h2" />
      <path d="M18 9h2a2 2 0 010 4h-2" />
      <path d="M6 9V3h12v6a6 6 0 01-12 0z" />
      <path d="M12 15v6" />
      <path d="M8 21h8" />
    </svg>
  );
}

export function BoltIcon(p: IconProps) {
  return (
    <svg {...base(p)}>
      <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
    </svg>
  );
}

export function BrainIcon(p: IconProps) {
  return (
    <svg {...base(p)}>
      <path d="M9.5 2A2.5 2.5 0 007 4.5v.5A2.5 2.5 0 004.5 7.5 2.5 2.5 0 002 10c0 1.5.8 2.8 2 3.5V17a5 5 0 005 5h6a5 5 0 005-5v-3.5c1.2-.7 2-2 2-3.5a2.5 2.5 0 00-2.5-2.5A2.5 2.5 0 0017 5v-.5A2.5 2.5 0 0014.5 2" />
      <path d="M12 7v10" />
    </svg>
  );
}

export function CheckCircleIcon(p: IconProps) {
  return (
    <svg {...base(p)}>
      <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
      <path d="M22 4L12 14.01l-3-3" />
    </svg>
  );
}

export function BookOpenIcon(p: IconProps) {
  return (
    <svg {...base(p)}>
      <path d="M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2z" />
      <path d="M22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z" />
    </svg>
  );
}

export function RefreshIcon(p: IconProps) {
  return (
    <svg {...base(p)}>
      <path d="M23 4v6h-6" />
      <path d="M1 20v-6h6" />
      <path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15" />
    </svg>
  );
}

export function ArrowRightIcon(p: IconProps) {
  return (
    <svg {...base(p)}>
      <path d="M5 12h14" />
      <path d="M12 5l7 7-7 7" />
    </svg>
  );
}

export function XPIcon(p: IconProps) {
  return (
    <svg {...base(p)}>
      <circle cx="12" cy="12" r="10" />
      <path d="M9 9l6 6M15 9l-6 6" />
    </svg>
  );
}

export function StreakIcon(p: IconProps) {
  return (
    <svg {...base(p)} fill="none">
      <path
        d="M12 2C12 2 8 6 8 10c0 1.1.4 2 1 2.7C8.4 11.5 8 10 9 8c1 3 3 4 3 7a4 4 0 01-4-4c-1 1.5-1 3-1 4a5 5 0 0010 0c0-4-4-7-5-13z"
        strokeWidth={1.8}
      />
    </svg>
  );
}

export function HomeIcon(p: IconProps) {
  return (
    <svg {...base(p)}>
      <path d="M3 12L12 3l9 9" />
      <path d="M5 10v9a1 1 0 001 1h4v-5h4v5h4a1 1 0 001-1v-9" />
    </svg>
  );
}

export function GridIcon(p: IconProps) {
  return (
    <svg {...base(p)}>
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
      <rect x="14" y="14" width="7" height="7" rx="1" />
    </svg>
  );
}

export function ChartIcon(p: IconProps) {
  return (
    <svg {...base(p)}>
      <path d="M3 3v18h18" />
      <path d="M7 16l4-4 4 4 4-7" />
    </svg>
  );
}

export function SettingsIcon(p: IconProps) {
  return (
    <svg {...base(p)}>
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" />
    </svg>
  );
}

export function RocketIcon(p: IconProps) {
  return (
    <svg {...base(p)}>
      <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 00-2.91-.09z" />
      <path d="M12 15l-3-3a22 22 0 012-3.95A12.88 12.88 0 0122 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 01-4 2z" />
      <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0" />
      <path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5" />
    </svg>
  );
}

export function CheckIcon(p: IconProps) {
  return (
    <svg {...base(p)}>
      <path d="M20 6L9 17l-5-5" />
    </svg>
  );
}

export function WordIcon(p: IconProps) {
  return (
    <svg {...base(p)}>
      <path d="M4 7V4h16v3" />
      <path d="M9 20h6" />
      <path d="M12 4v16" />
    </svg>
  );
}

export function LockIcon(p: IconProps) {
  return (
    <svg {...base(p)}>
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0110 0v4" />
    </svg>
  );
}

export function MedalIcon(p: IconProps) {
  return (
    <svg {...base(p)}>
      <circle cx="12" cy="15" r="6" />
      <path d="M8.56 2.9A7 7 0 0116 7h-4M8 7H4a7 7 0 007.44 5.1" />
      <path d="M12 12v6" />
    </svg>
  );
}
