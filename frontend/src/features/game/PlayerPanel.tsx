import React from 'react';
import { type Player, useGameStore } from '../../store/gameStore';
import { useUIStore } from '../../store/uiStore';
import { Plus, Minus, Skull, Shield, Crown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface PlayerPanelProps {
  player: Player;
  isFlipped?: boolean;
  isWinner?: boolean;
  isDraw?: boolean;
}

export const PlayerPanel: React.FC<PlayerPanelProps> = ({ player, isFlipped = false, isWinner = false, isDraw = false }) => {
  const updateLife = useGameStore((state) => state.updateLife);
  const setActivePlayer = useUIStore((state) => state.setActivePlayer);

  // Calculate Danger Level for Visual Feedback (0 to 1)
  const lifeDanger = !player.isDefeated && player.life <= 10 ? (11 - Math.max(1, player.life)) / 10 : 0;
  const poisonDanger = !player.isDefeated && player.counters.poison >= 8 ? (player.counters.poison - 7) / 3 : 0;
  
  const maxCmdrDmg = Object.values(player.commanderDamage).length > 0 
    ? Math.max(...Object.values(player.commanderDamage)) 
    : 0;
  const cmdrDanger = !player.isDefeated && maxCmdrDmg >= 17 ? (maxCmdrDmg - 16) / 5 : 0;

  const maxDanger = Math.max(lifeDanger, poisonDanger, cmdrDanger);

  const isReddish = ['#ef4444', '#f97316', '#ec4899'].includes(player.colorAccent);
  const warningRgb = isReddish ? '0, 0, 0' : '255, 0, 0';

  return (
    <div 
      className={`relative flex flex-col items-center justify-center h-full w-full select-none transition-all overflow-hidden ${player.isDefeated ? 'opacity-50 grayscale' : ''} ${isFlipped ? 'rotate-180' : ''}`}
      style={{ backgroundColor: player.colorAccent }}
    >
      {/* Background Commander Art */}
      {player.commanderArtCropUrl && (
        <div 
          className="absolute inset-0 opacity-30 mix-blend-overlay pointer-events-none"
          style={{ 
            backgroundImage: `url(${player.commanderArtCropUrl})`, 
            backgroundSize: 'cover', 
            backgroundPosition: 'center' 
          }}
        />
      )}

      {/* Danger Warning Vignette overlay */}
      <AnimatePresence>
        {maxDanger > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ 
              opacity: [maxDanger * 0.4, maxDanger * 0.8, maxDanger * 0.4],
            }}
            transition={{
              duration: 1.5 - (maxDanger * 0.5), // Pulses faster as danger increases
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="absolute inset-0 pointer-events-none"
            style={{
              boxShadow: `inset 0 0 ${maxDanger * 150}px rgba(${warningRgb}, ${maxDanger * 0.8})`,
              background: `radial-gradient(circle, transparent 40%, rgba(${warningRgb},${maxDanger * 0.4}) 100%)`
            }}
          />
        )}
      </AnimatePresence>

      {/* Player Name */}
      <div className="absolute top-4 w-full text-center px-4">
        <input 
          className="bg-transparent text-white/90 text-xl font-bold text-center w-full focus:outline-none placeholder-white/50"
          value={player.name}
          onChange={(e) => useGameStore.getState().updatePlayerName(player.id, e.target.value)}
          placeholder="Player Name"
        />
        {player.isMonarch && (
          <motion.div 
            initial={{ scale: 0, rotate: -180 }} 
            animate={{ scale: 1, rotate: 0 }} 
            className="flex justify-center mt-1"
          >
            <Crown className="w-8 h-8 text-yellow-400 drop-shadow-md" />
          </motion.div>
        )}
      </div>

      {/* Defeated / Winner / Draw Overlay */}
      <AnimatePresence>
        {isDraw && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none bg-black/60 backdrop-blur-sm"
          >
            <h2 className="text-5xl font-black text-neutral-400 uppercase tracking-widest drop-shadow-2xl">Draw</h2>
          </motion.div>
        )}
        {!isDraw && isWinner && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none bg-yellow-500/30 backdrop-blur-sm"
          >
            <h2 className="text-5xl font-black text-yellow-300 uppercase tracking-widest drop-shadow-2xl">Winner!</h2>
          </motion.div>
        )}
        {!isDraw && !isWinner && player.isDefeated && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none bg-black/40"
          >
            <Skull className="w-32 h-32 text-black/70 drop-shadow-lg" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Life Controls */}
      <div className="flex w-full h-full items-center justify-between px-2">
        <button 
          className="flex-1 h-full flex items-center justify-center active:bg-black/20 transition-colors rounded-l-2xl"
          onClick={() => updateLife(player.id, -1)}
        >
          <Minus className="w-16 h-16 text-white/70" />
        </button>
        
        <motion.div 
          key={player.life}
          initial={{ scale: 1.2, color: '#ffffff' }}
          animate={{ scale: 1, color: '#ffffff' }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
          className="text-[8rem] font-bold text-white drop-shadow-xl tabular-nums tracking-tighter w-48 text-center pointer-events-none"
        >
          {player.life}
        </motion.div>

        <button 
          className="flex-1 h-full flex items-center justify-center active:bg-black/20 transition-colors rounded-r-2xl"
          onClick={() => updateLife(player.id, 1)}
        >
          <Plus className="w-16 h-16 text-white/70" />
        </button>
      </div>

      {/* Open Counters / Settings */}
      <button 
        onClick={() => setActivePlayer(player.id)}
        className="absolute bottom-4 right-4 bg-black/30 p-3 rounded-full text-white/80 hover:bg-black/50 transition-colors"
      >
        <Shield className="w-6 h-6" />
      </button>
    </div>
  );
};
