import { useState, useMemo } from 'react';
import { useGameStore, getPlaceablePositions } from '../game/store';
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
}

function HexTile({ tile, playersOnTile, pixelPos }: HexTileProps) {
  const getTileEmoji = () => {
    if (tile.monster) return '👹';
    if (tile.isStart) return '🏠';
    return '·';
  };

  return (
    <g transform={`translate(${pixelPos.x}, ${pixelPos.y})`}>
      <path
        d={hexagonPath(HEX_SIZE - 2)}
        className={`
          fill-dungeon-medium stroke-dungeon-light stroke-2
          ${tile.monster ? 'stroke-red-500' : ''}
        `}
      />
      <text
        className="fill-white text-2xl select-none"
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
  onHover: (coord: HexCoord | null) => void;
  onClick: () => void;
}

function PlaceableHex({ coord, pixelPos, isHovered, onHover, onClick }: PlaceableHexProps) {
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
        className={`
          transition-all duration-200
          ${isHovered
            ? 'fill-dungeon-accent/40 stroke-dungeon-accent stroke-2'
            : 'fill-transparent stroke-dungeon-accent/50 stroke-2 stroke-dashed'}
        `}
        style={{ strokeDasharray: isHovered ? 'none' : '8,4' }}
      />
      {isHovered && (
        <text
          className="fill-dungeon-accent text-xl select-none pointer-events-none"
          textAnchor="middle"
          dominantBaseline="central"
          style={{ fontSize: '20px' }}
        >
          +
        </text>
      )}
    </g>
  );
}

export function Board() {
  const { map, players, currentPlayerIndex, phase, placeTile } = useGameStore();
  const [hoveredCoord, setHoveredCoord] = useState<HexCoord | null>(null);

  const currentPlayer = players[currentPlayerIndex];

  // Get all placeable positions for current player
  const placeablePositions = useMemo(() => {
    if (phase !== 'playing' || !currentPlayer) return [];
    return getPlaceablePositions(map, currentPlayer.position);
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

  // Convert map to array for rendering
  const tiles = Array.from(map.entries()).map(([key, tile]) => ({
    key,
    tile,
    pixelPos: hexToPixel(tile.q, tile.r),
  }));

  return (
    <div className="flex flex-col items-center gap-4 p-4 bg-dungeon-dark/50 rounded-xl">
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
              onHover={setHoveredCoord}
              onClick={() => placeTile(coord.q, coord.r)}
            />
          );
        })}

        {/* Existing tiles */}
        {tiles.map(({ key, tile, pixelPos }) => (
          <HexTile
            key={key}
            tile={tile}
            playersOnTile={getPlayersOnTile(tile.q, tile.r)}
            pixelPos={pixelPos}
          />
        ))}
      </svg>

      {phase === 'playing' && currentPlayer && (
        <p className="text-dungeon-accent text-sm">
          {currentPlayer.name}'s turn - click a hex to explore
        </p>
      )}
    </div>
  );
}
