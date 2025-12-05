import React, { useEffect } from 'react';
import { useGame } from '@/context/GameContext';
import { startMenuMusic, stopAllMusic } from '@/utils/soundEffects';

const Standings: React.FC = () => {
  const { gameState, setScreen, unlockTrack, tracks } = useGame();
  const { player } = gameState;

  useEffect(() => {
    startMenuMusic();
    return () => stopAllMusic();
  }, []);

  if (!player) return null;

  // Unlock next track if won enough races
  const lockedTracks = tracks.filter(t => !t.unlocked);
  const canUnlock = player.stats.wins >= 2 && lockedTracks.length > 0;

  const handleUnlock = () => {
    if (lockedTracks[0]) {
      unlockTrack(lockedTracks[0].id);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 relative">
      <div className="absolute inset-0 retro-grid opacity-20" />
      
      <div className="relative z-10 w-full max-w-lg space-y-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="font-display text-xl text-primary text-glow-cyan">
            CAREER STANDINGS
          </h1>
          <div className="h-0.5 w-48 mx-auto bg-gradient-to-r from-transparent via-primary to-transparent" />
        </div>

        {/* Player Card */}
        <div className="bg-card/80 border-2 border-primary p-6 space-y-6 box-glow-cyan">
          <div className="flex items-center gap-4">
            <div 
              className="w-16 h-16 flex items-center justify-center text-3xl border border-border"
              style={{ backgroundColor: player.carColor + '30' }}
            >
              🏎️
            </div>
            <div>
              <h2 className="font-display text-sm text-foreground">{player.name}</h2>
              <p className="font-body text-xs text-muted-foreground">{player.nationality}</p>
              {player.isLegend && (
                <span className="font-display text-[8px] text-accent">★ LEGEND</span>
              )}
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-4">
            <StatBox label="CHAMPIONSHIPS" value={player.stats.championships} color="text-accent" />
            <StatBox label="RACE WINS" value={player.stats.wins} color="text-primary" />
            <StatBox label="RACES" value={player.stats.races} color="text-secondary" />
            <StatBox label="FAME" value={`${player.stats.fame}%`} color="text-neon-green" />
          </div>

          {/* Earnings */}
          <div className="text-center py-4 border-t border-b border-border">
            <p className="font-display text-[10px] text-muted-foreground mb-1">TOTAL EARNINGS</p>
            <p className="font-display text-2xl text-accent text-glow-yellow">
              ${player.stats.money.toLocaleString()}
            </p>
          </div>

          {/* Performance Bars */}
          <div className="space-y-2">
            <PerformanceBar label="SPEED" value={player.stats.speed} color="bg-neon-cyan" />
            <PerformanceBar label="HANDLING" value={player.stats.handling} color="bg-neon-pink" />
            <PerformanceBar label="ACCELERATION" value={player.stats.acceleration} color="bg-neon-yellow" />
          </div>
        </div>

        {/* Unlock notification */}
        {canUnlock && (
          <div className="bg-accent/20 border border-accent p-4 text-center space-y-3">
            <p className="font-display text-[10px] text-accent">
              🎉 NEW TRACK AVAILABLE!
            </p>
            <p className="font-body text-xs text-foreground">
              {lockedTracks[0].name} - {lockedTracks[0].country}
            </p>
            <button onClick={handleUnlock} className="arcade-button text-[8px] py-2 px-4">
              UNLOCK
            </button>
          </div>
        )}

        {/* Fame milestone */}
        {player.stats.fame >= 80 && (
          <div className="bg-secondary/20 border border-secondary p-4 text-center">
            <p className="font-display text-[10px] text-secondary text-glow-pink">
              ⭐ LEGENDARY STATUS ACHIEVED ⭐
            </p>
            <p className="font-body text-[10px] text-muted-foreground mt-2">
              You can now retire as a racing legend!
            </p>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-4">
          <button
            onClick={() => setScreen('world-tour')}
            className="flex-1 arcade-button text-xs"
          >
            CONTINUE RACING
          </button>
        </div>
      </div>
    </div>
  );
};

const StatBox: React.FC<{ label: string; value: string | number; color: string }> = ({ 
  label, value, color 
}) => (
  <div className="text-center p-3 bg-muted/50 border border-border">
    <p className={`font-display text-xl ${color}`}>{value}</p>
    <p className="font-display text-[6px] text-muted-foreground">{label}</p>
  </div>
);

const PerformanceBar: React.FC<{ label: string; value: number; color: string }> = ({ 
  label, value, color 
}) => (
  <div className="flex items-center gap-3">
    <span className="font-display text-[8px] text-muted-foreground w-20">{label}</span>
    <div className="flex-1 h-3 bg-muted overflow-hidden border border-border/50">
      <div className={`h-full ${color}`} style={{ width: `${value}%` }} />
    </div>
    <span className="font-display text-[10px] text-foreground w-8">{value}</span>
  </div>
);

export default Standings;
