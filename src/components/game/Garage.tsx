import React, { useEffect, useState } from 'react';
import { useGame } from '@/context/GameContext';
import { startMenuMusic, stopAllMusic } from '@/utils/soundEffects';

interface Upgrade {
  stat: 'speed' | 'handling' | 'acceleration';
  label: string;
  icon: string;
  baseCost: number;
  maxLevel: number;
}

const UPGRADES: Upgrade[] = [
  { stat: 'speed', label: 'TOP SPEED', icon: '⚡', baseCost: 5000, maxLevel: 99 },
  { stat: 'handling', label: 'HANDLING', icon: '🎯', baseCost: 4000, maxLevel: 99 },
  { stat: 'acceleration', label: 'ACCELERATION', icon: '🚀', baseCost: 4500, maxLevel: 99 },
];

const Garage: React.FC = () => {
  const { gameState, setScreen, updatePlayerStats } = useGame();
  const { player } = gameState;
  const [purchaseAnimation, setPurchaseAnimation] = useState<string | null>(null);

  useEffect(() => {
    startMenuMusic();
    return () => stopAllMusic();
  }, []);

  if (!player) return null;

  const calculateUpgradeCost = (upgrade: Upgrade, currentValue: number): number => {
    const level = currentValue - 50; // Base stats start around 50-70
    return Math.floor(upgrade.baseCost * (1 + level * 0.15));
  };

  const handleUpgrade = (upgrade: Upgrade) => {
    const currentValue = player.stats[upgrade.stat];
    if (currentValue >= upgrade.maxLevel) return;

    const cost = calculateUpgradeCost(upgrade, currentValue);
    if (player.stats.money < cost) return;

    setPurchaseAnimation(upgrade.stat);
    setTimeout(() => setPurchaseAnimation(null), 500);

    updatePlayerStats({
      [upgrade.stat]: currentValue + 1,
      money: player.stats.money - cost,
    });
  };

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden">
      <div className="absolute inset-0 retro-grid opacity-10" />
      
      {/* Animated background glow */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />

      <div className="relative z-10 flex-1 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-border bg-card/80 backdrop-blur">
          <div className="max-w-4xl mx-auto flex items-center justify-between">
            <div>
              <h1 className="font-display text-lg text-primary text-glow-cyan">
                GARAGE
              </h1>
              <p className="font-display text-[8px] text-muted-foreground">
                UPGRADE YOUR MACHINE
              </p>
            </div>
            <div className="text-right">
              <p className="font-display text-xl text-accent">${player.stats.money.toLocaleString()}</p>
              <p className="font-display text-[8px] text-muted-foreground">AVAILABLE FUNDS</p>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-4 overflow-y-auto">
          <div className="max-w-4xl mx-auto">
            {/* Car Display */}
            <div className="relative mb-8 p-8 border-2 border-border bg-card/50 backdrop-blur">
              <div className="flex items-center justify-center gap-8">
                {/* Car Visualization */}
                <div className="relative">
                  <div 
                    className="w-40 h-24 rounded-lg shadow-2xl transition-all duration-300"
                    style={{ 
                      backgroundColor: player.carColor,
                      boxShadow: `0 0 40px ${player.carColor}40, 0 20px 40px rgba(0,0,0,0.5)`
                    }}
                  >
                    {/* Car body details */}
                    <div className="absolute top-2 left-4 right-4 h-8 bg-black/30 rounded" />
                    <div className="absolute bottom-0 left-2 w-6 h-6 bg-black rounded-full border-2 border-muted" />
                    <div className="absolute bottom-0 right-2 w-6 h-6 bg-black rounded-full border-2 border-muted" />
                  </div>
                  <p className="font-display text-sm text-center mt-4 text-foreground">{player.name}</p>
                </div>

                {/* Current Stats */}
                <div className="space-y-3">
                  {UPGRADES.map(upgrade => (
                    <div key={upgrade.stat} className="flex items-center gap-3">
                      <span className="text-lg">{upgrade.icon}</span>
                      <div className="w-32">
                        <div className="flex justify-between mb-1">
                          <span className="font-display text-[8px] text-muted-foreground">{upgrade.label}</span>
                          <span className="font-display text-[8px] text-primary">{player.stats[upgrade.stat]}</span>
                        </div>
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <div 
                            className={`h-full transition-all duration-500 ${
                              purchaseAnimation === upgrade.stat ? 'animate-pulse' : ''
                            }`}
                            style={{ 
                              width: `${player.stats[upgrade.stat]}%`,
                              background: `linear-gradient(90deg, hsl(var(--primary)), hsl(var(--accent)))`
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Upgrade Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {UPGRADES.map(upgrade => {
                const currentValue = player.stats[upgrade.stat];
                const cost = calculateUpgradeCost(upgrade, currentValue);
                const canAfford = player.stats.money >= cost;
                const isMaxed = currentValue >= upgrade.maxLevel;

                return (
                  <div 
                    key={upgrade.stat}
                    className={`relative p-6 border-2 transition-all ${
                      isMaxed 
                        ? 'border-accent bg-accent/10' 
                        : canAfford 
                        ? 'border-primary bg-card/50 hover:bg-primary/10 hover:border-primary' 
                        : 'border-muted bg-muted/10 opacity-60'
                    }`}
                  >
                    <div className="text-center mb-4">
                      <span className="text-4xl">{upgrade.icon}</span>
                      <h3 className="font-display text-sm text-foreground mt-2">{upgrade.label}</h3>
                    </div>

                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="font-display text-[8px] text-muted-foreground">CURRENT</span>
                        <span className="font-display text-lg text-primary">{currentValue}</span>
                      </div>

                      <div className="h-3 bg-muted rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-primary to-accent transition-all duration-300"
                          style={{ width: `${currentValue}%` }}
                        />
                      </div>

                      {isMaxed ? (
                        <div className="text-center py-2">
                          <span className="font-display text-sm text-accent">MAXED OUT</span>
                        </div>
                      ) : (
                        <>
                          <div className="flex justify-between items-center">
                            <span className="font-display text-[8px] text-muted-foreground">UPGRADE COST</span>
                            <span className={`font-display text-sm ${canAfford ? 'text-accent' : 'text-destructive'}`}>
                              ${cost.toLocaleString()}
                            </span>
                          </div>

                          <button
                            onClick={() => handleUpgrade(upgrade)}
                            disabled={!canAfford}
                            className={`w-full py-3 font-display text-[10px] transition-all ${
                              canAfford 
                                ? 'arcade-button' 
                                : 'bg-muted text-muted-foreground cursor-not-allowed'
                            }`}
                          >
                            {canAfford ? '+1 UPGRADE' : 'NEED MORE FUNDS'}
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-border bg-card/80 backdrop-blur">
          <div className="max-w-4xl mx-auto flex justify-center">
            <button
              onClick={() => setScreen('world-tour')}
              className="arcade-button text-xs px-8"
            >
              BACK TO WORLD TOUR
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Garage;
