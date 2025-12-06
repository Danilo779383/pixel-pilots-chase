import React, { useEffect } from 'react';
import { useGame } from '@/context/GameContext';
import { Track } from '@/types/game';
import { startMenuMusic, stopAllMusic } from '@/utils/soundEffects';

const DIFFICULTY_COLORS = {
  Easy: 'text-neon-green',
  Medium: 'text-neon-yellow',
  Hard: 'text-neon-orange',
  Extreme: 'text-destructive',
};

const WorldTour: React.FC = () => {
  const { gameState, tracks, selectTrack, startRace, setScreen } = useGame();
  const { player, currentTrack } = gameState;

  useEffect(() => {
    startMenuMusic();
    return () => stopAllMusic();
  }, []);

  if (!player) return null;

  const handleStartRace = () => {
    if (currentTrack && currentTrack.unlocked) {
      startRace();
    }
  };

  return (
    <div className="min-h-screen flex flex-col relative">
      <div className="absolute inset-0 retro-grid opacity-10" />
      
      <div className="relative z-10 flex-1 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-border bg-card/80 backdrop-blur">
          <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-4">
            <div>
              <h1 className="font-display text-lg text-primary text-glow-cyan">
                WORLD TOUR
              </h1>
              <p className="font-display text-[8px] text-muted-foreground">
                SELECT YOUR NEXT CHALLENGE
              </p>
            </div>
            
            {/* Player Stats */}
            <div className="flex items-center gap-6">
              <div className="text-center">
                <p className="font-display text-sm text-accent">${player.stats.money.toLocaleString()}</p>
                <p className="font-display text-[6px] text-muted-foreground">EARNINGS</p>
              </div>
              <div className="text-center">
                <p className="font-display text-sm text-primary">{player.stats.wins}</p>
                <p className="font-display text-[6px] text-muted-foreground">WINS</p>
              </div>
              <div className="text-center">
                <p className="font-display text-sm text-secondary">{player.stats.fame}%</p>
                <p className="font-display text-[6px] text-muted-foreground">FAME</p>
              </div>
              <button
                onClick={() => setScreen('standings')}
                className="arcade-button text-[8px] py-2 px-4"
              >
                STANDINGS
              </button>
            </div>
          </div>
        </div>

        {/* Track Grid */}
        <div className="flex-1 p-4 overflow-y-auto">
          <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {tracks.map(track => (
              <TrackCard
                key={track.id}
                track={track}
                isSelected={currentTrack?.id === track.id}
                onSelect={() => selectTrack(track)}
              />
            ))}
          </div>
        </div>

        {/* Action Bar */}
        <div className="p-4 border-t border-border bg-card/80 backdrop-blur">
          <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
            <div className="flex gap-4">
              <button
                onClick={() => setScreen('menu')}
                className="arcade-button arcade-button-pink text-[8px] py-2 px-4"
              >
                MENU
              </button>
              <button
                onClick={() => setScreen('garage')}
                className="arcade-button text-[8px] py-2 px-4 border-accent text-accent"
              >
                🔧 GARAGE
              </button>
              {player.stats.fame >= 80 && (
                <button
                  onClick={() => setScreen('career-end')}
                  className="arcade-button text-[8px] py-2 px-4 border-secondary text-secondary"
                >
                  RETIRE
                </button>
              )}
            </div>
            
            {currentTrack && (
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="font-display text-xs text-foreground">{currentTrack.name}</p>
                  <p className={`font-display text-[8px] ${DIFFICULTY_COLORS[currentTrack.difficulty]}`}>
                    {currentTrack.difficulty.toUpperCase()}
                  </p>
                </div>
                <button
                  onClick={handleStartRace}
                  disabled={!currentTrack.unlocked}
                  className="arcade-button text-xs disabled:opacity-50"
                >
                  {currentTrack.unlocked ? 'START RACE' : 'LOCKED'}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const TrackCard: React.FC<{
  track: Track;
  isSelected: boolean;
  onSelect: () => void;
}> = ({ track, isSelected, onSelect }) => {
  const difficultyColor = DIFFICULTY_COLORS[track.difficulty];

  return (
    <button
      onClick={onSelect}
      className={`relative p-4 border-2 transition-all text-left ${
        !track.unlocked
          ? 'border-muted bg-muted/20 opacity-60'
          : isSelected
          ? 'border-primary bg-primary/10 box-glow-cyan'
          : 'border-border bg-card/50 hover:border-primary/50'
      }`}
    >
      {/* Track visual */}
      <div className="aspect-video bg-gradient-to-br from-muted to-background mb-3 flex items-center justify-center text-4xl border border-border/50">
        {track.unlocked ? '🏁' : '🔒'}
      </div>
      
      {/* Track info */}
      <h3 className="font-display text-[10px] text-foreground mb-1 truncate">
        {track.name}
      </h3>
      <p className="font-body text-[10px] text-muted-foreground mb-2">
        {track.country}
      </p>
      
      <div className="flex items-center justify-between">
        <span className={`font-display text-[8px] ${difficultyColor}`}>
          {track.difficulty.toUpperCase()}
        </span>
        <span className="font-display text-[8px] text-muted-foreground">
          {track.length}km
        </span>
      </div>
    </button>
  );
};

export default WorldTour;
