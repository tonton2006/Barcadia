import { Player } from '../game/types';

interface PlayerCardProps {
  player: Player;
  isActive: boolean;
}

export function PlayerCard({ player, isActive }: PlayerCardProps) {
  const { cup } = player;
  const healthPercent = (cup.currentLevel / cup.capacity) * 100;
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

      {/* Drink meter (cup visualization) */}
      <div className="relative w-full h-20 bg-gray-800 rounded-lg overflow-hidden border-2 border-gray-600">
        {/* Liquid */}
        <div
          className="absolute bottom-0 left-0 right-0 transition-all duration-500 ease-out"
          style={{
            height: `${healthPercent}%`,
            backgroundColor: cup.color,
            opacity: 0.8,
          }}
        />

        {/* Cup markings */}
        {[...Array(cup.capacity)].map((_, i) => (
          <div
            key={i}
            className="absolute left-0 right-0 border-t border-gray-500/30"
            style={{ bottom: `${((i + 1) / cup.capacity) * 100}%` }}
          />
        ))}

        {/* Level text */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-white font-bold text-lg drop-shadow-lg">
            {cup.currentLevel}/{cup.capacity}
          </span>
        </div>
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
