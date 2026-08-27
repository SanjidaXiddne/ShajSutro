import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-950 text-slate-100 p-6 text-center">
      <div className="w-16 h-16 rounded-2xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-2xl mb-4">
        🔍
      </div>
      <h1 className="text-4xl font-black tracking-tight mb-2">404 - Page Not Found</h1>
      <p className="text-slate-400 max-w-md text-sm mb-6 leading-relaxed">
        The page you are looking for does not exist or has been moved.
      </p>
      <Link
        href="/"
        className="px-6 py-3 rounded-full bg-violet-600 hover:bg-violet-700 text-white text-sm font-bold transition-all shadow-lg shadow-violet-600/25"
      >
        Back to Home
      </Link>
    </div>
  );
}
