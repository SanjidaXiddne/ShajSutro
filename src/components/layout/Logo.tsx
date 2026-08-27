import Link from "next/link";

interface LogoProps {
  href?: string;
  size?: "sm" | "md" | "lg" | "xl" | "2xl";
  className?: string;
  dark?: boolean;
}

export default function Logo({
  href = "/",
  size = "md",
  className = "",
  dark = true,
}: LogoProps) {
  const dimensions = {
    sm: { h: 36, w: 140 },
    md: { h: 46, w: 180 },
    lg: { h: 56, w: 220 },
    xl: { h: 68, w: 270 },
    "2xl": { h: 80, w: 320 },
  }[size];

  const sutroColor = dark ? "#474D52" : "#FFFFFF";

  const mark = (
    <div
      className={`inline-flex items-center select-none transition-transform duration-300 group-hover:scale-105 ${className}`}
      style={{ height: `${dimensions.h}px`, width: "auto" }}
    >
      <svg
        height={dimensions.h}
        viewBox="0 0 320 85"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="h-full w-auto block overflow-visible"
        aria-hidden="true"
      >
        {/* ── 1. Green Shopping Cart Symbol ── */}
        <g transform="translate(5, 5)">
          {/* Smooth handle extending up-left */}
          <path
            d="M 5 18 C 14 18 20 23 25 32"
            stroke="#00B14F"
            strokeWidth="6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Outer Spiral Basket */}
          <path
            d="M 25 32 C 27 20 38 12 50 12 C 64 12 75 23 75 37 C 75 51 64 62 50 62 C 36 62 25 51 25 37"
            stroke="#00B14F"
            strokeWidth="6"
            strokeLinecap="round"
          />

          {/* Inner Solid Green Circle */}
          <circle cx="50" cy="37" r="11" fill="#00B14F" />

          {/* Bottom Wheels (Two Green Dots) */}
          <circle cx="41" cy="72" r="4.5" fill="#00B14F" />
          <circle cx="59" cy="72" r="4.5" fill="#00B14F" />
        </g>

        {/* ── 2. Brand Typography ── */}
        <g transform="translate(95, 0)">
          {/* SHAJ (Orange Italic) */}
          <text
            x="0"
            y="30"
            fill="#FF6200"
            fontFamily="Arial, system-ui, -apple-system, sans-serif"
            fontWeight="900"
            fontStyle="italic"
            fontSize="32"
            letterSpacing="0.5px"
          >
            SHAJ
          </text>

          {/* SUTRO (Dark Charcoal / White Italic) */}
          <text
            x="0"
            y="57"
            fill={sutroColor}
            fontFamily="Arial, system-ui, -apple-system, sans-serif"
            fontWeight="900"
            fontStyle="italic"
            fontSize="30"
            letterSpacing="0.5px"
          >
            SUTRO
          </text>

          {/* HAPPY SHOPPING (Orange Italic Tracked) */}
          <text
            x="2"
            y="72"
            fill="#FF6200"
            fontFamily="Arial, system-ui, -apple-system, sans-serif"
            fontWeight="800"
            fontStyle="italic"
            fontSize="10"
            letterSpacing="2.2px"
          >
            HAPPY SHOPPING
          </text>
        </g>
      </svg>
    </div>
  );

  return href ? (
    <Link
      href={href}
      className="group focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 rounded-lg inline-flex items-center shrink-0"
      aria-label="ShajSutro — Happy Shopping"
    >
      {mark}
    </Link>
  ) : (
    mark
  );
}
