import React from 'react';
import { useGame } from '@/context/GameContext';

const MainMenu: React.FC = () => {
  const { setScreen } = useGame();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden">
      {/* Background grid */}
      <div className="absolute inset-0 retro-grid opacity-30" />
      
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/50 to-background" />
      
      {/* Content */}
      <div className="relative z-10 text-center space-y-12">
        {/* Title */}
        <div className="space-y-4">
          <h1 className="font-display text-2xl md:text-4xl text-primary text-glow-cyan animate-pulse-glow">
            TURBO LEGENDS
          </h1>
          <p className="font-display text-xs md:text-sm text-secondary text-glow-pink">
            WORLD CHAMPIONSHIP '94
          </p>
          <div className="h-1 w-64 mx-auto bg-gradient-to-r from-transparent via-primary to-transparent" />
        </div>

        {/* Animated car silhouette */}
        <div className="text-6xl animate-float">🏎️</div>

        {/* Menu buttons */}
        <div className="space-y-4">
          <button
            onClick={() => setScreen('create-racer')}
            className="arcade-button block w-72 mx-auto"
          >
            NEW CAREER
          </button>
          
          <button
            onClick={() => setScreen('select-racer')}
            className="arcade-button arcade-button-pink block w-72 mx-auto"
          >
            PLAY AS LEGEND
          </button>
        </div>

        {/* Footer */}
        <div className="pt-8 space-y-2">
          <p className="font-display text-[8px] text-muted-foreground">
            INSERT COIN TO CONTINUE
          </p>
          <p className="font-display text-[8px] text-accent animate-flicker">
            © 1994 TURBO GAMES INC.
          </p>
        </div>
      </div>

      {/* Decorative corner elements */}
      <div className="absolute top-4 left-4 w-8 h-8 border-l-2 border-t-2 border-primary opacity-50" />
      <div className="absolute top-4 right-4 w-8 h-8 border-r-2 border-t-2 border-primary opacity-50" />
      <div className="absolute bottom-4 left-4 w-8 h-8 border-l-2 border-b-2 border-primary opacity-50" />
      <div className="absolute bottom-4 right-4 w-8 h-8 border-r-2 border-b-2 border-primary opacity-50" />
    </div>
  );
};

export default MainMenu;
