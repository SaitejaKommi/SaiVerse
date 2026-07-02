import Link from 'next/link'

export default function FallbackPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-surface-950 px-4">
      <div className="flex max-w-lg flex-col items-center gap-6 text-center">
        <h1 className="text-3xl font-bold text-white">Saiteja Kommi</h1>
        <p className="text-surface-200/60">
          Software engineer, open-source contributor, and lifelong learner.
        </p>
        <div className="flex gap-4">
          <Link
            href="https://github.com/SaitejaKommi"
            className="text-sm text-neon-blue transition-colors hover:text-neon-blue/80"
            target="_blank"
            rel="noopener noreferrer"
          >
            GitHub
          </Link>
          <Link
            href="https://linkedin.com/in/saitejakommi"
            className="text-sm text-neon-blue transition-colors hover:text-neon-blue/80"
            target="_blank"
            rel="noopener noreferrer"
          >
            LinkedIn
          </Link>
          <Link
            href="/game"
            className="text-sm text-neon-purple transition-colors hover:text-neon-purple/80"
          >
            Try 3D Experience
          </Link>
        </div>
        <Link
          href="/"
          className="mt-4 rounded-full border border-white/10 px-6 py-2 text-sm text-surface-200/60 transition-all hover:border-white/20 hover:text-white"
        >
          Back to Home
        </Link>
      </div>
    </main>
  )
}
