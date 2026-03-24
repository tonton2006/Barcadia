import { Player } from '../game/types';
import { useGameStore } from '../game/store';

interface GameOverScreenProps {
  winner: Player;
}

export function GameOverScreen({ winner }: GameOverScreenProps) {
  const resetGame = useGameStore(state => state.resetGame);

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
      <div className="bg-dungeon-medium border-2 border-dungeon-accent rounded-2xl p-8 max-w-sm mx-4 text-center">
        <div className="text-6xl mb-4">🏆</div>

        <h1 className="text-3xl font-bold text-white mb-2">
          Game Over!
        </h1>

        <div className="flex items-center justify-center gap-2 mb-6">
          <div
            className="w-6 h-6 rounded-full border-2 border-white"
            style={{ backgroundColor: winner.cup.color }}
          />
          <span className="text-2xl font-bold text-dungeon-accent">
            {winner.name} Wins!
          </span>
        </div>

        <p className="text-gray-400 mb-6">
          Last adventurer standing in the dungeon!
        </p>

        <button
          onClick={resetGame}
          className="w-full py-3 bg-dungeon-accent hover:bg-dungeon-accent/80
                     text-white font-bold rounded-lg transition-colors"
        >
          Play Again
        </button>
      </div>
    </div>
  );
}
