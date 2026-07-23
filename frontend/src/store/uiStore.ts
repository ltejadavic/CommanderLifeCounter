import { create } from 'zustand';

export type UIState = {
  activePlayerId: string | null;
  setActivePlayer: (id: string | null) => void;
  isSettingsOpen: boolean;
  setSettingsOpen: (isOpen: boolean) => void;
  isSearchModalOpen: boolean;
  searchPlayerId: string | null;
  openSearchModal: (playerId: string) => void;
  closeSearchModal: () => void;
};

export const useUIStore = create<UIState>((set) => ({
  activePlayerId: null,
  setActivePlayer: (id) => set({ activePlayerId: id }),
  isSettingsOpen: false,
  setSettingsOpen: (isOpen) => set({ isSettingsOpen: isOpen }),
  isSearchModalOpen: false,
  searchPlayerId: null,
  openSearchModal: (playerId) => set({ isSearchModalOpen: true, searchPlayerId: playerId }),
  closeSearchModal: () => set({ isSearchModalOpen: false, searchPlayerId: null })
}));
