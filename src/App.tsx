import { useEffect, useCallback, useState } from 'react';
import { useGameStore, setNetworkBroadcast } from './game/store';
import { useNetworkStore } from './network/peer';
import { Board } from './components/Board';
import { PlayerList } from './components/PlayerCard';
import { CombatModal } from './components/CombatModal';
import { Lobby } from './components/Lobby';
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

  const { isConnected, isHost, sendToHost, disconnect, myPlayerIndex } = useNetworkStore();

  // Local state: has this user dismissed the combat modal on their screen?
  const [locallyDismissed, setLocallyDismissed] = useState(false);

  // Reset local dismiss when new combat occurs
  useEffect(() => {
    if (phase === 'combat' && lastCombat) {
      setLocallyDismissed(false);
    }
  }, [phase, lastCombat]);

  const currentPlayer = players[currentPlayerIndex];
  const isMyTurn = !isConnected || myPlayerIndex === currentPlayerIndex;

  const handleLeaveGame = () => {
    disconnect();
    resetGame();
  };

  // Handle combat dismiss
  const handleDismissCombat = () => {
    if (isMyTurn) {
      // It's my combat - actually advance the turn
      if (isConnected && !isHost) {
        sendToHost({ type: 'game-action', action: 'dismissCombat', payload: {} });
      } else {
        dismissCombat();
      }
    } else {
      // Not my combat - just hide it locally
      setLocallyDismissed(true);
    }
  };

  // Show combat modal if in combat phase AND not locally dismissed
  const showCombatModal = phase === 'combat' && lastCombat && !locallyDismissed;

  return (
    <div className="min-h-screen p-4">
      {/* Header */}
      <div className="max-w-4xl mx-auto mb-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-white">Barcadia</h1>
          <button
            onClick={handleLeaveGame}
            className="px-3 py-1 text-sm bg-dungeon-dark border border-dungeon-light
                       text-gray-400 hover:text-white rounded-lg transition-colors"
          >
            {isConnected ? 'Leave Game' : 'New Game'}
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
              <span className="text-gray-400 ml-2">— Click to explore or backtrack</span>
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
      {showCombatModal && (
        <CombatModal
          combat={lastCombat}
          playerName={currentPlayer.name}
          onDismiss={handleDismissCombat}
          isMyTurn={isMyTurn}
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
  const { phase, startGame, applyNetworkState, placeTile, moveTo, dismissCombat } = useGameStore();
  const { peerId, isHost, isConnected, broadcast, onMessage, setMyPlayerIndex } = useNetworkStore();

  // Handle game start (called by Lobby for host, or via network for guests)
  const handleGameStart = useCallback((playerNames: string[], peerToIndex?: Record<string, number>) => {
    // Set player index if provided (for both host and guest)
    if (peerToIndex && peerId) {
      const myIndex = peerToIndex[peerId] ?? -1;
      setMyPlayerIndex(myIndex);
    }
    startGame(playerNames);
  }, [peerId, setMyPlayerIndex, startGame]);

  // Set up network broadcast when connected as host
  useEffect(() => {
    if (isConnected && isHost) {
      setNetworkBroadcast((state) => {
        broadcast({ type: 'game-state', state });
      });
    } else {
      setNetworkBroadcast(null);
    }

    return () => {
      setNetworkBroadcast(null);
    };
  }, [isConnected, isHost, broadcast]);

  // Listen for ALL network messages
  useEffect(() => {
    onMessage((message) => {
      // Handle game start (guests receive this from host)
      if (message.type === 'game-start') {
        handleGameStart(message.playerNames, message.peerToIndex);
      }
      // Handle game state updates (guests receive ongoing state)
      if (message.type === 'game-state' && !isHost) {
        applyNetworkState(message.state as Parameters<typeof applyNetworkState>[0]);
      }
      // Handle game actions from guests (host executes them)
      if (message.type === 'game-action' && isHost) {
        const { action, payload } = message;
        if (action === 'placeTile') {
          const { q, r } = payload as { q: number; r: number };
          placeTile(q, r);
        } else if (action === 'moveTo') {
          const { q, r } = payload as { q: number; r: number };
          moveTo(q, r);
        } else if (action === 'dismissCombat') {
          dismissCombat();
        }
      }
    });
  }, [onMessage, isHost, applyNetworkState, handleGameStart, placeTile, moveTo, dismissCombat]);

  // Show lobby if in setup phase
  if (phase === 'setup') {
    return <Lobby onGameStart={handleGameStart} />;
  }

  return <GameScreen />;
}
