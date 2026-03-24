import { useState, useMemo } from 'react';
import { useGameStore, getPlaceablePositions, getMoveablePositions } from '../game/store';
import { Tile, Player, HexCoord } from '../game/types';

const HEX_SIZE = 50; // Radius of hexagon
const SQRT3 = Math.sqrt(3);

// Convert axial coordinates to pixel position (flat-top hexagons)
function hexToPixel(q: number, r: number): { x: number; y: number } {
  const x = HEX_SIZE * (3 / 2) * q;
  const y = HEX_SIZE * ((SQRT3 / 2) * q + SQRT3 * r);
  return { x, y };
}

// SVG path for a flat-top hexagon
function hexagonPath(size: number): string {
  const points: string[] = [];
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 180) * (60 * i);
    const px = size * Math.cos(angle);
    const py = size * Math.sin(angle);
    points.push(`${px},${py}`);
  }
  return `M ${points.join(' L ')} Z`;
}

interface HexTileProps {
  tile: Tile;
  playersOnTile: Player[];
  pixelPos: { x: number; y: number };
  isCurrentPlayerHere: boolean;
  currentPlayerColor: string;
  isMoveable: boolean;
  isHovered: boolean;
  onHover: (coord: HexCoord | null) => void;
  onClick: () => void;
}

function HexTile({
  tile,
  playersOnTile,
  pixelPos,
  isCurrentPlayerHere,
  currentPlayerColor,
  isMoveable,
  isHovered,
  onHover,
  onClick,
}: HexTileProps) {
  const getTileEmoji = () => {
    if (tile.monster) return '👹';
    if (tile.isStart) return '🏠';
    return '·';
  };

  return (
    <g
      transform={`translate(${pixelPos.x}, ${pixelPos.y})`}
      onMouseEnter={() => isMoveable && onHover({ q: tile.q, r: tile.r })}
      onMouseLeave={() => isMoveable && onHover(null)}
      onClick={() => isMoveable && onClick()}
      style={{ cursor: isMoveable ? 'pointer' : 'default' }}
    >
      {/* Breathing glow for current player's position */}
      {isCurrentPlayerHere && (
        <circle
          cx={0}
          cy={0}
          r={HEX_SIZE * 0.9}
          fill="none"
          stroke="white"
          strokeWidth={3}
          opacity={0.6}
          className="animate-breathe"
        />
      )}

      <path
        d={hexagonPath(HEX_SIZE - 2)}
        fill="#2a2a4a"
        stroke={isMoveable && isHovered ? currentPlayerColor : (tile.monster ? '#ef4444' : '#4a4a6a')}
        strokeWidth={isMoveable && isHovered ? 3 : 2}
        style={{ transition: 'all 0.2s' }}
      />

      {/* Hover overlay for moveable tiles */}
      {isMoveable && isHovered && (
        <path
          d={hexagonPath(HEX_SIZE - 4)}
          fill={`${currentPlayerColor}33`}
          stroke="none"
        />
      )}

      <text
        className="fill-white select-none pointer-events-none"
        textAnchor="middle"
        dominantBaseline="central"
        style={{ fontSize: '24px' }}
      >
        {getTileEmoji()}
      </text>

      {/* Player tokens */}
      {playersOnTile.length > 0 && (
        <g transform={`translate(0, ${HEX_SIZE * 0.5})`}>
          {playersOnTile.map((player, i) => {
            const offset = (i - (playersOnTile.length - 1) / 2) * 14;
            return (
              <circle
                key={player.id}
                cx={offset}
                cy={0}
                r={6}
                fill={player.cup.color}
                stroke="white"
                strokeWidth={2}
              />
            );
          })}
        </g>
      )}
    </g>
  );
}

interface PlaceableHexProps {
  coord: HexCoord;
  pixelPos: { x: number; y: number };
  isHovered: boolean;
  playerColor: string;
  onHover: (coord: HexCoord | null) => void;
  onClick: () => void;
}

function PlaceableHex({ coord, pixelPos, isHovered, playerColor, onHover, onClick }: PlaceableHexProps) {
  return (
    <g
      transform={`translate(${pixelPos.x}, ${pixelPos.y})`}
      onMouseEnter={() => onHover(coord)}
      onMouseLeave={() => onHover(null)}
      onClick={onClick}
      className="cursor-pointer"
    >
      <path
        d={hexagonPath(HEX_SIZE - 2)}
        style={{
          fill: isHovered ? `${playerColor}66` : 'transparent',
          stroke: isHovered ? playerColor : `${playerColor}88`,
          strokeWidth: 2,
          strokeDasharray: isHovered ? 'none' : '8,4',
          transition: 'all 0.2s',
        }}
      />
      {isHovered && (
        <text
          textAnchor="middle"
          dominantBaseline="central"
          style={{ fontSize: '20px', fill: playerColor }}
          className="select-none pointer-events-none"
        >
          +
        </text>
      )}
    </g>
  );
}

