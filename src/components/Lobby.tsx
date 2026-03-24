import { useState } from 'react';
import { useNetworkStore } from '../network/peer';

interface LobbyProps {
  onGameStart: (playerNames: string[]) => void;
}

export function Lobby({ onGameStart }: LobbyProps) {
  const [screen, setScreen] = useState<'menu' | 'host' | 'join'>('menu');
  const [playerName, setPlayerName] = useState('');
  const [joinCode, setJoinCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const {
    roomCode,
    peerId,
    isHost,
    isConnected,
    players,
    error,
    hostRoom,
    joinRoom,
    disconnect,
    broadcast,
    onMessage,
    clearError,
    setMyPlayerIndex,
  } = useNetworkStore();

  // Listen for game start message (guests)
  onMessage((message) => {
    if (message.type === 'game-start' && peerId) {
      // Set which player index this client controls
      const myIndex = message.peerToIndex[peerId] ?? -1;
      setMyPlayerIndex(myIndex);
      onGameStart(message.playerNames);
    }
  });

  const handleHost = async () => {
    if (!playerName.trim()) return;
    setIsLoading(true);
    clearError();

    try {
      await hostRoom(playerName.trim());
      setScreen('host');
    } catch (err) {
      console.error('Failed to host:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleJoin = async () => {
    if (!playerName.trim() || !joinCode.trim()) return;
    setIsLoading(true);
    clearError();

    try {
      await joinRoom(joinCode.trim(), playerName.trim());
    } catch (err) {
      console.error('Failed to join:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartGame = () => {
    if (!isHost || players.length < 2 || !peerId) return;

    const playerNames = players.map(p => p.name);

    // Map each peerId to their player index (lobby order = game order)
    const peerToIndex: Record<string, number> = {};
    players.forEach((p, i) => {
      peerToIndex[p.peerId] = i;
    });

    // Broadcast game start to all players with index mapping
    broadcast({ type: 'game-start', playerNames, peerToIndex });

    // Set host's player index (always 0 since host is first)
    setMyPlayerIndex(peerToIndex[peerId] ?? 0);

    // Start locally too
    onGameStart(playerNames);
  };

  const handleBack = () => {
    disconnect();
    setScreen('menu');
    setJoinCode('');
    clearError();
  };

  // Main menu
  if (screen === 'menu' && !isConnected) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="bg-dungeon-medium border-2 border-dungeon-light rounded-2xl p-8 max-w-md w-full">
          <h1 className="text-3xl font-bold text-white text-center mb-2">Barcadia</h1>
          <p className="text-gray-400 text-center mb-8">Multiplayer Dungeon Drinking Game</p>

          <div className="space-y-4">
            <input
              type="text"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              placeholder="Your name"
              maxLength={15}
              className="w-full px-4 py-3 bg-dungeon-dark border-2 border-dungeon-light rounded-lg
                         text-white placeholder-gray-500 focus:border-dungeon-accent focus:outline-none"
            />

            <button
              onClick={handleHost}
              disabled={!playerName.trim() || isLoading}
              className="w-full py-3 bg-dungeon-accent hover:bg-dungeon-accent/80
                         text-white font-bold rounded-lg transition-colors
                         disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Creating...' : 'Host Game'}
            </button>

            <button
              onClick={() => playerName.trim() && setScreen('join')}
              disabled={!playerName.trim()}
              className="w-full py-3 bg-dungeon-light hover:bg-dungeon-medium
                         text-white font-bold rounded-lg transition-colors
                         disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Join Game
            </button>
          </div>

          {error && (
            <p className="mt-4 text-red-400 text-center text-sm">{error}</p>
          )}
        </div>
      </div>
    );
  }

  // Join screen
  if (screen === 'join' && !isConnected) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="bg-dungeon-medium border-2 border-dungeon-light rounded-2xl p-8 max-w-md w-full">
          <h2 className="text-2xl font-bold text-white text-center mb-6">Join Game</h2>

          <div className="space-y-4">
            <input
              type="text"
              value={joinCode}
              onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
              placeholder="Enter room code"
              maxLength={5}
              className="w-full px-4 py-3 bg-dungeon-dark border-2 border-dungeon-light rounded-lg
                         text-white text-center text-2xl tracking-widest placeholder-gray-500
                         focus:border-dungeon-accent focus:outline-none uppercase"
            />

            <button
              onClick={handleJoin}
              disabled={joinCode.length < 5 || isLoading}
              className="w-full py-3 bg-dungeon-accent hover:bg-dungeon-accent/80
                         text-white font-bold rounded-lg transition-colors
                         disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Connecting...' : 'Join'}
            </button>

            <button
              onClick={handleBack}
              className="w-full py-3 bg-dungeon-dark hover:bg-dungeon-light
                         text-gray-400 hover:text-white rounded-lg transition-colors"
            >
              Back
            </button>
          </div>

          {error && (
            <p className="mt-4 text-red-400 text-center text-sm">{error}</p>
          )}
        </div>
      </div>
    );
  }

  // Connected - waiting room
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="bg-dungeon-medium border-2 border-dungeon-light rounded-2xl p-8 max-w-md w-full">
        <h2 className="text-2xl font-bold text-white text-center mb-2">
          {isHost ? 'Your Room' : 'Waiting for Host'}
        </h2>

        {/* Room code display */}
        {roomCode && (
          <div className="bg-dungeon-dark rounded-xl p-4 mb-6 text-center">
            <p className="text-gray-400 text-sm mb-1">Room Code</p>
            <p className="text-4xl font-mono font-bold text-dungeon-accent tracking-widest">
              {roomCode}
            </p>
            <p className="text-gray-500 text-xs mt-2">Share this code with friends</p>
          </div>
        )}

        {/* Player list */}
        <div className="mb-6">
          <p className="text-gray-400 text-sm mb-2">
            Players ({players.length}/10)
          </p>
          <div className="space-y-2">
            {players.map((player, i) => (
              <div
                key={player.peerId}
                className="flex items-center gap-3 bg-dungeon-dark rounded-lg px-4 py-2"
              >
                <div
                  className="w-3 h-3 rounded-full"
                  style={{
                    backgroundColor: ['#e94560', '#4ecdc4', '#ffe66d', '#95e1d3', '#f38181', '#aa96da'][i % 6],
                  }}
                />
                <span className="text-white flex-1">{player.name}</span>
                {player.isHost && (
                  <span className="text-xs text-dungeon-accent">HOST</span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-3">
          {isHost ? (
            <button
              onClick={handleStartGame}
              disabled={players.length < 2}
              className="w-full py-3 bg-dungeon-accent hover:bg-dungeon-accent/80
                         text-white font-bold rounded-lg transition-colors
                         disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {players.length < 2 ? 'Waiting for players...' : 'Start Game'}
            </button>
          ) : (
            <div className="text-center text-gray-400 py-3">
              Waiting for host to start...
            </div>
          )}

          <button
            onClick={handleBack}
            className="w-full py-3 bg-dungeon-dark hover:bg-dungeon-light
                       text-gray-400 hover:text-white rounded-lg transition-colors"
          >
            Leave Room
          </button>
        </div>
      </div>
    </div>
  );
}
