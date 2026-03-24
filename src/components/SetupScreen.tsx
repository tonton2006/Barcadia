import { useState } from 'react';
import { useGameStore } from '../game/store';

export function SetupScreen() {
  const [playerNames, setPlayerNames] = useState(['Player 1', 'Player 2']);
  const startGame = useGameStore(state => state.startGame);

  const addPlayer = () => {
    if (playerNames.length < 6) {
      setPlayerNames([...playerNames, `Player ${playerNames.length + 1}`]);
    }
  };

  const removePlayer = (index: number) => {
    if (playerNames.length > 2) {
      setPlayerNames(playerNames.filter((_, i) => i !== index));
    }
  };

  const updateName = (index: number, name: string) => {
    const newNames = [...playerNames];
    newNames[index] = name;
    setPlayerNames(newNames);
  };

  const handleStart = () => {
    const validNames = playerNames.filter(n => n.trim());
    if (validNames.length >= 2) {
      startGame(validNames);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="bg-dungeon-medium border-2 border-dungeon-light rounded-2xl p-8 max-w-md w-full">
        <h1 className="text-3xl font-bold text-white text-center mb-2">
          🏰 Barcadia
        </h1>
        <p className="text-gray-400 text-center mb-6">
          Dungeon Drinking Game
        </p>

        <div className="space-y-3 mb-6">
          <label className="text-white font-semibold">Players</label>
          {playerNames.map((name, i) => (
            <div key={i} className="flex gap-2">
              <input
                type="text"
                value={name}
                onChange={(e) => updateName(i, e.target.value)}
                className="flex-1 bg-dungeon-dark border border-dungeon-light rounded-lg px-3 py-2
                           text-white placeholder-gray-500 focus:outline-none focus:border-dungeon-accent"
                placeholder={`Player ${i + 1}`}
              />
              {playerNames.length > 2 && (
                <button
                  onClick={() => removePlayer(i)}
                  className="px-3 py-2 bg-red-900/50 hover:bg-red-800/50 text-red-400
                             rounded-lg transition-colors"
                >
                  ✕
                </button>
              )}
            </div>
          ))}
        </div>

        {playerNames.length < 6 && (
          <button
            onClick={addPlayer}
            className="w-full py-2 mb-4 border-2 border-dashed border-dungeon-light
                       text-gray-400 hover:text-white hover:border-dungeon-accent
                       rounded-lg transition-colors"
          >
            + Add Player
          </button>
        )}

        <button
          onClick={handleStart}
          className="w-full py-3 bg-dungeon-accent hover:bg-dungeon-accent/80
                     text-white font-bold text-lg rounded-lg transition-colors"
        >
          Start Game
        </button>

        <div className="mt-6 p-4 bg-dungeon-dark/50 rounded-lg">
          <h3 className="text-white font-semibold mb-2">How to Play</h3>
          <ul className="text-gray-400 text-sm space-y-1">
            <li>• Click adjacent tiles to move</li>
            <li>• Reveal tiles to find monsters</li>
            <li>• Roll D20 to defeat monsters</li>
            <li>• Lose = take damage (drink IRL!)</li>
            <li>• Last player standing wins!</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
