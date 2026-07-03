import { create } from 'zustand'

export type InventoryCategory = 'skills' | 'knowledge' | 'badges' | 'traits' | 'quest_items' | 'collectibles' | 'equipment'

export interface InventoryItem {
  id: string
  category: InventoryCategory
  name: string
  description: string
  icon?: string
  quantity: number
  maxQuantity: number
  isVisible: boolean
  data?: Record<string, unknown>
}

interface InventoryState {
  items: Record<string, InventoryItem>
  searchQuery: string
  selectedCategory: InventoryCategory | 'all'
  sortBy: 'name' | 'category' | 'quantity'
  sortOrder: 'asc' | 'desc'
}

interface InventoryActions {
  addItem: (item: InventoryItem) => void
  removeItem: (id: string, quantity?: number) => void
  hasItem: (id: string) => boolean
  getItem: (id: string) => InventoryItem | undefined
  getItemsByCategory: (category: InventoryCategory) => InventoryItem[]
  getFilteredItems: () => InventoryItem[]
  setSearchQuery: (query: string) => void
  setSelectedCategory: (category: InventoryCategory | 'all') => void
  setSortBy: (sortBy: 'name' | 'category' | 'quantity') => void
  setSortOrder: (order: 'asc' | 'desc') => void
  reset: () => void
}

const initialState: InventoryState = {
  items: {},
  searchQuery: '',
  selectedCategory: 'all',
  sortBy: 'name',
  sortOrder: 'asc',
}

const useInventoryStore = create<InventoryState & InventoryActions>()((set, get) => ({
  ...initialState,

  addItem: (item) =>
    set((state) => {
      const existing = state.items[item.id]
      if (existing) {
        return {
          items: {
            ...state.items,
            [item.id]: {
              ...existing,
              quantity: Math.min(existing.maxQuantity, existing.quantity + item.quantity),
            },
          },
        }
      }
      return { items: { ...state.items, [item.id]: item } }
    }),

  removeItem: (id, quantity = 1) =>
    set((state) => {
      const existing = state.items[id]
      if (!existing) return state
      const newQty = existing.quantity - quantity
      if (newQty <= 0) {
        const { [id]: _removed, ...rest } = state.items
        return { items: rest }
      }
      return {
        items: { ...state.items, [id]: { ...existing, quantity: newQty } },
      }
    }),

  hasItem: (id) => id in get().items,

  getItem: (id) => get().items[id],

  getItemsByCategory: (category) =>
    Object.values(get().items).filter((item) => item.category === category),

  getFilteredItems: () => {
    const { items, searchQuery, selectedCategory, sortBy, sortOrder } = get()
    let result = Object.values(items)

    if (selectedCategory !== 'all') {
      result = result.filter((item) => item.category === selectedCategory)
    }

    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      result = result.filter((item) => item.name.toLowerCase().includes(q) || item.description.toLowerCase().includes(q))
    }

    result.sort((a, b) => {
      const aVal = String(a[sortBy] ?? '')
      const bVal = String(b[sortBy] ?? '')
      const cmp = aVal.localeCompare(bVal)
      return sortOrder === 'asc' ? cmp : -cmp
    })

    return result
  },

  setSearchQuery: (searchQuery) => set({ searchQuery }),
  setSelectedCategory: (selectedCategory) => set({ selectedCategory }),
  setSortBy: (sortBy) => set({ sortBy }),
  setSortOrder: (sortOrder) => set({ sortOrder }),

  reset: () => set(initialState),
}))

export { useInventoryStore }
export type { InventoryState, InventoryActions }
