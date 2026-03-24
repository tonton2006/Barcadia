import { Player } from '../game/types';

// Cup/drink icon SVG component
function CupIcon({ filled, color }: { filled: boolean; color: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className="w-5 h-5"
      fill={filled ? color : 'transparent'}
      stroke={filled ? color : '#4a4a4a'}
      strokeWidth={2}
    >
      {/* Cup body */}
      <path d="M5 6h14l-1.5 12a2 2 0 01-2 2H8.5a2 2 0 01-2-2L5 6z" />
      {/* Cup rim */}
      <path d="M4 6h16" strokeLinecap="round" />
      {/* Liquid surface (wavy line) */}
      {filled && (
        <path
          d="M7 10c1 1 2 0 3 0s2 1 3 0 2-1 3 0"
          fill="none"
          stroke="rgba(255,255,255,0.5)"
          strokeWidth={1.5}
        />
      )}
    </svg>
  );
}

interface PlayerCardProps {
  player: Player;
  isActive: boolean;
}

export function PlayerCard({ player, isActive }: PlayerCardProps) {
  const { cup } = player;
  const isDead = cup.currentLevel <= 0;

  return (
    <div
      className={`
        relative p-3 rounded-xl border-2 transition-all duration-300
        ${isActive
          ? 'border-dungeon-accent bg-dungeon-medium scale-105 shadow-lg shadow-dungeon-accent/20'
          : 'border-dungeon-light bg-dungeon-dark'}
        ${isDead ? 'opacity-50 grayscale' : ''}
      `}
    >
      {/* Player name */}
      <div className="flex items-center gap-2 mb-2">
        <div
          className="w-4 h-4 rounded-full border-2 border-white"
          style={{ backgroundColor: cup.color }}
        />
        <span className="font-bold text-white text-sm">
          {player.name}
          {isDead && ' 💀'}
        </span>
      </div>

      {/* Cup icons grid (10 cups = 2 rows of 5) */}
      <div className="grid grid-cols-5 gap-1">
        {[...Array(cup.capacity)].map((_, i) => (
          <CupIcon
            key={i}
            filled={i < cup.currentLevel}
            color={cup.color}
          />
        ))}
      </div>

      {/* Health text */}
      <div className="mt-2 text-center text-xs text-gray-400">
        {cup.currentLevel}/{cup.capacity} drinks left
      </div>

      {/* Active indicator */}
      {isActive && !isDead && (
        <div className="absolute -top-1 -right-1 w-3 h-3 bg-dungeon-accent rounded-full animate-pulse" />
      )}
    </div>
  );
}

interface PlayerListProps {
  players: Player[];
  currentPlayerIndex: number;
}

export function PlayerList({ players, currentPlayerIndex }: PlayerListProps) {
  return (
    <div className="flex flex-col gap-3">
      <h2 className="text-white font-bold text-lg">Players</h2>
      {players.map((player, i) => (
        <PlayerCard
          key={player.id}
          player={player}
          isActive={i === currentPlayerIndex}
        />
      ))}
    </div>
  );
}
