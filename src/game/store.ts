import { create } from 'zustand';
import { GameState, Player, Tile, Monster, CombatResult, Cup } from './types';

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

const generateMap = (width: number, height: number): Tile[][] => {
  const map: Tile[][] = [];
  for (let y = 0; y < height; y++) {
    const row: Tile[] = [];
    for (let x = 0; x < width; x++) {
      const isStart = x === 0 && y === Math.floor(height / 2);
      let monster: Monster | null = null;

      // 30% chance for monster, but not on start tile
      if (!isStart && Math.random() < 0.3) {
        const template = MONSTERS[Math.floor(Math.random() * MONSTERS.length)];
        monster = {
          ...template,
          damage: Math.ceil(Math.random() * 2), // 1-2 damage
        };
      }

      row.push({
        x,
        y,
        monster,
        revealed: isStart,
        isStart,
      });
    }
    map.push(row);
  }
  return map;
};

const PLAYER_COLORS = ['#e94560', '#4ecdc4', '#ffe66d', '#95e1d3', '#f38181', '#aa96da'];

interface GameStore extends GameState {
  // Actions
  startGame: (playerNames: string[]) => void;
  moveTo: (x: number, y: number) => void;
  endTurn: () => void;
  resetGame: () => void;
  dismissCombat: () => void;
}

const initialState: GameState = {
  players: [],
  map: [],
  currentPlayerIndex: 0,
  phase: 'setup',
  width: 5,
  height: 5,
  lastCombat: null,
  winner: null,
};

export const useGameStore = create<GameStore>((set, get) => ({
  ...initialState,

  startGame: (playerNames: string[]) => {
    const { width, height } = get();
    const startY = Math.floor(height / 2);

    const players: Player[] = playerNames.map((name, i) => ({
      id: `player-${i}`,
      name,
      cup: createCup(PLAYER_COLORS[i % PLAYER_COLORS.length], 5),
      position: { x: 0, y: startY },
    }));

    set({
      players,
      map: generateMap(width, height),
      currentPlayerIndex: 0,
      phase: 'playing',
      lastCombat: null,
      winner: null,
    });
  },

  moveTo: (x: number, y: number) => {
    const { map, players, currentPlayerIndex, phase } = get();
    if (phase !== 'playing') return;

    const player = players[currentPlayerIndex];
    const { x: px, y: py } = player.position;

    // Can only move to adjacent tiles
    const dx = Math.abs(x - px);
    const dy = Math.abs(y - py);
    if (dx + dy !== 1) return; // Must be exactly 1 step

    // Bounds check
    if (x < 0 || y < 0 || x >= map[0].length || y >= map.length) return;

    const tile = map[y][x];
    const newMap = map.map(row => row.map(t => ({ ...t })));
    const newPlayers = players.map(p => ({ ...p, cup: { ...p.cup } }));

    // Move player
    newPlayers[currentPlayerIndex].position = { x, y };

    // Reveal tile if not revealed
    if (!tile.revealed) {
      newMap[y][x].revealed = true;

      // Combat!
      if (tile.monster) {
        const roll = rollD20();
        const won = roll >= tile.monster.difficulty;

        const combat: CombatResult = {
          roll,
          needed: tile.monster.difficulty,
          won,
          monster: tile.monster,
        };

        if (!won) {
          // Take damage
          combat.damage = tile.monster.damage;
          newPlayers[currentPlayerIndex].cup.currentLevel -= tile.monster.damage;

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
          newMap[y][x].monster = null;
        }

        set({
          players: newPlayers,
          map: newMap,
          phase: 'combat',
          lastCombat: combat,
        });
        return;
      }
    }

    set({
      players: newPlayers,
      map: newMap,
    });
  },

  dismissCombat: () => {
    const { players, currentPlayerIndex } = get();
    const currentPlayer = players[currentPlayerIndex];

    // If current player is eliminated, skip to next alive player
    let nextIndex = currentPlayerIndex;

    if (currentPlayer.cup.currentLevel <= 0) {
      // Find next alive player
      for (let i = 1; i <= players.length; i++) {
        const idx = (currentPlayerIndex + i) % players.length;
        if (players[idx].cup.currentLevel > 0) {
          nextIndex = idx;
          break;
        }
      }
    }

    set({
      phase: 'playing',
      lastCombat: null,
      currentPlayerIndex: nextIndex,
    });
  },

  endTurn: () => {
    const { players, currentPlayerIndex } = get();

    // Find next alive player
    let nextIndex = currentPlayerIndex;
    for (let i = 1; i <= players.length; i++) {
      const idx = (currentPlayerIndex + i) % players.length;
      if (players[idx].cup.currentLevel > 0) {
        nextIndex = idx;
        break;
      }
    }

    set({ currentPlayerIndex: nextIndex });
  },

  resetGame: () => {
    set(initialState);
  },
}));
