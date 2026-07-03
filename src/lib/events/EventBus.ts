type Listener<T = unknown> = (payload: T) => void

const events = new Map<string, Set<Listener>>()

export const EventBus = {
  on<T>(event: string, listener: Listener<T>): () => void {
    if (!events.has(event)) events.set(event, new Set())
    events.get(event)!.add(listener as Listener)
    return () => events.get(event)?.delete(listener as Listener)
  },

  emit<T>(event: string, payload?: T): void {
    events.get(event)?.forEach((fn) => fn(payload as T))
  },

  off<T>(event: string, listener: Listener<T>): void {
    events.get(event)?.delete(listener as Listener)
  },

  clear(event?: string): void {
    if (event) events.delete(event)
    else events.clear()
  },
}
