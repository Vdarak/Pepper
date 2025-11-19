import Link from "next/link";

export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <main className="flex flex-col items-center gap-8 p-8">
        <h1 className="text-5xl font-bold text-gray-900 text-center">
          ChartMaze US
        </h1>
        <p className="text-xl text-gray-700 text-center max-w-2xl">
          AI-powered stock pattern scanner for US markets. Detect horizontal resistance, VCP patterns, and flags & pennants.
        </p>
        <div className="flex flex-col gap-4 mt-8">
          <Link
            href="/scanners/horizontal-resistance"
            className="flex h-12 w-full items-center justify-center rounded-full bg-blue-600 px-8 text-white transition-colors hover:bg-blue-700 min-w-[250px]"
          >
            View Pattern Scanners
          </Link>
          <p className="text-sm text-gray-600 text-center">
            Built with Next.js, Supabase, and TradingView Lightweight Charts
          </p>
        </div>
      </main>
    </div>
  );
}
