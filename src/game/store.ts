import { create } from 'zustand';
import { GameState, Player, Tile, Monster, CombatResult, Cup, HexMap, hexKey, getHexNeighbors, HexCoord } from './types';

// Monster templates
const MONSTERS: Omit<Monster, 'damage'>[] = [
  { name: 'Goblin', difficulty: 5 },
  { name: 'Skeleton', difficulty: 8 },
  { name: 'Orc', difficulty: 10 },
  { name: 'Troll', difficulty: 12 },
  { name: 'Dark Knight', difficulty: 15 },
  { name: 'Dragon Whelp', difficulty: 18 },
];

const rollD20 = () => Math.floor(Math.random() * 20) + 1;

const createCup = (color: string, capacity: number): Cup => ({
  color,
  capacity,
  currentLevel: capacity,
});

// Generate a random tile (called when player explores)
const generateTile = (q: number, r: number): Tile => {
  let monster: Monster | null = null;

  // 30% chance for monster
  if (Math.random() < 0.3) {
    const template = MONSTERS[Math.floor(Math.random() * MONSTERS.length)];
    monster = {
      ...template,
      damage: Math.ceil(Math.random() * 2), // 1-2 damage
    };
  }

  return { q, r, monster };
};

const PLAYER_COLORS = ['#e94560', '#4ecdc4', '#ffe66d', '#95e1d3', '#f38181', '#aa96da', '#a8d8ea', '#fcbad3', '#aa96da', '#f8b500'];

interface GameStore extends GameState {
  // Actions
  startGame: (playerNames: string[]) => void;
  placeTile: (q: number, r: number) => void;
  dismissCombat: () => void;
  resetGame: () => void;
}

const initialState: GameState = {
  players: [],
  map: new Map(),
  currentPlayerIndex: 0,
  phase: 'setup',
  lastCombat: null,
  winner: null,
};

export const useGameStore = create<GameStore>((set, get) => ({
  ...initialState,

  startGame: (playerNames: string[]) => {
    // Create starting tile at origin
    const startTile: Tile = { q: 0, r: 0, monster: null, isStart: true };
    const map: HexMap = new Map();
    map.set(hexKey(0, 0), startTile);

    // All players start at origin with 10 health
    const players: Player[] = playerNames.map((name, i) => ({
      id: `player-${i}`,
      name,
      cup: createCup(PLAYER_COLORS[i % PLAYER_COLORS.length], 10),
      position: { q: 0, r: 0 },
    }));

    set({
      players,
      map,
      currentPlayerIndex: 0,
      phase: 'playing',
      lastCombat: null,
      winner: null,
    });
  },

  placeTile: (q: number, r: number) => {
    const { map, players, currentPlayerIndex, phase } = get();
    if (phase !== 'playing') return;

    const player = players[currentPlayerIndex];
    const { q: pq, r: pr } = player.position;

    // Check if this is a valid neighbor of current position
    const neighbors = getHexNeighbors(pq, pr);
    const isNeighbor = neighbors.some(n => n.q === q && n.r === r);
    if (!isNeighbor) return;

    // Check tile doesn't already exist
    const key = hexKey(q, r);
    if (map.has(key)) return;

    // Create the new tile
    const newTile = generateTile(q, r);
    const newMap = new Map(map);
    newMap.set(key, newTile);

    // Move player to new tile
    const newPlayers = players.map(p => ({ ...p, cup: { ...p.cup } }));
    newPlayers[currentPlayerIndex].position = { q, r };

    // Check for combat
    if (newTile.monster) {
      const roll = rollD20();
      const won = roll >= newTile.monster.difficulty;

      const combat: CombatResult = {
        roll,
        needed: newTile.monster.difficulty,
        won,
        monster: newTile.monster,
      };

      if (!won) {
        // Take damage
        combat.damage = newTile.monster.damage;
        newPlayers[currentPlayerIndex].cup.currentLevel -= newTile.monster.damage;

        // Check for elimination
        if (newPlayers[currentPlayerIndex].cup.currentLevel <= 0) {
          newPlayers[currentPlayerIndex].cup.currentLevel = 0;

          // Check if game over (only one player left)
          const alivePlayers = newPlayers.filter(p => p.cup.currentLevel > 0);
          if (alivePlayers.length === 1) {
            set({
              players: newPlayers,
              map: newMap,
              phase: 'gameOver',
              lastCombat: combat,
              winner: alivePlayers[0],
            });
            return;
          }
        }
      } else {
        // Monster defeated - clear it
        newMap.set(key, { ...newTile, monster: null });
      }

      set({
        players: newPlayers,
        map: newMap,
        phase: 'combat',
        lastCombat: combat,
      });
      return;
    }

    // No combat - auto advance turn
    const nextIndex = findNextAlivePlayer(newPlayers, currentPlayerIndex);

    set({
      players: newPlayers,
      map: newMap,
      currentPlayerIndex: nextIndex,
    });
  },

  dismissCombat: () => {
    const { players, currentPlayerIndex } = get();

    // Auto advance to next player after combat
    const nextIndex = findNextAlivePlayer(players, currentPlayerIndex);

    set({
      phase: 'playing',
      lastCombat: null,
      currentPlayerIndex: nextIndex,
    });
  },

  resetGame: () => {
    set({
      ...initialState,
      map: new Map(), // Need fresh Map instance
    });
  },
}));

// Helper to find next alive player
function findNextAlivePlayer(players: Player[], currentIndex: number): number {
  for (let i = 1; i <= players.length; i++) {
    const idx = (currentIndex + i) % players.length;
    if (players[idx].cup.currentLevel > 0) {
      return idx;
    }
  }
  return currentIndex;
}

// Export helper for components to check placeable positions
export function getPlaceablePositions(map: HexMap, playerPos: HexCoord): HexCoord[] {
  const neighbors = getHexNeighbors(playerPos.q, playerPos.r);
  return neighbors.filter(n => !map.has(hexKey(n.q, n.r)));
}
