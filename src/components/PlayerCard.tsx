import { Player } from '../game/types';

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

      {/* Single cup with 10 stacked bars */}
      <div className="relative w-full h-28">
        {/* Cup shape - tapered container */}
        <div
          className="absolute inset-x-2 top-0 bottom-0 rounded-b-xl overflow-hidden border-2 border-gray-600"
          style={{
            clipPath: 'polygon(10% 0%, 90% 0%, 100% 100%, 0% 100%)',
            background: '#1a1a2e',
          }}
        >
          {/* Stacked bars inside the cup */}
          <div className="absolute inset-0 flex flex-col-reverse p-1 gap-0.5">
            {[...Array(cup.capacity)].map((_, i) => (
              <div
                key={i}
                className="flex-1 rounded-sm transition-all duration-300"
                style={{
                  backgroundColor: i < cup.currentLevel ? cup.color : '#2a2a3e',
                  opacity: i < cup.currentLevel ? 0.9 : 0.3,
                }}
              />
            ))}
          </div>
        </div>

        {/* Cup rim */}
        <div
          className="absolute top-0 inset-x-0 h-2 rounded-t-sm border-2 border-gray-500"
          style={{ background: '#3a3a4e' }}
        />

        {/* Level text overlay */}
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
