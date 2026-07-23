import React from 'react';
import { useGameStore } from '../../store/gameStore';
import { useUIStore } from '../../store/uiStore';
import { X, Plus, Minus, Skull, Zap, ArrowUpCircle, Search, Shield, Crown, Radiation } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const CountersModal: React.FC = () => {
  const { activePlayerId, setActivePlayer, openSearchModal } = useUIStore();
  const { players, updateCommanderDamage, updateCounter, setMonarch } = useGameStore();

  const [diceResult, setDiceResult] = React.useState<number | null>(null);
  const [isRolling, setIsRolling] = React.useState(false);

  const player = players.find(p => p.id === activePlayerId);

  const opponents = player ? players.filter(p => p.id !== activePlayerId) : [];

  const rollDice = (sides: number) => {
    if (isRolling) return;
    setIsRolling(true);
    
    let rolls = 0;
    const maxRolls = 15;
    
    const interval = setInterval(() => {
      setDiceResult(Math.floor(Math.random() * sides) + 1);
      rolls++;
      if (rolls >= maxRolls) {
        clearInterval(interval);
        setIsRolling(false);
        setDiceResult(Math.floor(Math.random() * sides) + 1);
      }
    }, 60);
  };

  const renderCounterControl = (
    label: string, 
    value: number, 
    onDecrement: () => void, 
    onIncrement: () => void,
    icon: React.ReactNode,
    colorClass: string
  ) => (
    <div className="flex items-center justify-between bg-neutral-800 p-3 rounded-xl border border-neutral-700">
      <div className="flex items-center gap-3">
        <div className={`p-2 rounded-lg ${colorClass}`}>
          {icon}
        </div>
        <span className="font-bold text-lg text-white/90">{label}</span>
      </div>
      <div className="flex items-center gap-4">
        <button 
          onClick={onDecrement}
          className="p-2 bg-neutral-700 rounded-lg active:bg-neutral-600 transition-colors"
        >
          <Minus className="w-6 h-6 text-white" />
        </button>
        <span className="w-12 text-center text-2xl font-bold text-white tabular-nums">
          {value}
        </span>
        <button 
          onClick={onIncrement}
          className="p-2 bg-neutral-700 rounded-lg active:bg-neutral-600 transition-colors"
        >
          <Plus className="w-6 h-6 text-white" />
        </button>
      </div>
    </div>
  );

  return (
    <AnimatePresence>
      {activePlayerId && player && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
        >
          <motion.div 
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 50, opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="w-full max-w-md bg-neutral-900 rounded-3xl border-2 overflow-hidden flex flex-col max-h-full"
            style={{ borderColor: player.colorAccent }}
          >
            <div 
              className="p-4 flex items-center justify-between shadow-lg"
          style={{ backgroundColor: player.colorAccent }}
        >
          <h2 className="text-2xl font-bold text-white text-shadow">{player.name}'s Counters</h2>
          <button 
            onClick={() => setActivePlayer(null)}
            className="p-2 bg-black/20 hover:bg-black/40 rounded-full transition-colors text-white"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto space-y-6">
          
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-neutral-400 uppercase tracking-wider">Status Counters</h3>
            {renderCounterControl(
              'Poison', 
              player.counters.poison, 
              () => updateCounter(player.id, 'poison', -1),
              () => updateCounter(player.id, 'poison', 1),
              <Skull className="w-6 h-6 text-green-400" />,
              'bg-green-400/20'
            )}
            {renderCounterControl(
              'Energy', 
              player.counters.energy, 
              () => updateCounter(player.id, 'energy', -1),
              () => updateCounter(player.id, 'energy', 1),
              <Zap className="w-6 h-6 text-blue-400" />,
              'bg-blue-400/20'
            )}
            {renderCounterControl(
              'Experience', 
              player.counters.experience, 
              () => updateCounter(player.id, 'experience', -1),
              () => updateCounter(player.id, 'experience', 1),
              <ArrowUpCircle className="w-6 h-6 text-yellow-400" />,
              'bg-yellow-400/20'
            )}
            {renderCounterControl(
              'Radiation', 
              player.counters.radiation || 0, 
              () => updateCounter(player.id, 'radiation', -1),
              () => updateCounter(player.id, 'radiation', 1),
              <Radiation className="w-6 h-6 text-emerald-400" />,
              'bg-emerald-400/20'
            )}
          </div>

          <div className="space-y-3">
            <h3 className="text-sm font-bold text-neutral-400 uppercase tracking-wider">Commander Damage Taken</h3>
            {opponents.map(opp => (
              renderCounterControl(
                `From ${opp.name}`, 
                player.commanderDamage[opp.id] || 0, 
                () => updateCommanderDamage(player.id, opp.id, -1),
                () => updateCommanderDamage(player.id, opp.id, 1),
                <Shield className="w-6 h-6" style={{ color: opp.colorAccent }} />,
                'bg-neutral-800'
              )
            ))}
          </div>

          <div className="space-y-3 pt-4 border-t border-neutral-700/50">
            <h3 className="text-sm font-bold text-neutral-400 uppercase tracking-wider">Commander</h3>
            {player.commanderName && (
              <div className="flex items-center gap-4 bg-neutral-800 p-3 rounded-xl border border-neutral-700">
                {player.commanderArtCropUrl && (
                  <img src={player.commanderArtCropUrl} alt={player.commanderName} className="w-16 h-12 object-cover rounded-lg" />
                )}
                <span className="font-bold text-white flex-1">{player.commanderName}</span>
              </div>
            )}
            <button
              onClick={() => {
                setActivePlayer(null); // Close this modal
                openSearchModal(player.id); // Open search modal
              }}
              className="w-full flex items-center justify-center gap-2 py-3 bg-neutral-800 hover:bg-neutral-700 text-white font-bold rounded-xl border border-neutral-700 transition-colors"
            >
              <Search className="w-5 h-5" />
              {player.commanderName ? 'Change Commander' : 'Set Commander'}
            </button>
          </div>

          <div className="space-y-3 pt-4 border-t border-neutral-700/50">
            <h3 className="text-sm font-bold text-neutral-400 uppercase tracking-wider">Game Status</h3>
            <button
              onClick={() => {
                setMonarch(player.id);
                setActivePlayer(null); // Close modal
              }}
              className={`w-full flex items-center justify-center gap-2 py-3 font-bold rounded-xl border transition-colors ${
                player.isMonarch 
                  ? 'bg-yellow-500/20 border-yellow-500/50 text-yellow-400' 
                  : 'bg-neutral-800 border-neutral-700 hover:bg-neutral-700 text-white'
              }`}
            >
              <Crown className="w-5 h-5" />
              {player.isMonarch ? 'Current Monarch' : 'Become Monarch'}
            </button>
          </div>

          {/* Dice Roller Section */}
          <div className="space-y-3 pt-4 border-t border-neutral-700/50">
            <h3 className="text-sm font-bold text-neutral-400 uppercase tracking-wider">Dice Roller</h3>
            
            <div className="bg-neutral-800 p-4 rounded-xl border border-neutral-700 flex flex-col items-center">
              <div className="h-16 flex items-center justify-center mb-4">
                {diceResult !== null ? (
                  <motion.div 
                    key={isRolling ? 'rolling' : 'result'}
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className={`text-5xl font-black tabular-nums drop-shadow-lg ${isRolling ? 'text-neutral-400' : 'text-purple-400'}`}
                  >
                    {diceResult}
                  </motion.div>
                ) : (
                  <span className="text-neutral-500 text-sm font-medium">Select a dice to roll</span>
                )}
              </div>

              <div className="flex gap-2 w-full">
                {[4, 6, 8, 10, 20].map(sides => (
                  <button
                    key={sides}
                    onClick={() => rollDice(sides)}
                    disabled={isRolling}
                    className="flex-1 py-3 bg-neutral-700 hover:bg-neutral-600 active:bg-neutral-500 rounded-lg font-bold text-white transition-colors disabled:opacity-50 border border-neutral-600"
                  >
                    d{sides}
                  </button>
                ))}
              </div>
            </div>
          </div>

        </div>
      </motion.div>
    </motion.div>
      )}
    </AnimatePresence>
  );
};
