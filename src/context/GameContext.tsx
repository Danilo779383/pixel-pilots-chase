import React, { createContext, useContext, useState, useCallback } from 'react';
import { GameState, Racer, Track, Championship, WORLD_TRACKS, Weather, WeatherCondition, RivalryRecord } from '@/types/game';

const generateRandomWeather = (): Weather => {
  const conditions: WeatherCondition[] = ['clear', 'clear', 'clear', 'rain', 'night', 'storm'];
  const condition = conditions[Math.floor(Math.random() * conditions.length)];
  const intensity = 0.3 + Math.random() * 0.7;
  
  switch (condition) {
    case 'rain':
      return { condition, intensity, handlingModifier: 0.7 - intensity * 0.2, visibilityModifier: 0.8 - intensity * 0.3 };
    case 'night':
      return { condition, intensity, handlingModifier: 0.9, visibilityModifier: 0.5 };
    case 'storm':
      return { condition, intensity, handlingModifier: 0.5, visibilityModifier: 0.4 };
    default:
      return { condition: 'clear', intensity: 0, handlingModifier: 1, visibilityModifier: 1 };
  }
};

interface GameContextType {
  gameState: GameState;
  setScreen: (screen: GameState['currentScreen']) => void;
  setPlayer: (player: Racer) => void;
  selectTrack: (track: Track) => void;
  startRace: () => void;
  endRace: (position: number, prize: number, rivalResult?: { rivalId: string; rivalName: string; playerWon: boolean }) => void;
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
    weather: { condition: 'clear', intensity: 0, handlingModifier: 1, visibilityModifier: 1 },
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
    const weather = generateRandomWeather();
    setGameState(prev => ({ ...prev, isRacing: true, currentScreen: 'race', weather }));
  }, []);

  const endRace = useCallback((position: number, prize: number, rivalResult?: { rivalId: string; rivalName: string; playerWon: boolean }) => {
    setGameState(prev => {
      if (!prev.player) return prev;
      
      const wins = position === 1 ? prev.player.stats.wins + 1 : prev.player.stats.wins;
      const fameGain = position === 1 ? 10 : position <= 3 ? 5 : 1;
      
      // Update rivalry records if there was a rival in the race
      let updatedRivalryRecords = prev.player.stats.rivalryRecords || [];
      if (rivalResult) {
        const existingRecord = updatedRivalryRecords.find(r => r.rivalId === rivalResult.rivalId);
        if (existingRecord) {
          updatedRivalryRecords = updatedRivalryRecords.map(r => 
            r.rivalId === rivalResult.rivalId
              ? {
                  ...r,
                  wins: r.wins + (rivalResult.playerWon ? 1 : 0),
                  losses: r.losses + (rivalResult.playerWon ? 0 : 1),
                  races: r.races + 1
                }
              : r
          );
        } else {
          updatedRivalryRecords = [
            ...updatedRivalryRecords,
            {
              rivalId: rivalResult.rivalId,
              rivalName: rivalResult.rivalName,
              wins: rivalResult.playerWon ? 1 : 0,
              losses: rivalResult.playerWon ? 0 : 1,
              races: 1
            }
          ];
        }
      }
      
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
            rivalryRecords: updatedRivalryRecords,
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
