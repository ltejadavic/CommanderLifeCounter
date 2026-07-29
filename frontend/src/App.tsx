import { useEffect, useState, useRef } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useGameStore, type GameState } from './store/gameStore';
import { SetupScreen } from './features/setup/SetupScreen';
import { GameScreen } from './features/game/GameScreen';

function AppContent() {
  const { players, gameId, setGameState, setGameId } = useGameStore();
  const [isHydrating, setIsHydrating] = useState(true);
  const syncTimeoutRef = useRef<number | null>(null);

  // 1. Hydration Effect (Runs Once)
  useEffect(() => {
    const hydrate = async () => {
      const savedGameId = localStorage.getItem('commander_game_id');
      if (savedGameId) {
        try {
          // Fetch from the backend
          const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
          const response = await fetch(`${apiUrl}/api/game/${savedGameId}`);
          if (response.ok) {
            const data = await response.json();
            
            // Map DTO back to GameState
            const state: GameState = {
              gameId: data.id,
              isArchenemy: data.isArchenemy || false,
              playerCount: data.players.length,
              startingLife: data.players[0]?.life ?? 40,
              players: data.players.map((p: any) => ({
                id: p.id,
                name: p.name,
                life: p.life,
                colorAccent: p.colorAccent,
                isDefeated: p.isDefeated,
                isMonarch: p.isMonarch || false,
                commanderName: p.commanderName,
                commanderImageUrl: p.commanderImageUrl,
                commanderArtCropUrl: p.commanderArtCropUrl,
                commanderDamage: p.commanderDamage || {},
                counters: p.counters || { poison: 0, energy: 0, experience: 0, radiation: 0 }
              })),
              setSetupConfig: useGameStore.getState().setSetupConfig,
              initializeGame: useGameStore.getState().initializeGame,
              updateLife: useGameStore.getState().updateLife,
              updateCommanderDamage: useGameStore.getState().updateCommanderDamage,
              updateCounter: useGameStore.getState().updateCounter,
              updatePlayerName: useGameStore.getState().updatePlayerName,
              updatePlayerColor: useGameStore.getState().updatePlayerColor,
              updateCommander: useGameStore.getState().updateCommander,
              reorderPlayers: useGameStore.getState().reorderPlayers,
              resetGame: useGameStore.getState().resetGame,
              resetGameFully: useGameStore.getState().resetGameFully,
              setMonarch: useGameStore.getState().setMonarch,
              setGameId: useGameStore.getState().setGameId,
              setGameState: useGameStore.getState().setGameState,
              commanderOpacity: useGameStore.getState().commanderOpacity,
              setCommanderOpacity: useGameStore.getState().setCommanderOpacity,
            };
            
            setGameState(state);
            setGameId(savedGameId);
          } else {
            localStorage.removeItem('commander_game_id');
          }
        } catch (error) {
          console.error("Failed to hydrate game state", error);
        }
      }
      setIsHydrating(false);
    };

    hydrate();
  }, [setGameState, setGameId]);

  // 2. Sync Effect (Debounced)
  useEffect(() => {
    if (isHydrating || !gameId || players.length === 0) return;

    localStorage.setItem('commander_game_id', gameId);

    if (syncTimeoutRef.current) {
      window.clearTimeout(syncTimeoutRef.current);
    }

    syncTimeoutRef.current = window.setTimeout(async () => {
      try {
        const dto = {
          id: gameId,
          isArchenemy: useGameStore.getState().isArchenemy,
          players: players.map(p => ({
            id: p.id,
            name: p.name,
            life: p.life,
            colorAccent: p.colorAccent,
            isDefeated: p.isDefeated,
            isMonarch: p.isMonarch,
            commanderName: p.commanderName,
            commanderImageUrl: p.commanderImageUrl,
            commanderArtCropUrl: p.commanderArtCropUrl,
            commanderDamage: p.commanderDamage,
            counters: p.counters
          }))
        };

        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
        await fetch(`${apiUrl}/api/game`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(dto)
        });
      } catch (error) {
        console.error("Failed to sync game state", error);
      }
    }, 1000); // 1 second debounce

    return () => {
      if (syncTimeoutRef.current) {
        window.clearTimeout(syncTimeoutRef.current);
      }
    };
  }, [players, gameId, isHydrating]);

  if (isHydrating) {
    return <div className="min-h-screen bg-black flex items-center justify-center text-white font-bold">Loading...</div>;
  }

  return (
    <Routes>
      <Route path="/" element={<SetupScreen />} />
      <Route path="/game" element={<GameScreen />} />
    </Routes>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}

export default App;
