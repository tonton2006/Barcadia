import { CombatResult } from '../game/types';

interface CombatModalProps {
  combat: CombatResult;
  playerName: string;
  onDismiss: () => void;
}

export function CombatModal({ combat, playerName, onDismiss }: CombatModalProps) {
  const { roll, needed, won, monster, damage } = combat;

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
      <div className="bg-dungeon-medium border-2 border-dungeon-light rounded-2xl p-6 max-w-sm mx-4 text-center">
        {/* Monster */}
        <div className="text-4xl mb-2">👹</div>
        <h2 className="text-xl font-bold text-white mb-1">{monster.name}</h2>
        <p className="text-gray-400 text-sm mb-4">Difficulty: {needed}</p>

        {/* Dice roll */}
        <div className="bg-dungeon-dark rounded-xl p-4 mb-4">
          <div className={`text-5xl font-bold mb-2 ${won ? 'text-green-400' : 'text-red-400'}`}>
            🎲 {roll}
          </div>
          <p className="text-gray-300">
            {playerName} needed {needed} or higher
          </p>
        </div>

        {/* Result */}
        {won ? (
          <div className="bg-green-900/50 border border-green-500 rounded-lg p-3 mb-4">
            <p className="text-green-400 font-bold text-lg">Victory!</p>
            <p className="text-green-300 text-sm">Monster defeated!</p>
          </div>
        ) : (
          <div className="bg-red-900/50 border border-red-500 rounded-lg p-3 mb-4">
            <p className="text-red-400 font-bold text-lg">Defeat!</p>
            <p className="text-red-300 text-sm">
              Take {damage} drink{damage !== 1 ? 's' : ''}! 🍺
            </p>
          </div>
        )}

        <button
          onClick={onDismiss}
          className="w-full py-3 bg-dungeon-accent hover:bg-dungeon-accent/80
                     text-white font-bold rounded-lg transition-colors"
        >
          Continue
        </button>
      </div>
    </div>
  );
}
