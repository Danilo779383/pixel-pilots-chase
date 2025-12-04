import React, { createContext, useContext, useState, useCallback } from 'react';
import { GameState, Racer, Track, Championship, WORLD_TRACKS } from '@/types/game';

interface GameContextType {
  gameState: GameState;
  setScreen: (screen: GameState['currentScreen']) => void;
  setPlayer: (player: Racer) => void;
  selectTrack: (track: Track) => void;
  startRace: () => void;
  endRace: (position: number, prize: number) => void;
  updatePlayerStats: (stats: Partial<Racer['stats']>) => void;
  retirePlayer: () => void;
  tracks: Track[];
  unlockTrack: (trackId: string) => void;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

export const GameProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [tracks, setTracks] = useState<Track[]>(WORLD_TRACKS);
  const [gameState, setGameState] = useState<GameState>({
    currentScreen: 'menu',
    player: null,
    currentChampionship: null,
    currentTrack: null,
    season: 1,
    isRacing: false,
  });

  const setScreen = useCallback((screen: GameState['currentScreen']) => {
    setGameState(prev => ({ ...prev, currentScreen: screen }));
  }, []);

  const setPlayer = useCallback((player: Racer) => {
    setGameState(prev => ({ ...prev, player, currentScreen: 'world-tour' }));
  }, []);

  const selectTrack = useCallback((track: Track) => {
    setGameState(prev => ({ ...prev, currentTrack: track }));
  }, []);

  const startRace = useCallback(() => {
    setGameState(prev => ({ ...prev, isRacing: true, currentScreen: 'race' }));
  }, []);

  const endRace = useCallback((position: number, prize: number) => {
    setGameState(prev => {
      if (!prev.player) return prev;
      
      const wins = position === 1 ? prev.player.stats.wins + 1 : prev.player.stats.wins;
      const fameGain = position === 1 ? 10 : position <= 3 ? 5 : 1;
      
      return {
        ...prev,
        isRacing: false,
        currentScreen: 'standings',
        player: {
          ...prev.player,
          stats: {
            ...prev.player.stats,
            races: prev.player.stats.races + 1,
            wins,
            money: prev.player.stats.money + prize,
            fame: Math.min(100, prev.player.stats.fame + fameGain),
          }
        }
      };
    });
  }, []);

  const updatePlayerStats = useCallback((stats: Partial<Racer['stats']>) => {
    setGameState(prev => {
      if (!prev.player) return prev;
      return {
        ...prev,
        player: {
          ...prev.player,
          stats: { ...prev.player.stats, ...stats }
        }
      };
    });
  }, []);

  const unlockTrack = useCallback((trackId: string) => {
    setTracks(prev => prev.map(t => 
      t.id === trackId ? { ...t, unlocked: true } : t
    ));
  }, []);

  const retirePlayer = useCallback(() => {
    setGameState(prev => ({ ...prev, currentScreen: 'career-end' }));
  }, []);

  return (
    <GameContext.Provider value={{
      gameState,
      setScreen,
      setPlayer,
      selectTrack,
      startRace,
      endRace,
      updatePlayerStats,
      retirePlayer,
      tracks,
      unlockTrack,
    }}>
      {children}
    </GameContext.Provider>
  );
};

export const useGame = () => {
  const context = useContext(GameContext);
  if (!context) throw new Error('useGame must be used within GameProvider');
  return context;
};
