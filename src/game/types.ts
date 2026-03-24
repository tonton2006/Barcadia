// Core game types - ported from game.py

export interface Cup {
  color: string;
  capacity: number;
  currentLevel: number;
}

export interface Player {
  id: string;
  name: string;
  cup: Cup;
  position: { x: number; y: number };
}

export interface Monster {
  name: string;
  damage: number;
  difficulty: number; // D20 roll needed to beat
}

export interface Tile {
  x: number;
  y: number;
  monster: Monster | null;
  revealed: boolean;
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

export interface GameState {
  players: Player[];
  map: Tile[][];
  currentPlayerIndex: number;
  phase: GamePhase;
  width: number;
  height: number;
  lastCombat: CombatResult | null;
  winner: Player | null;
}
