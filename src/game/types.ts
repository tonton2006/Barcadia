// Core game types - hexagonal grid system

export interface Cup {
  color: string;
  capacity: number;
  currentLevel: number;
}

// Axial coordinates for hex grid (q = column, r = row)
export interface HexCoord {
  q: number;
  r: number;
}

export interface Player {
  id: string;
  name: string;
  cup: Cup;
  position: HexCoord;
}

export interface Monster {
  name: string;
  damage: number;
  difficulty: number; // D20 roll needed to beat
}

export interface Tile {
  q: number;
  r: number;
  monster: Monster | null;
  isStart?: boolean;
}

export interface CombatResult {
  roll: number;
  needed: number;
  won: boolean;
  monster: Monster;
  damage?: number;
}

export type GamePhase = 'setup' | 'playing' | 'combat' | 'gameOver';

// Sparse hex map - only stores tiles that have been placed
export type HexMap = Map<string, Tile>;

// Helper to create map key from coords
export const hexKey = (q: number, r: number): string => `${q},${r}`;

// Get all 6 hex neighbors
export const getHexNeighbors = (q: number, r: number): HexCoord[] => [
  { q: q + 1, r: r },     // East
  { q: q - 1, r: r },     // West
  { q: q, r: r + 1 },     // Southeast
  { q: q, r: r - 1 },     // Northwest
  { q: q + 1, r: r - 1 }, // Northeast
  { q: q - 1, r: r + 1 }, // Southwest
];

export interface GameState {
  players: Player[];
  map: HexMap;
  currentPlayerIndex: number;
  phase: GamePhase;
  lastCombat: CombatResult | null;
  winner: Player | null;
}
