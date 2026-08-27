"use client";

interface AdminSpinnerProps {
  label?: string;
  minHeight?: string;
}

export default function AdminSpinner({
  label = "Loading...",
  minHeight = "py-24",
}: AdminSpinnerProps) {
  return (
    <div className={`flex flex-col items-center justify-center ${minHeight}`}>
      <div className="relative flex items-center justify-center w-16 h-16 mb-4">
        {/* Outer Glowing Gradient Ring */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-r from-violet-600 via-indigo-500 to-purple-600 animate-spin blur-[3px] opacity-60" />

        {/* Inner Dark Backdrop Disc */}
        <div className="absolute inset-1 rounded-full bg-slate-950/80 backdrop-blur-md border border-slate-800" />

        {/* Spinning Gradient Border */}
        <div className="w-12 h-12 rounded-full border-2 border-transparent border-t-violet-400 border-r-indigo-400 animate-spin z-10" />

        {/* Center Sparkle */}
        <div className="absolute inset-0 flex items-center justify-center z-20">
          <span className="text-sm animate-pulse">✨</span>
        </div>
      </div>

      {label && (
        <p className="text-[11px] font-extrabold uppercase tracking-[0.22em] text-violet-300/80 animate-pulse">
          {label}
        </p>
      )}
    </div>
  );
}
