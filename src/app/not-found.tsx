import Link from 'next/link'

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-surface-950 px-4">
      <div className="flex flex-col items-center gap-6 text-center">
        <span className="font-mono text-8xl font-bold text-neon-blue/20">404</span>
        <h1 className="text-2xl font-semibold text-white">Page Not Found</h1>
        <p className="max-w-md text-surface-200/40">
          But you found something. This is the hidden 404 room — a quiet place where lost pages go.
          Not all who wander are lost.
        </p>
        <Link
          href="/"
          className="rounded-full border border-white/10 px-6 py-2 text-sm font-medium text-surface-200/60 transition-all hover:border-white/20 hover:text-white"
        >
          Return Home
        </Link>
      </div>
    </main>
  )
}
