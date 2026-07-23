import React, { useState } from 'react';
import { useGameStore } from '../../store/gameStore';
import { useUIStore } from '../../store/uiStore';
import { X, Search, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface CommanderDto {
  scryfallId: string;
  name: string;
  imageUrl: string;
  artCropUrl: string;
  manaCost: string;
  typeLine: string;
}

export const CommanderSearchModal: React.FC = () => {
  const { isSearchModalOpen, searchPlayerId, closeSearchModal } = useUIStore();
  const { updateCommander, players } = useGameStore();

  const [query, setQuery] = useState('');
  const [results, setResults] = useState<CommanderDto[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const player = players.find(p => p.id === searchPlayerId);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`http://localhost:5000/api/scryfall/search?q=${encodeURIComponent(query)}`);
      if (!response.ok) {
        throw new Error('Failed to fetch commanders');
      }
      const data = await response.json();
      setResults(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelect = (commander: CommanderDto) => {
    if (!searchPlayerId) return;
    updateCommander(searchPlayerId, commander.name, commander.imageUrl, commander.artCropUrl);
    closeSearchModal();
  };

  return (
    <AnimatePresence>
      {isSearchModalOpen && searchPlayerId && player && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
        >
          <motion.div 
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -50, opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="w-full max-w-2xl bg-neutral-900 rounded-3xl border-2 overflow-hidden flex flex-col max-h-[80vh]"
            style={{ borderColor: player.colorAccent }}
          >
            <div 
              className="p-4 flex items-center justify-between shadow-lg"
          style={{ backgroundColor: player.colorAccent }}
        >
          <h2 className="text-2xl font-bold text-white text-shadow">Set Commander for {player.name}</h2>
          <button 
            onClick={closeSearchModal}
            className="p-2 bg-black/20 hover:bg-black/40 rounded-full transition-colors text-white"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 flex flex-col gap-4 overflow-hidden">
          <form onSubmit={handleSearch} className="flex gap-2">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search for a commander..."
              className="flex-1 bg-neutral-800 text-white px-4 py-3 rounded-xl border border-neutral-700 focus:outline-none focus:border-blue-500"
            />
            <button
              type="submit"
              disabled={isLoading || !query.trim()}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold rounded-xl flex items-center gap-2 transition-colors"
            >
              {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Search className="w-5 h-5" />}
              Search
            </button>
          </form>

          {error && <div className="text-red-400 text-center">{error}</div>}

          <div className="flex-1 overflow-y-auto min-h-0">
            {results.length === 0 && !isLoading && !error && (
              <div className="text-center text-neutral-500 py-8">
                Enter a search term to find a commander.
              </div>
            )}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 pb-4">
              {results.map((commander) => (
                <button
                  key={commander.scryfallId}
                  onClick={() => handleSelect(commander)}
                  className="flex flex-col items-center gap-2 group text-left"
                >
                  <div className="relative w-full aspect-[2.5/3.5] rounded-xl overflow-hidden border-2 border-transparent group-hover:border-blue-500 transition-colors">
                    {commander.imageUrl ? (
                      <img 
                        src={commander.imageUrl} 
                        alt={commander.name} 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-neutral-800 flex items-center justify-center p-2 text-center text-xs text-neutral-400">
                        No Image Available
                      </div>
                    )}
                  </div>
                  <span className="text-sm font-semibold text-white/90 group-hover:text-white line-clamp-2">
                    {commander.name}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
        </motion.div>
      </motion.div>
      )}
    </AnimatePresence>
  );
};
