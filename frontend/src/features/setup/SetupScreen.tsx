import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGameStore } from '../../store/gameStore';

import { v4 as uuidv4 } from 'uuid';

export const SetupScreen: React.FC = () => {
  const [playerCount, setPlayerCount] = useState(4);
  const [life, setLife] = useState(40);
  const [customLife, setCustomLife] = useState('');
  const [isCustomLife, setIsCustomLife] = useState(false);
  const [isArchenemy, setIsArchenemy] = useState(false);
  
  const { initializeGame, setSetupConfig, setGameId } = useGameStore();
  const navigate = useNavigate();

  const handleStart = () => {
    const finalLife = isCustomLife ? parseInt(customLife) || 40 : life;
    setSetupConfig(playerCount, finalLife, isArchenemy);
    initializeGame(playerCount);
    
    // Generate new unique game session
    const newGameId = uuidv4();
    setGameId(newGameId);
    
    navigate('/game');
  };

  return (
    <div className="min-h-screen bg-neutral-900 text-white flex flex-col items-center justify-center p-6">
      <div className="max-w-md w-full bg-neutral-800 p-8 rounded-2xl shadow-xl border border-neutral-700">
        <div className="text-center mb-8">
          <p className="text-sm text-neutral-400 font-medium tracking-widest uppercase mb-2">
            Noches de Commander presents:
          </p>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
            Commander Counter
          </h1>
        </div>
        
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-neutral-400 mb-2">
              Players
            </label>
            <div className="grid grid-cols-4 gap-2">
              {[2, 3, 4, 5, 6, 7, 8].map((num) => (
                <button
                  key={num}
                  onClick={() => setPlayerCount(num)}
                  className={`py-3 rounded-lg font-bold transition-all ${
                    playerCount === num
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30'
                      : 'bg-neutral-700 text-neutral-300 hover:bg-neutral-600'
                  }`}
                >
                  {num}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-400 mb-2">
              Starting Life
            </label>
            <div className="flex flex-wrap gap-2">
              {[20, 30, 40].map((num) => (
                <button
                  key={num}
                  onClick={() => {
                    setLife(num);
                    setIsCustomLife(false);
                  }}
                  className={`flex-1 py-3 min-w-[80px] rounded-lg font-bold transition-all ${
                    !isCustomLife && life === num
                      ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/30'
                      : 'bg-neutral-700 text-neutral-300 hover:bg-neutral-600'
                  }`}
                >
                  {num}
                </button>
              ))}
              <div className="flex-1 min-w-[120px] relative">
                <input
                  type="number"
                  placeholder="Custom"
                  value={customLife}
                  onChange={(e) => {
                    setCustomLife(e.target.value);
                    setIsCustomLife(true);
                  }}
                  onFocus={() => setIsCustomLife(true)}
                  className={`w-full py-3 px-4 rounded-lg font-bold text-center transition-all bg-neutral-700 text-white outline-none ${
                    isCustomLife 
                      ? 'ring-2 ring-purple-500 shadow-lg shadow-purple-500/30' 
                      : 'hover:bg-neutral-600'
                  }`}
                />
              </div>
            </div>
          </div>

          <div className="pt-2 border-t border-neutral-700 flex items-center justify-between">
            <div>
              <div className="font-bold text-white">Archenemy Mode</div>
              <div className="text-xs text-neutral-400">Player 1 starts with 40 life, others with selected life</div>
            </div>
            <button
              onClick={() => setIsArchenemy(!isArchenemy)}
              className={`w-12 h-6 rounded-full transition-colors relative ${
                isArchenemy ? 'bg-red-500' : 'bg-neutral-600'
              }`}
            >
              <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${
                isArchenemy ? 'left-7' : 'left-1'
              }`} />
            </button>
          </div>

          <button
            onClick={handleStart}
            className="w-full py-4 mt-8 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 rounded-xl font-bold text-xl shadow-lg shadow-purple-500/25 transition-all transform hover:scale-[1.02] active:scale-95"
          >
            Start Game
          </button>
        </div>
      </div>
    </div>
  );
};
