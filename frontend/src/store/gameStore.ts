import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';

export type Player = {
  id: string;
  name: string;
  life: number;
  colorAccent: string;
  isDefeated: boolean;
  commanderDamage: Record<string, number>; // key: opponent's playerId, value: damage taken
  counters: {
    poison: number;
    energy: number;
    experience: number;
    radiation: number;
    [key: string]: number; // for any custom counters
  };
  isMonarch: boolean;
  commanderName?: string;
  commanderImageUrl?: string;
  commanderArtCropUrl?: string;
  commanderOpacity?: number;
};

export type GameState = {
  gameId: string | null;
  players: Player[];
  playerCount: number;
  startingLife: number;
  isArchenemy: boolean;
  setSetupConfig: (playerCount: number, startingLife: number, isArchenemy?: boolean) => void;
  initializeGame: (playerCount: number) => void;
  updateLife: (playerId: string, delta: number) => void;
  updateCommanderDamage: (playerId: string, opponentId: string, delta: number) => void;
  updateCounter: (playerId: string, counterType: string, delta: number) => void;
  updatePlayerName: (playerId: string, name: string) => void;
  updatePlayerColor: (playerId: string, color: string) => void;
  updatePlayerOpacity: (playerId: string, opacity: number) => void;
  updateCommander: (playerId: string, name: string, imageUrl: string, artCropUrl: string) => void;
  reorderPlayers: (activeId: string, overId: string) => void;
  resetGame: () => void;
  resetGameFully: () => void;
  setMonarch: (playerId: string) => void;
  setGameId: (id: string | null) => void;
  setGameState: (state: GameState) => void;
};

export const DEFAULT_COLORS = [
  '#ef4444', // red
  '#3b82f6', // blue
  '#22c55e', // green
  '#a855f7', // purple
  '#f97316', // orange
  '#eab308', // yellow
  '#06b6d4', // cyan
  '#ec4899', // pink
];

export const useGameStore = create<GameState>((set) => ({
  gameId: null,
  players: [],
  playerCount: 4,
  startingLife: 40,
  isArchenemy: false,
  
  setSetupConfig: (playerCount, startingLife, isArchenemy = false) => set({ playerCount, startingLife, isArchenemy }),

  initializeGame: (playerCount) => set((state) => {
    const shuffledColors = [...DEFAULT_COLORS].sort(() => Math.random() - 0.5);

    const newPlayers: Player[] = Array.from({ length: playerCount }).map((_, index) => ({
      id: uuidv4(),
      name: `Player ${index + 1}`,
      life: state.isArchenemy && index === 0 ? 40 : state.startingLife,
      colorAccent: shuffledColors[index % shuffledColors.length],
      isDefeated: false,
      isMonarch: false,
      commanderDamage: {},
      counters: { poison: 0, energy: 0, experience: 0, radiation: 0 },
      commanderOpacity: 50,
    }));
    return { players: newPlayers };
  }),

  updateLife: (playerId, delta) => set((state) => ({
    players: state.players.map((p) => {
      if (p.id === playerId) {
        const newLife = p.life + delta;
        return { ...p, life: newLife, isDefeated: newLife <= 0 || p.counters.poison >= 10 };
      }
      return p;
    }),
  })),

  updateCommanderDamage: (playerId, opponentId, delta) => set((state) => ({
    players: state.players.map((p) => {
      if (p.id === playerId) {
        const currentDmg = p.commanderDamage[opponentId] || 0;
        const newDmg = Math.max(0, currentDmg + delta);
        const newLife = p.life - delta; // Commander damage also reduces life
        
        const isDefeated = newLife <= 0 || newDmg >= 21 || p.counters.poison >= 10;
        
        return { 
          ...p, 
          life: newLife,
          commanderDamage: { ...p.commanderDamage, [opponentId]: newDmg },
          isDefeated 
        };
      }
      return p;
    }),
  })),

  updateCounter: (playerId, counterType, delta) => set((state) => ({
    players: state.players.map((p) => {
      if (p.id === playerId) {
        const currentVal = p.counters[counterType] || 0;
        const newVal = Math.max(0, currentVal + delta);
        const isDefeated = p.life <= 0 || (counterType === 'poison' && newVal >= 10);
        
        return {
          ...p,
          counters: { ...p.counters, [counterType]: newVal },
          isDefeated
        };
      }
      return p;
    })
  })),

  updatePlayerName: (playerId, name) => set((state) => ({
    players: state.players.map((p) => p.id === playerId ? { ...p, name } : p)
  })),

  updatePlayerColor: (playerId, color) => set((state) => ({
    players: state.players.map((p) => p.id === playerId ? { ...p, colorAccent: color } : p)
  })),

  updatePlayerOpacity: (playerId, opacity) => set((state) => ({
    players: state.players.map((p) => p.id === playerId ? { ...p, commanderOpacity: opacity } : p)
  })),

  updateCommander: (playerId, name, imageUrl, artCropUrl) => set((state) => ({
    players: state.players.map((p) => p.id === playerId ? { ...p, commanderName: name, commanderImageUrl: imageUrl, commanderArtCropUrl: artCropUrl } : p)
  })),

  reorderPlayers: (activeId, overId) => set((state) => {
    const oldIndex = state.players.findIndex(p => p.id === activeId);
    const newIndex = state.players.findIndex(p => p.id === overId);
    if (oldIndex === -1 || newIndex === -1) return state;
    
    const newPlayers = [...state.players];
    const [movedPlayer] = newPlayers.splice(oldIndex, 1);
    newPlayers.splice(newIndex, 0, movedPlayer);
    
    return { players: newPlayers };
  }),

  resetGame: () => set((state) => ({
    players: state.players.map((p, index) => ({ 
      ...p, 
      life: state.isArchenemy && index === 0 ? 40 : state.startingLife, 
      isDefeated: false,
      isMonarch: false,
      commanderDamage: {},
      counters: { poison: 0, energy: 0, experience: 0, radiation: 0 }
    }))
  })),

  resetGameFully: () => set({
    gameId: null,
    players: [],
    playerCount: 4,
    startingLife: 40,
    isArchenemy: false
  }),

  setMonarch: (playerId) => set((state) => ({
    players: state.players.map(p => ({
      ...p,
      isMonarch: p.id === playerId
    }))
  })),

  setGameId: (id) => set({ gameId: id }),
  setGameState: (state) => set({ ...state })
}));
