import React, { useState } from 'react';
import { useGame } from '@/context/GameContext';
import { LEGENDARY_RACERS, Racer } from '@/types/game';

const SelectLegend: React.FC = () => {
  const { setPlayer, setScreen } = useGame();
  const [selected, setSelected] = useState<Racer | null>(null);

  const handleSelect = () => {
    if (selected) {
      setPlayer({ ...selected, stats: { ...selected.stats } });
    }
  };

  return (
    <div className="min-h-screen flex flex-col p-4 relative">
      <div className="absolute inset-0 retro-grid opacity-20" />
      
      <div className="relative z-10 flex-1 flex flex-col max-w-4xl mx-auto w-full">
        {/* Header */}
        <div className="text-center py-6 space-y-2">
          <h1 className="font-display text-xl text-secondary text-glow-pink">
            LEGENDARY RACERS
          </h1>
          <p className="font-display text-[8px] text-muted-foreground">
            RELIVE THE GLORY OF THE 90'S RACING ICONS
          </p>
        </div>

        {/* Racer Grid */}
        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
          {LEGENDARY_RACERS.map(racer => (
            <button
              key={racer.id}
              onClick={() => setSelected(racer)}
              className={`relative p-4 border-2 transition-all text-left ${
                selected?.id === racer.id
                  ? 'border-accent bg-accent/10 box-glow-cyan'
                  : 'border-border bg-card/50 hover:border-primary/50'
              }`}
            >
              {/* Flag indicator */}
              <div 
                className="absolute top-0 right-0 w-12 h-1"
                style={{ backgroundColor: racer.carColor }}
              />
              
              <div className="flex items-start gap-4">
                {/* Avatar */}
                <div 
                  className="w-16 h-16 flex items-center justify-center text-3xl border border-border"
                  style={{ backgroundColor: racer.carColor + '20' }}
                >
                  🏎️
                </div>
                
                {/* Info */}
                <div className="flex-1">
                  <h3 className="font-display text-xs text-foreground mb-1">
                    {racer.name}
                  </h3>
                  <p className="font-body text-[10px] text-muted-foreground mb-3">
                    {racer.nationality}
                  </p>
                  
                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div>
                      <p className="font-display text-sm text-accent">{racer.stats.championships}</p>
                      <p className="font-display text-[6px] text-muted-foreground">TITLES</p>
                    </div>
                    <div>
                      <p className="font-display text-sm text-primary">{racer.stats.wins}</p>
                      <p className="font-display text-[6px] text-muted-foreground">WINS</p>
                    </div>
                    <div>
                      <p className="font-display text-sm text-secondary">{racer.stats.races}</p>
                      <p className="font-display text-[6px] text-muted-foreground">RACES</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Stats bars */}
              <div className="mt-4 space-y-1">
                <StatBar label="SPEED" value={racer.stats.speed} color="bg-neon-cyan" />
                <StatBar label="HANDLING" value={racer.stats.handling} color="bg-neon-pink" />
                <StatBar label="ACCEL" value={racer.stats.acceleration} color="bg-neon-yellow" />
              </div>
            </button>
          ))}
        </div>

        {/* Buttons */}
        <div className="flex gap-4 py-4">
          <button
            onClick={() => setScreen('menu')}
            className="flex-1 arcade-button arcade-button-pink text-xs"
          >
            BACK
          </button>
          <button
            onClick={handleSelect}
            disabled={!selected}
            className="flex-1 arcade-button text-xs disabled:opacity-50 disabled:cursor-not-allowed"
          >
            SELECT LEGEND
          </button>
        </div>
      </div>
    </div>
  );
};

const StatBar: React.FC<{ label: string; value: number; color: string }> = ({ label, value, color }) => (
  <div className="flex items-center gap-2">
    <span className="font-display text-[6px] text-muted-foreground w-12">{label}</span>
    <div className="flex-1 h-2 bg-muted overflow-hidden">
      <div 
        className={`h-full ${color} transition-all`}
        style={{ width: `${value}%` }}
      />
    </div>
    <span className="font-display text-[8px] text-foreground w-6">{value}</span>
  </div>
);

export default SelectLegend;
