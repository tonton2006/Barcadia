import { useGameStore } from './game/store';
import { Board } from './components/Board';
import { PlayerList } from './components/PlayerCard';
import { CombatModal } from './components/CombatModal';
import { SetupScreen } from './components/SetupScreen';
import { GameOverScreen } from './components/GameOverScreen';

function GameScreen() {
  const {
    players,
    currentPlayerIndex,
    phase,
    lastCombat,
    winner,
    dismissCombat,
    resetGame,
  } = useGameStore();

  const currentPlayer = players[currentPlayerIndex];

  return (
    <div className="min-h-screen p-4">
      {/* Header */}
      <div className="max-w-4xl mx-auto mb-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-white">🏰 Barcadia</h1>
          <button
            onClick={resetGame}
            className="px-3 py-1 text-sm bg-dungeon-dark border border-dungeon-light
                       text-gray-400 hover:text-white rounded-lg transition-colors"
          >
            New Game
          </button>
        </div>
      </div>

      {/* Main game area */}
      <div className="max-w-4xl mx-auto flex flex-col lg:flex-row gap-6">
        {/* Board */}
        <div className="flex-1">
          <div className="bg-dungeon-dark/30 rounded-xl p-4 mb-4">
            <p className="text-white">
              <span
                className="inline-block w-3 h-3 rounded-full mr-2"
                style={{ backgroundColor: currentPlayer?.cup.color }}
              />
              <span className="font-bold">{currentPlayer?.name}'s turn</span>
              <span className="text-gray-400 ml-2">— Hover over a hex to preview, click to explore</span>
            </p>
          </div>

          <Board />
        </div>

        {/* Sidebar */}
        <div className="lg:w-48">
          <PlayerList players={players} currentPlayerIndex={currentPlayerIndex} />
        </div>
      </div>

      {/* Combat modal */}
      {phase === 'combat' && lastCombat && (
        <CombatModal
          combat={lastCombat}
          playerName={currentPlayer.name}
          onDismiss={dismissCombat}
        />
      )}

      {/* Game over */}
      {phase === 'gameOver' && winner && (
        <GameOverScreen winner={winner} />
      )}
    </div>
  );
}

export default function App() {
  const phase = useGameStore(state => state.phase);

  if (phase === 'setup') {
    return <SetupScreen />;
  }

  return <GameScreen />;
}
