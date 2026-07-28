import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGameStore } from '../../store/gameStore';
import { PlayerPanel } from './PlayerPanel';
import { CountersModal } from './CountersModal';
import { CommanderSearchModal } from './CommanderSearchModal';
import { RotateCcw, Maximize, Minimize, Settings2 } from 'lucide-react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
  DragOverlay,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
} from '@dnd-kit/sortable';

export const GameScreen: React.FC = () => {
  const { players, isArchenemy, resetGame, resetGameFully, reorderPlayers } = useGameStore();
  const navigate = useNavigate();
  const [isFullscreen, setIsFullscreen] = React.useState(false);
  const [isEditMode, setIsEditMode] = React.useState(false);
  const [activeId, setActiveId] = React.useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      reorderPlayers(active.id as string, over.id as string);
    }
    setActiveId(null);
  };

  const handleDragCancel = () => {
    setActiveId(null);
  };

  const toggleFullscreen = async () => {
    if (!document.fullscreenElement) {
      if (document.documentElement.requestFullscreen) {
        await document.documentElement.requestFullscreen().catch(err => console.error(err));
        setIsFullscreen(true);
      }
    } else {
      if (document.exitFullscreen) {
        await document.exitFullscreen().catch(err => console.error(err));
        setIsFullscreen(false);
      }
    }
  };

  const isFullscreenSupported = !!document.documentElement.requestFullscreen;

  useEffect(() => {
    if (players.length === 0) {
      navigate('/');
    }
  }, [players, navigate]);

  if (players.length === 0) return null;

  // Determine grid layout based on player count
  let gridClass = "grid-cols-1 grid-rows-2";
  if (isArchenemy) {
    if (players.length === 2) gridClass = "grid-cols-1 grid-rows-2";
    else if (players.length === 3) gridClass = "grid-cols-2 grid-rows-2";
    else if (players.length === 4) gridClass = "grid-cols-3 grid-rows-2";
    else if (players.length === 5) gridClass = "grid-cols-4 grid-rows-2";
    else if (players.length === 6) gridClass = "grid-cols-5 grid-rows-2";
    else if (players.length === 7) gridClass = "grid-cols-6 grid-rows-2";
    else gridClass = "grid-cols-7 grid-rows-2"; // 8 players max
  } else {
    if (players.length === 3) gridClass = "grid-cols-1 sm:grid-cols-2 grid-rows-3 sm:grid-rows-2";
    if (players.length === 4) gridClass = "grid-cols-1 sm:grid-cols-2 grid-rows-4 sm:grid-rows-2";
    if (players.length === 5) gridClass = "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 grid-rows-5 sm:grid-rows-3 lg:grid-rows-2";
    if (players.length === 6) gridClass = "grid-cols-2 sm:grid-cols-3 grid-rows-3 sm:grid-rows-2";
    if (players.length === 7) gridClass = "grid-cols-2 sm:grid-cols-4 grid-rows-4 sm:grid-rows-2";
    if (players.length === 8) gridClass = "grid-cols-2 sm:grid-cols-4 grid-rows-4 sm:grid-rows-2";
  }

  const alivePlayers = players.filter(p => !p.isDefeated);
  const isDraw = players.length > 0 && alivePlayers.length === 0;
  const winnerId = players.length > 1 && alivePlayers.length === 1 ? alivePlayers[0].id : null;

  const activePlayer = players.find(p => p.id === activeId);
  const activeIndex = players.findIndex(p => p.id === activeId);
  const activeIsFlipped = activeIndex !== -1 && (isArchenemy ? activeIndex === 0 : activeIndex < Math.ceil(players.length / 2));

  return (
    <div className="h-screen w-screen bg-black overflow-hidden relative">
      <DndContext 
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragCancel={handleDragCancel}
      >
        <SortableContext 
          items={players.map(p => p.id)}
          strategy={rectSortingStrategy}
        >
          <div className={`grid h-full w-full gap-1 p-1 ${gridClass}`}>
            {players.map((player, index) => {
              const isFlipped = isArchenemy ? index === 0 : index < Math.ceil(players.length / 2);
              const archenemySpan = isArchenemy && index === 0 ? "col-span-full" : "";
              
              return (
                <div key={player.id} className={`relative overflow-hidden ${archenemySpan}`}>
                  <PlayerPanel 
                    player={player} 
                    isFlipped={isFlipped} 
                    isWinner={player.id === winnerId}
                    isDraw={isDraw}
                    isEditMode={isEditMode}
                  />
                </div>
              );
            })}
          </div>
        </SortableContext>
        
        <DragOverlay dropAnimation={null}>
          {activePlayer ? (
            <div className="w-full h-full rounded-2xl overflow-hidden shadow-2xl ring-4 ring-white">
              <PlayerPanel
                player={activePlayer}
                isFlipped={activeIsFlipped}
                isWinner={activePlayer.id === winnerId}
                isDraw={isDraw}
                isEditMode={true}
                isOverlay={true}
              />
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

      {/* Central Menu Button */}
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 flex gap-2">
        <button 
          className="bg-neutral-800/80 backdrop-blur-md p-4 rounded-full text-white shadow-2xl border border-white/10 hover:bg-neutral-700/80 transition-colors"
          onClick={() => {
            if (confirm('Reset the game to starting life?')) {
              resetGame();
            }
          }}
          title="Reset Life"
        >
          <RotateCcw className="w-8 h-8" />
        </button>
        <button 
          className="bg-neutral-800/80 backdrop-blur-md p-4 rounded-full text-white shadow-2xl border border-white/10 hover:bg-red-900/80 transition-colors"
          onClick={() => {
            if (confirm('End game and return to setup?')) {
              resetGameFully();
              navigate('/');
            }
          }}
          title="End Game"
        >
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
        </button>
        <button 
          className={`backdrop-blur-md p-4 rounded-full text-white shadow-2xl border transition-colors ${
            isEditMode ? 'bg-blue-600 border-blue-400' : 'bg-neutral-800/80 border-white/10 hover:bg-neutral-700/80'
          }`}
          onClick={() => setIsEditMode(!isEditMode)}
          title={isEditMode ? "Save Order" : "Reorder Players"}
        >
          <Settings2 className="w-8 h-8" />
        </button>
        {isFullscreenSupported && (
          <button 
            className="bg-neutral-800/80 backdrop-blur-md p-4 rounded-full text-white shadow-2xl border border-white/10 hover:bg-neutral-700/80 transition-colors"
            onClick={toggleFullscreen}
          >
            {isFullscreen ? <Minimize className="w-8 h-8" /> : <Maximize className="w-8 h-8" />}
          </button>
        )}
      </div>

      {/* Modals */}
      <CountersModal />
      <CommanderSearchModal />
    </div>
  );
};
