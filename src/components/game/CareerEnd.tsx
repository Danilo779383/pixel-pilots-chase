import React from 'react';
import { useGame } from '@/context/GameContext';

const CareerEnd: React.FC = () => {
  const { gameState, setScreen } = useGame();
  const { player } = gameState;

  if (!player) return null;

  const getLegacyTitle = () => {
    if (player.stats.championships >= 3) return 'LEGENDARY CHAMPION';
    if (player.stats.wins >= 20) return 'RACING ICON';
    if (player.stats.fame >= 90) return 'FAN FAVORITE';
    if (player.stats.money >= 1000000) return 'RACING MOGUL';
    return 'RACING VETERAN';
  };

  const getLegacyMessage = () => {
    if (player.stats.championships >= 3) {
      return "Your name will echo through the halls of racing history forever. You've achieved what only the greatest have dreamed of.";
    }
    if (player.stats.wins >= 20) {
      return "With over 20 race wins, you've proven yourself to be one of the elite. Future generations will study your technique.";
    }
    if (player.stats.fame >= 90) {
      return "The crowds chanted your name. The fans adored you. You brought joy to millions around the world.";
    }
    return "You gave it your all on every track. Your dedication and passion for racing will inspire others.";
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 retro-grid opacity-10" />
      <div className="absolute inset-0 bg-gradient-to-b from-accent/10 via-transparent to-secondary/10" />
      
      <div className="relative z-10 w-full max-w-2xl space-y-8 text-center">
        {/* Trophy */}
        <div className="text-8xl animate-float">🏆</div>

        {/* Title */}
        <div className="space-y-4">
          <p className="font-display text-[10px] text-muted-foreground tracking-widest">
            RETIREMENT CEREMONY
          </p>
          <h1 className="font-display text-2xl md:text-3xl text-accent text-glow-yellow">
            {getLegacyTitle()}
          </h1>
          <h2 className="font-display text-lg text-foreground">{player.name}</h2>
        </div>

        {/* Legacy message */}
        <p className="font-body text-sm text-muted-foreground max-w-md mx-auto leading-relaxed">
          {getLegacyMessage()}
        </p>

        {/* Career Stats */}
        <div className="bg-card/80 border-2 border-accent p-6 space-y-4">
          <h3 className="font-display text-xs text-primary text-glow-cyan">
            CAREER STATISTICS
          </h3>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 bg-muted/50 border border-border">
              <p className="font-display text-2xl text-accent">{player.stats.championships}</p>
              <p className="font-display text-[6px] text-muted-foreground">CHAMPIONSHIPS</p>
            </div>
            <div className="p-4 bg-muted/50 border border-border">
              <p className="font-display text-2xl text-primary">{player.stats.wins}</p>
              <p className="font-display text-[6px] text-muted-foreground">VICTORIES</p>
            </div>
            <div className="p-4 bg-muted/50 border border-border">
              <p className="font-display text-2xl text-secondary">{player.stats.races}</p>
              <p className="font-display text-[6px] text-muted-foreground">RACES</p>
            </div>
            <div className="p-4 bg-muted/50 border border-border">
              <p className="font-display text-2xl text-neon-green">{player.stats.fame}%</p>
              <p className="font-display text-[6px] text-muted-foreground">FAME</p>
            </div>
          </div>

          <div className="pt-4 border-t border-border">
            <p className="font-display text-[10px] text-muted-foreground mb-2">CAREER EARNINGS</p>
            <p className="font-display text-3xl text-accent text-glow-yellow">
              ${player.stats.money.toLocaleString()}
            </p>
          </div>
        </div>

        {/* Hall of Fame entry */}
        <div className="bg-gradient-to-r from-transparent via-accent/20 to-transparent p-4">
          <p className="font-display text-[8px] text-accent animate-pulse-glow">
            ★ INDUCTED INTO THE RACING HALL OF FAME ★
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
          <button
            onClick={() => setScreen('menu')}
            className="arcade-button"
          >
            NEW GAME
          </button>
          <button
            onClick={() => window.location.reload()}
            className="arcade-button arcade-button-pink"
          >
            MAIN MENU
          </button>
        </div>

        {/* Credits */}
        <div className="pt-8 space-y-2">
          <p className="font-display text-[8px] text-muted-foreground">
            THANK YOU FOR PLAYING
          </p>
          <p className="font-display text-[8px] text-accent">
            TURBO LEGENDS - WORLD CHAMPIONSHIP '94
          </p>
        </div>
      </div>
    </div>
  );
};

export default CareerEnd;
