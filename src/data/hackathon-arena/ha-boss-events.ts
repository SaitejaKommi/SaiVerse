export interface BossEventDef {
  id: string
  name: string
  description: string
  station: 'code' | 'debug'
  severity: 1 | 2
}

export const BOSS_EVENTS: BossEventDef[] = [
  { id: 'bug', name: 'Bug Detected', description: 'A critical bug was found in your code', station: 'debug', severity: 1 },
  { id: 'merge-conflict', name: 'Merge Conflict', description: 'Your changes conflict with the main branch', station: 'code', severity: 1 },
  { id: 'build-failed', name: 'Build Failed', description: 'The project build failed unexpectedly', station: 'debug', severity: 2 },
  { id: 'system-crash', name: 'System Crash', description: 'Your dev environment crashed', station: 'debug', severity: 2 },
  { id: 'missing-asset', name: 'Missing Asset', description: 'A required asset is missing from the project', station: 'code', severity: 1 },
  { id: 'api-timeout', name: 'API Timeout', description: 'The external API is not responding', station: 'debug', severity: 2 },
  { id: 'memory-leak', name: 'Memory Leak', description: 'The app is consuming too much memory', station: 'code', severity: 1 },
  { id: 'test-failure', name: 'Test Failure', description: 'Critical tests are failing in CI', station: 'debug', severity: 2 },
]

export function pickBossEvents(): BossEventDef[] {
  const count = 2 + Math.floor(Math.random() * 2)
  const shuffled = [...BOSS_EVENTS].sort(() => Math.random() - 0.5)
  return shuffled.slice(0, count)
}
