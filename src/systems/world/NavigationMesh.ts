import type { NavMeshCell } from './world.types'

export class NavigationMesh {
  #cells: Map<number, NavMeshCell> = new Map()
  #grid: Map<string, number> = new Map()
  #cellSize: number

  constructor(cellSize = 2) {
    this.#cellSize = cellSize
  }

  buildFromWalkableArea(
    walkableFn: (x: number, z: number) => boolean,
    worldSize: number,
  ): void {
    this.#cells.clear()
    this.#grid.clear()

    const halfSize = worldSize / 2
    let cellId = 0

    for (let x = -halfSize; x < halfSize; x += this.#cellSize) {
      for (let z = -halfSize; z < halfSize; z += this.#cellSize) {
        const centerX = x + this.#cellSize / 2
        const centerZ = z + this.#cellSize / 2
        const walkable = walkableFn(centerX, centerZ)

        const cell: NavMeshCell = {
          id: cellId,
          center: [centerX, centerZ],
          vertices: [
            [x, z],
            [x + this.#cellSize, z],
            [x + this.#cellSize, z + this.#cellSize],
            [x, z + this.#cellSize],
          ],
          neighbors: [],
          walkable,
        }

        this.#cells.set(cellId, cell)
        this.#grid.set(this.#gridKey(centerX, centerZ), cellId)
        cellId++
      }
    }

    this.#computeNeighbors()
  }

  #gridKey(x: number, z: number): string {
    const gx = Math.floor(x / this.#cellSize) * this.#cellSize
    const gz = Math.floor(z / this.#cellSize) * this.#cellSize
    return `${gx}:${gz}`
  }

  #computeNeighbors(): void {
    const dirs = [
      [-1, 0], [1, 0], [0, -1], [0, 1],
      [-1, -1], [1, -1], [-1, 1], [1, 1],
    ]

    for (const [, cell] of this.#cells) {
      if (!cell.walkable) continue

      for (const d of dirs) {
        const dx = d[0]!
        const dz = d[1]!
        const nx = cell.center[0] + dx * this.#cellSize
        const nz = cell.center[1] + dz * this.#cellSize
        const neighborId = this.#grid.get(this.#gridKey(nx, nz))

        if (neighborId !== undefined) {
          const neighbor = this.#cells.get(neighborId)
          if (neighbor?.walkable && !cell.neighbors.includes(neighborId)) {
            cell.neighbors.push(neighborId)
          }
        }
      }
    }
  }

  findPath(
    startX: number,
    startZ: number,
    endX: number,
    endZ: number,
  ): [number, number][] {
    const startId = this.#grid.get(this.#gridKey(startX, startZ))
    const endId = this.#grid.get(this.#gridKey(endX, endZ))

    if (startId === undefined || endId === undefined) return []

    const openSet = new Set<number>([startId])
    const cameFrom = new Map<number, number>()
    const gScore = new Map<number, number>()
    const fScore = new Map<number, number>()

    gScore.set(startId, 0)
    fScore.set(startId, this.#heuristic(startId, endId))

    while (openSet.size > 0) {
      const current = this.#findLowestFScore(openSet, fScore)
      if (current === null) break

      if (current === endId) {
        return this.#reconstructPath(cameFrom, current)
      }

      openSet.delete(current)

      const cell = this.#cells.get(current)
      if (!cell) continue

      for (const neighborId of cell.neighbors) {
        const tentativeG = (gScore.get(current) ?? Infinity) + this.#cellSize

        if (tentativeG < (gScore.get(neighborId) ?? Infinity)) {
          cameFrom.set(neighborId, current)
          gScore.set(neighborId, tentativeG)
          fScore.set(neighborId, tentativeG + this.#heuristic(neighborId, endId))
          openSet.add(neighborId)
        }
      }
    }

    return []
  }

  #heuristic(a: number, b: number): number {
    const cellA = this.#cells.get(a)
    const cellB = this.#cells.get(b)
    if (!cellA || !cellB) return Infinity

    const dx = cellA.center[0] - cellB.center[0]
    const dz = cellA.center[1] - cellB.center[1]
    return Math.sqrt(dx * dx + dz * dz)
  }

  #findLowestFScore(
    set: Set<number>,
    fScore: Map<number, number>,
  ): number | null {
    let lowest: number | null = null
    let lowestScore = Infinity

    for (const id of set) {
      const score = fScore.get(id) ?? Infinity
      if (score < lowestScore) {
        lowest = id
        lowestScore = score
      }
    }

    return lowest
  }

  #reconstructPath(
    cameFrom: Map<number, number>,
    current: number,
  ): [number, number][] {
    const path: [number, number][] = []
    let node = current

    while (cameFrom.has(node)) {
      const cell = this.#cells.get(node)
      if (cell) {
        path.unshift([cell.center[0], cell.center[1]])
      }
      node = cameFrom.get(node)!
    }

    const firstCell = this.#cells.get(node)
    if (firstCell) {
      path.unshift([firstCell.center[0], firstCell.center[1]])
    }

    return path
  }

  getCell(x: number, z: number): NavMeshCell | undefined {
    return this.#cells.get(this.#grid.get(this.#gridKey(x, z)) ?? -1)
  }

  isWalkable(x: number, z: number): boolean {
    return this.getCell(x, z)?.walkable ?? false
  }

  get cells(): Map<number, NavMeshCell> {
    return this.#cells
  }

  get cellSize(): number {
    return this.#cellSize
  }

  clear(): void {
    this.#cells.clear()
    this.#grid.clear()
  }
}
