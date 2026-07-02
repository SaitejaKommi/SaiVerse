import Link from 'next/link'

export default function HomePage() {
  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-surface-950">
      <div className="absolute inset-0 bg-gradient-radial from-brand-950/40 via-surface-950 to-surface-950" />

      <div className="relative z-10 flex flex-col items-center gap-8 px-4 text-center">
        <div className="flex flex-col items-center gap-2">
          <span className="text-sm font-medium tracking-[0.3em] text-neon-blue uppercase">
            SaiVerse
          </span>
          <h1 className="max-w-3xl text-4xl font-bold tracking-tight text-white sm:text-6xl md:text-7xl">
            An Interactive
            <br />
            <span className="bg-gradient-to-r from-neon-blue via-neon-purple to-neon-pink bg-clip-text text-transparent">
              3D Adventure
            </span>
          </h1>
          <p className="mt-4 max-w-lg text-lg text-surface-200/60">
            Every expert once stood exactly where you are now.
            <br />
            Explore Sai&apos;s engineering journey through an immersive 3D world.
          </p>
        </div>

        <div className="flex flex-col items-center gap-4 sm:flex-row">
          <Link
            href="/game"
            className="group relative inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-neon-blue to-neon-purple px-8 py-3 text-sm font-semibold text-white transition-all hover:scale-105 hover:shadow-lg hover:shadow-neon-blue/25"
          >
            <span>Enter SaiVerse</span>
            <span className="transition-transform group-hover:translate-x-1">→</span>
          </Link>

          <Link
            href="/fallback"
            className="inline-flex items-center gap-2 rounded-full border border-white/10 px-8 py-3 text-sm font-medium text-surface-200/60 transition-all hover:border-white/20 hover:text-white"
          >
            View Traditional Portfolio
          </Link>
        </div>

        <div className="mt-8 flex items-center gap-6 text-xs text-surface-400/40">
          <span>React Three Fiber</span>
          <span className="h-1 w-1 rounded-full bg-surface-600/40" />
          <span>Next.js</span>
          <span className="h-1 w-1 rounded-full bg-surface-600/40" />
          <span>TypeScript</span>
        </div>
      </div>

      <footer className="fixed bottom-6 left-1/2 z-10 -translate-x-1/2 text-center text-xs text-surface-400/30">
        &copy; {new Date().getFullYear()} Saiteja Kommi. All rights reserved.
      </footer>
    </main>
  )
}
