import React from 'react';
import { type Player, useGameStore } from '../../store/gameStore';
import { useUIStore } from '../../store/uiStore';
import { Plus, Minus, Skull, Shield, Crown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface PlayerPanelProps {
  player: Player;
  isFlipped?: boolean;
  isWinner?: boolean;
  isDraw?: boolean;
  isEditMode?: boolean;
  isOverlay?: boolean;
}

export const PlayerPanel: React.FC<PlayerPanelProps> = ({ player, isFlipped = false, isWinner = false, isDraw = false, isEditMode = false, isOverlay = false }) => {
  const updateLife = useGameStore((state) => state.updateLife);
  const setActivePlayer = useUIStore((state) => state.setActivePlayer);

  const [recentLifeChange, setRecentLifeChange] = React.useState(0);
  const changeTimeoutRef = React.useRef<number | null>(null);

  const handleLifeChange = (delta: number) => {
    updateLife(player.id, delta);
    setRecentLifeChange(prev => prev + delta);
    
    if (changeTimeoutRef.current) {
      clearTimeout(changeTimeoutRef.current);
    }
    
    changeTimeoutRef.current = window.setTimeout(() => {
      setRecentLifeChange(0);
    }, 2000);
  };

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

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: player.id, disabled: !isEditMode || isOverlay });

  const style = isOverlay ? {
    zIndex: 50,
    backgroundColor: player.colorAccent,
    opacity: 1
  } : {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 0 : 1,
    backgroundColor: player.colorAccent,
    opacity: isDragging ? 0 : 1,
  };

  return (
    <motion.div 
      ref={setNodeRef}
      style={style}
      animate={isEditMode && !isDragging && !isOverlay ? {
        rotate: [-0.7, 0.7, -0.7],
        scale: [1, 1.01, 1]
      } : { 
        rotate: 0, 
        scale: isOverlay ? 1.05 : 1 
      }}
      transition={{ 
        repeat: isEditMode && !isDragging && !isOverlay ? Infinity : 0, 
        duration: 0.3,
        ease: 'linear'
      }}
      className={`relative flex flex-col items-center justify-center h-full w-full select-none overflow-hidden rounded-2xl ${player.isDefeated ? 'opacity-50 grayscale' : ''} ${isFlipped ? 'rotate-180' : ''} ${isEditMode ? 'cursor-grab shadow-2xl ring-4 ring-white/50 touch-none' : 'shadow-2xl'}`}
      {...attributes}
      {...listeners}
    >
      {/* Edit Mode Overlay to prevent clicks */}
      {isEditMode && <div className="absolute inset-0 z-50" />}
      
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
      <div className="absolute top-4 w-full flex items-center justify-between px-4 z-20">
        <div className="flex-1 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-white/90 text-2xl font-bold text-center drop-shadow-md">
            {player.name}
          </span>
          {player.isMonarch && (
            <motion.div 
              initial={{ scale: 0, rotate: -180 }} 
              animate={{ scale: 1, rotate: 0 }} 
              className="mt-1"
            >
              <Crown className="w-6 h-6 text-yellow-400 drop-shadow-md" />
            </motion.div>
          )}
        </div>
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
          onClick={() => handleLifeChange(-1)}
        >
          <Minus className="w-10 h-10 md:w-16 md:h-16 text-white/70" />
        </button>
        
        <motion.div 
          key={player.life}
          initial={{ scale: 1.2, color: '#ffffff' }}
          animate={{ scale: 1, color: '#ffffff' }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
          className="text-[5rem] md:text-[8rem] font-bold text-white drop-shadow-xl tabular-nums tracking-tighter w-24 md:w-48 text-center pointer-events-none"
        >
          {player.life}
        </motion.div>

        <button 
          className="flex-1 h-full flex items-center justify-center active:bg-black/20 transition-colors rounded-r-2xl"
          onClick={() => handleLifeChange(1)}
        >
          <Plus className="w-10 h-10 md:w-16 md:h-16 text-white/70" />
        </button>
      </div>

      <button 
        disabled={isEditMode}
        onClick={() => setActivePlayer(player.id)}
        className={`absolute bottom-4 right-4 p-3 rounded-full text-white/80 transition-colors z-20 ${isEditMode ? 'bg-black/10 opacity-50' : 'bg-black/30 hover:bg-black/50'}`}
      >
        <Shield className="w-6 h-6" />
      </button>

      {/* Recent Life Change Floating Bubble */}
      <AnimatePresence>
        {recentLifeChange !== 0 && (
          <motion.div
            initial={{ opacity: 0, y: -40, scale: 0.5, x: '-50%' }}
            animate={{ opacity: 1, y: -140, scale: 1, x: '-50%' }}
            exit={{ opacity: 0, scale: 0.8, x: '-50%', y: -160 }}
            className={`absolute top-1/2 left-1/2 z-30 px-6 py-2 rounded-full font-bold text-4xl shadow-2xl pointer-events-none backdrop-blur-md ${recentLifeChange > 0 ? 'bg-green-500/90 text-white' : 'bg-red-500/90 text-white'}`}
          >
            {recentLifeChange > 0 ? `+${recentLifeChange}` : recentLifeChange}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
