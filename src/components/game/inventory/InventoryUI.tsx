'use client'

import { useEffect } from 'react'
import { useInventoryStore, type InventoryCategory } from '@/stores/inventoryStore'
import { GlassPanel } from '@/components/ui/GlassPanel'
import { GlassButton } from '@/components/ui/GlassButton'
import { NeonText } from '@/components/ui/NeonText'

const categories: { value: InventoryCategory | 'all'; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'skills', label: 'Skills' },
  { value: 'knowledge', label: 'Knowledge' },
  { value: 'badges', label: 'Badges' },
  { value: 'traits', label: 'Traits' },
  { value: 'quest_items', label: 'Quest Items' },
  { value: 'collectibles', label: 'Collectibles' },
  { value: 'equipment', label: 'Equipment' },
]

const categoryIcons: Record<string, string> = {
  skills: '⚡',
  knowledge: '🧠',
  badges: '🏅',
  traits: '✦',
  quest_items: '📜',
  collectibles: '💎',
  equipment: '🛡',
}

interface InventoryUIProps {
  onClose: () => void
}

export function InventoryUI({ onClose }: InventoryUIProps) {
  const items = useInventoryStore((s) => s.items)
  const selectedCategory = useInventoryStore((s) => s.selectedCategory)
  const searchQuery = useInventoryStore((s) => s.searchQuery)
  const setSearchQuery = useInventoryStore((s) => s.setSearchQuery)
  const setSelectedCategory = useInventoryStore((s) => s.setSelectedCategory)
  const getFilteredItems = useInventoryStore((s) => s.getFilteredItems)

  const filtered = getFilteredItems()
  const allItems = Object.values(items)

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.code === 'Escape') {
        e.preventDefault()
        onClose()
      }
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [onClose])

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <GlassPanel padding="lg" rounded="xl" className="w-full max-w-[600px] max-h-[70vh] flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <NeonText color="purple" size="lg">Inventory</NeonText>
          <GlassButton size="sm" variant="default" onClick={onClose}>✕</GlassButton>
        </div>

        <input
          type="text"
          placeholder="Search inventory..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full px-3 py-2 text-sm bg-white/5 border border-white/10 rounded-lg text-white/80 placeholder-white/30 mb-3 focus:outline-none focus:border-neon-blue/40"
        />

        <div className="flex gap-1.5 flex-wrap mb-4">
          {categories.map((cat) => (
            <button
              key={cat.value}
              onClick={() => setSelectedCategory(cat.value)}
              className={`px-2.5 py-1 text-[10px] rounded-md transition-colors ${
                selectedCategory === cat.value
                  ? 'bg-neon-blue/20 text-neon-blue border border-neon-blue/30'
                  : 'text-white/50 border border-white/10 hover:bg-white/5'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto space-y-1 hide-scrollbar">
          {filtered.length === 0 ? (
            <div className="text-center py-8 text-white/30 text-sm">No items found</div>
          ) : (
            filtered.map((item) => (
              <GlassPanel key={item.id} padding="sm" rounded="md" className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-sm">
                  {categoryIcons[item.category] ?? '•'}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs text-white/80 truncate">{item.name}</div>
                  <div className="text-[10px] text-white/40 truncate">{item.description}</div>
                </div>
                {item.quantity > 1 && (
                  <span className="text-[10px] text-white/40 font-mono">×{item.quantity}</span>
                )}
              </GlassPanel>
            ))
          )}
        </div>

        <div className="mt-3 text-[10px] text-white/30">
          {filtered.length} / {allItems.length} items
        </div>
      </GlassPanel>
    </div>
  )
}
