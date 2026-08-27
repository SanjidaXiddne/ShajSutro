"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("App Error:", error);
  }, [error]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-950 text-slate-100 p-6 text-center">
      <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-2xl mb-4">
        ⚠️
      </div>
      <h1 className="text-3xl font-black tracking-tight mb-2">Something went wrong!</h1>
      <p className="text-slate-400 max-w-md text-sm mb-6 leading-relaxed">
        An unexpected error occurred while loading this page.
      </p>
      <div className="flex gap-4">
        <button
          onClick={() => reset()}
          className="px-6 py-3 rounded-full bg-violet-600 hover:bg-violet-700 text-white text-sm font-bold transition-all shadow-lg shadow-violet-600/25"
        >
          Try Again
        </button>
        <Link
          href="/"
          className="px-6 py-3 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-bold transition-all"
        >
          Back to Home
        </Link>
      </div>
    </div>
  );
}