export function Board() {
  const { map, players, currentPlayerIndex, phase, placeTile, moveTo } = useGameStore();
  const [hoveredCoord, setHoveredCoord] = useState<HexCoord | null>(null);

  const currentPlayer = players[currentPlayerIndex];

  // Get all placeable positions for current player (unexplored)
  const placeablePositions = useMemo(() => {
    if (phase !== 'playing' || !currentPlayer) return [];
    return getPlaceablePositions(map, currentPlayer.position);
  }, [map, currentPlayer, phase]);

  // Get all moveable positions for current player (existing tiles to backtrack)
  const moveablePositions = useMemo(() => {
    if (phase !== 'playing' || !currentPlayer) return [];
    return getMoveablePositions(map, currentPlayer.position);
  }, [map, currentPlayer, phase]);

  // Calculate bounds to center the view
  const bounds = useMemo(() => {
    let minX = Infinity, maxX = -Infinity;
    let minY = Infinity, maxY = -Infinity;

    // Include existing tiles
    map.forEach((_, key) => {
      const [q, r] = key.split(',').map(Number);
      const pos = hexToPixel(q, r);
      minX = Math.min(minX, pos.x);
      maxX = Math.max(maxX, pos.x);
      minY = Math.min(minY, pos.y);
      maxY = Math.max(maxY, pos.y);
    });

    // Include placeable positions
    placeablePositions.forEach(({ q, r }) => {
      const pos = hexToPixel(q, r);
      minX = Math.min(minX, pos.x);
      maxX = Math.max(maxX, pos.x);
      minY = Math.min(minY, pos.y);
      maxY = Math.max(maxY, pos.y);
    });

    const padding = HEX_SIZE * 1.5;
    return {
      x: minX - padding,
      y: minY - padding,
      width: maxX - minX + padding * 2,
      height: maxY - minY + padding * 2,
    };
  }, [map, placeablePositions]);

  if (map.size === 0) return null;

  const getPlayersOnTile = (q: number, r: number) => {
    return players.filter(
      p => p.position.q === q && p.position.r === r && p.cup.currentLevel > 0
    );
  };

  const isMoveablePosition = (q: number, r: number) => {
    return moveablePositions.some(pos => pos.q === q && pos.r === r);
  };

  // Convert map to array for rendering
  const tiles = Array.from(map.entries()).map(([key, tile]) => ({
    key,
    tile,
    pixelPos: hexToPixel(tile.q, tile.r),
  }));

  return (
    <div className="flex flex-col items-center gap-4 p-4 bg-dungeon-dark/50 rounded-xl">
      {/* CSS for breathing animation */}
      <style>{`
        @keyframes breathe {
          0%, 100% { opacity: 0.3; transform: scale(1); }
          50% { opacity: 0.7; transform: scale(1.05); }
        }
        .animate-breathe {
          animation: breathe 2s ease-in-out infinite;
          transform-origin: center;
        }
      `}</style>

      <svg
        viewBox={`${bounds.x} ${bounds.y} ${bounds.width} ${bounds.height}`}
        className="w-full max-w-2xl"
        style={{ minHeight: '400px' }}
      >
        {/* Placeable hexes (render first so they're behind) */}
        {placeablePositions.map(coord => {
          const pixelPos = hexToPixel(coord.q, coord.r);
          const isHovered = hoveredCoord?.q === coord.q && hoveredCoord?.r === coord.r;
          return (
            <PlaceableHex
              key={`placeable-${coord.q}-${coord.r}`}
              coord={coord}
              pixelPos={pixelPos}
              isHovered={isHovered}
              playerColor={currentPlayer?.cup.color ?? '#888'}
              onHover={setHoveredCoord}
              onClick={() => placeTile(coord.q, coord.r)}
            />
          );
        })}

        {/* Existing tiles */}
        {tiles.map(({ key, tile, pixelPos }) => {
          const isMoveable = isMoveablePosition(tile.q, tile.r);
          const isHovered = hoveredCoord?.q === tile.q && hoveredCoord?.r === tile.r;
          const isCurrentPlayerHere = currentPlayer?.position.q === tile.q && currentPlayer?.position.r === tile.r;

          return (
            <HexTile
              key={key}
              tile={tile}
              playersOnTile={getPlayersOnTile(tile.q, tile.r)}
              pixelPos={pixelPos}
              isCurrentPlayerHere={isCurrentPlayerHere}
              currentPlayerColor={currentPlayer?.cup.color ?? '#888'}
              isMoveable={isMoveable}
              isHovered={isHovered}
              onHover={setHoveredCoord}
              onClick={() => moveTo(tile.q, tile.r)}
            />
          );
        })}
      </svg>

      {phase === 'playing' && currentPlayer && (
        <p className="text-sm" style={{ color: currentPlayer.cup.color }}>
          {currentPlayer.name}'s turn - click to explore or backtrack
        </p>
      )}
    </div>
  );
}
