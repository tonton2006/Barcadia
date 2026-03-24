import { useGameStore } from '../game/store';
import { Tile, Player } from '../game/types';

interface TileProps {
  tile: Tile;
  playersOnTile: Player[];
  isAdjacent: boolean;
  onClick: () => void;
}

function TileCell({ tile, playersOnTile, isAdjacent, onClick }: TileProps) {
  const getTileContent = () => {
    if (!tile.revealed) {
      return <span className="text-2xl">❓</span>;
    }
    if (tile.monster) {
      return <span className="text-2xl">👹</span>;
    }
    if (tile.isStart) {
      return <span className="text-2xl">🏠</span>;
    }
    return <span className="text-2xl opacity-50">·</span>;
  };

  return (
    <button
      onClick={onClick}
      disabled={!isAdjacent}
      className={`
        relative w-16 h-16 rounded-lg border-2 flex items-center justify-center
        transition-all duration-200
        ${tile.revealed
          ? 'bg-dungeon-medium border-dungeon-light'
          : 'bg-dungeon-dark border-gray-700'}
        ${isAdjacent
          ? 'border-dungeon-accent cursor-pointer hover:bg-dungeon-light hover:scale-105'
          : 'cursor-default'}
        ${tile.monster && tile.revealed ? 'border-red-500' : ''}
      `}
    >
      {getTileContent()}

      {/* Player tokens */}
      {playersOnTile.length > 0 && (
        <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 flex gap-0.5">
          {playersOnTile.map(player => (
            <div
              key={player.id}
              className="w-3 h-3 rounded-full border border-white"
              style={{ backgroundColor: player.cup.color }}
              title={player.name}
            />
          ))}
        </div>
      )}
    </button>
  );
}

export function Board() {
  const { map, players, currentPlayerIndex, phase, moveTo } = useGameStore();

  if (map.length === 0) return null;

  const currentPlayer = players[currentPlayerIndex];
  const { x: px, y: py } = currentPlayer?.position ?? { x: 0, y: 0 };

  const isAdjacent = (x: number, y: number) => {
    if (phase !== 'playing') return false;
    const dx = Math.abs(x - px);
    const dy = Math.abs(y - py);
    return dx + dy === 1;
  };

  const getPlayersOnTile = (x: number, y: number) => {
    return players.filter(p => p.position.x === x && p.position.y === y && p.cup.currentLevel > 0);
  };

  return (
    <div className="flex flex-col gap-1 p-4 bg-dungeon-dark/50 rounded-xl">
      {map.map((row, y) => (
        <div key={y} className="flex gap-1">
          {row.map((tile, x) => (
            <TileCell
              key={`${x}-${y}`}
              tile={tile}
              playersOnTile={getPlayersOnTile(x, y)}
              isAdjacent={isAdjacent(x, y)}
              onClick={() => moveTo(x, y)}
            />
          ))}
        </div>
      ))}
    </div>
  );
}
