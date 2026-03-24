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

      {/* Beer mug with stacked liquid bars */}
      <svg viewBox="0 0 80 100" className="w-full h-28">
        {/* Mug body - pint glass shape */}
        <defs>
          <clipPath id={`mug-clip-${player.id}`}>
            <path d="M15 10 L12 85 Q12 95 22 95 L58 95 Q68 95 68 85 L65 10 Z" />
          </clipPath>
        </defs>

        {/* Mug glass background */}
        <path
          d="M15 10 L12 85 Q12 95 22 95 L58 95 Q68 95 68 85 L65 10 Z"
          fill="#1a1a2e"
          stroke="#666"
          strokeWidth="2"
        />

        {/* Liquid bars inside mug */}
        <g clipPath={`url(#mug-clip-${player.id})`}>
          {[...Array(cup.capacity)].map((_, i) => {
            const barHeight = 8;
            const startY = 88 - (i * barHeight);
            const isFilled = i < cup.currentLevel;
            return (
              <rect
                key={i}
                x="14"
                y={startY}
                width="52"
                height={barHeight - 1}
                rx="1"
                fill={isFilled ? cup.color : '#2a2a3e'}
                opacity={isFilled ? 0.9 : 0.3}
                className="transition-all duration-300"
              />
            );
          })}
        </g>

        {/* Foam/head at top of liquid */}
        {cup.currentLevel > 0 && (
          <ellipse
            cx="40"
            cy={88 - (cup.currentLevel * 8) + 2}
            rx="24"
            ry="3"
            fill="rgba(255,255,255,0.3)"
          />
        )}

        {/* Mug rim */}
        <path
          d="M14 10 Q14 5 20 5 L60 5 Q66 5 66 10"
          fill="none"
          stroke="#888"
          strokeWidth="3"
          strokeLinecap="round"
        />

        {/* Handle */}
        <path
          d="M68 25 Q85 25 85 50 Q85 75 68 75"
          fill="none"
          stroke="#666"
          strokeWidth="4"
          strokeLinecap="round"
        />

        {/* Level text */}
        <text
          x="40"
          y="55"
          textAnchor="middle"
          dominantBaseline="middle"
          fill="white"
          fontSize="14"
          fontWeight="bold"
          style={{ textShadow: '0 1px 2px rgba(0,0,0,0.8)' }}
        >
          {cup.currentLevel}/{cup.capacity}
        </text>
      </svg>

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
