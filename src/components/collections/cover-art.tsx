import type { Collection } from "@/content/schema";
import { luminance } from "@/lib/color";

/** Simple geometric artwork for collection covers (Paper Store-style illustration area). */
export function CoverArt({ art, color }: { art: Collection["art"]; color: string }) {
  const ink = luminance(color) < 0.45 ? "#ffffff" : "#141414";
  const soft = luminance(color) < 0.45 ? "rgba(255,255,255,.55)" : "rgba(20,20,20,.55)";
  const common = { fill: "none", stroke: ink, strokeWidth: 3, strokeLinecap: "round" as const };
  const motif = {
    orbits: (
      <>
        <circle cx="100" cy="120" r="22" fill={ink} />
        <ellipse cx="100" cy="120" rx="70" ry="26" {...common} transform="rotate(-20 100 120)" />
        <ellipse cx="100" cy="120" rx="52" ry="80" {...common} stroke={soft} />
        <circle cx="160" cy="98" r="7" fill={ink} />
      </>
    ),
    stack: (
      <>
        {[0, 1, 2, 3].map((i) => (
          <rect
            key={i}
            x={46 + i * 6}
            y={150 - i * 26}
            width="108"
            height="22"
            rx="5"
            fill={i % 2 ? soft : ink}
          />
        ))}
      </>
    ),
    grid: (
      <>
        {Array.from({ length: 9 }, (_, i) => (
          <rect
            key={i}
            x={50 + (i % 3) * 36}
            y={70 + Math.floor(i / 3) * 36}
            width="28"
            height="28"
            rx="7"
            fill={[0, 4, 8].includes(i) ? ink : soft}
          />
        ))}
      </>
    ),
    wave: (
      <>
        {[0, 1, 2, 3].map((i) => (
          <path
            key={i}
            d={`M30 ${90 + i * 22} q 35 -26 70 0 t 70 0`}
            {...common}
            stroke={i % 2 ? soft : ink}
          />
        ))}
        <circle cx="150" cy="70" r="16" fill={ink} />
      </>
    ),
    spark: (
      <>
        <path d="M100 50 L112 108 L170 120 L112 132 L100 190 L88 132 L30 120 L88 108Z" fill={ink} />
        <circle cx="160" cy="70" r="8" fill={soft} />
        <circle cx="46" cy="180" r="6" fill={soft} />
      </>
    ),
    frames: (
      <>
        <rect x="40" y="70" width="80" height="80" rx="10" {...common} />
        <rect x="70" y="95" width="80" height="80" rx="10" {...common} stroke={soft} />
        <path d="M95 115 l24 15 -24 15z" fill={ink} />
      </>
    ),
  }[art];
  return (
    <svg
      viewBox="0 0 200 240"
      className="absolute inset-x-0 bottom-0 h-[72%] w-full"
      aria-hidden="true"
    >
      {motif}
    </svg>
  );
}
