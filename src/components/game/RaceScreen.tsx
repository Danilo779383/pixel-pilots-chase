import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useGame } from '@/context/GameContext';

const RaceScreen: React.FC = () => {
  const { gameState, endRace } = useGame();
  const { player, currentTrack } = gameState;
  
  const [playerX, setPlayerX] = useState(50);
  const [speed, setSpeed] = useState(0);
  const [distance, setDistance] = useState(0);
  const [position, setPosition] = useState(4);
  const [raceTime, setRaceTime] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const [roadOffset, setRoadOffset] = useState(0);
  
  const keysPressed = useRef<Set<string>>(new Set());
  const gameLoop = useRef<number>();

  const trackLength = currentTrack ? currentTrack.length * 1000 : 5000; // meters

  // Handle keyboard input
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      keysPressed.current.add(e.key.toLowerCase());
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      keysPressed.current.delete(e.key.toLowerCase());
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // Game loop
  useEffect(() => {
    if (isFinished || !player) return;

    const maxSpeed = 200 + (player.stats.speed * 2);
    const acceleration = 0.5 + (player.stats.acceleration * 0.02);
    const handling = 0.3 + (player.stats.handling * 0.02);

    const update = () => {
      // Acceleration
      if (keysPressed.current.has('arrowup') || keysPressed.current.has('w')) {
        setSpeed(s => Math.min(s + acceleration, maxSpeed));
      } else {
        setSpeed(s => Math.max(s - 0.3, 0));
      }

      // Braking
      if (keysPressed.current.has('arrowdown') || keysPressed.current.has('s')) {
        setSpeed(s => Math.max(s - 1, 0));
      }

      // Steering
      if (keysPressed.current.has('arrowleft') || keysPressed.current.has('a')) {
        setPlayerX(x => Math.max(x - handling, 10));
      }
      if (keysPressed.current.has('arrowright') || keysPressed.current.has('d')) {
        setPlayerX(x => Math.min(x + handling, 90));
      }

      // Update distance
      setDistance(d => {
        const newDist = d + speed * 0.016; // 60fps
        if (newDist >= trackLength) {
          setIsFinished(true);
          return trackLength;
        }
        return newDist;
      });

      // Update road animation
      setRoadOffset(o => (o + speed * 0.1) % 40);

      // Update race time
      setRaceTime(t => t + 16);

      // Update position based on progress
      const progress = distance / trackLength;
      if (progress > 0.9 && speed > 150) setPosition(1);
      else if (progress > 0.7 && speed > 120) setPosition(2);
      else if (progress > 0.5 && speed > 100) setPosition(3);
      else if (progress > 0.3) setPosition(4);
      else setPosition(5);

      gameLoop.current = requestAnimationFrame(update);
    };

    gameLoop.current = requestAnimationFrame(update);
    
    return () => {
      if (gameLoop.current) cancelAnimationFrame(gameLoop.current);
    };
  }, [isFinished, player, speed, distance, trackLength]);

  const handleFinish = () => {
    const prizes = [50000, 25000, 10000, 5000, 2000];
    const prize = prizes[position - 1] || 1000;
    endRace(position, prize);
  };

  if (!player || !currentTrack) return null;

  const formatTime = (ms: number) => {
    const mins = Math.floor(ms / 60000);
    const secs = Math.floor((ms % 60000) / 1000);
    const millis = Math.floor((ms % 1000) / 10);
    return `${mins}:${secs.toString().padStart(2, '0')}.${millis.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-arcade-dark flex flex-col relative overflow-hidden scanlines">
      {/* Sky gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-blue-900 via-purple-900 to-pink-900 opacity-50" />
      
      {/* HUD */}
      <div className="relative z-20 p-4 flex justify-between items-start">
        <div className="space-y-1">
          <p className="font-display text-[10px] text-muted-foreground">{currentTrack.name}</p>
          <p className="font-display text-2xl text-primary text-glow-cyan">{formatTime(raceTime)}</p>
        </div>
        
        <div className="text-center">
          <p className="font-display text-[10px] text-muted-foreground">POSITION</p>
          <p className="font-display text-3xl text-accent text-glow-yellow">P{position}</p>
        </div>
        
        <div className="text-right space-y-1">
          <p className="font-display text-[10px] text-muted-foreground">SPEED</p>
          <p className="font-display text-2xl text-secondary text-glow-pink">{Math.floor(speed)} km/h</p>
        </div>
      </div>

      {/* Race view */}
      <div className="flex-1 relative flex items-end justify-center overflow-hidden">
        {/* Road */}
        <div className="absolute bottom-0 w-full h-[60%] perspective-[500px]">
          <div 
            className="w-full h-full transform-gpu"
            style={{
              background: `
                linear-gradient(90deg, 
                  #1a1a2e 0%, 
                  #1a1a2e 35%, 
                  #2d2d44 35%,
                  #2d2d44 65%,
                  #1a1a2e 65%,
                  #1a1a2e 100%
                )
              `,
              transform: 'rotateX(60deg) translateY(-50%)',
              transformOrigin: 'bottom center',
            }}
          >
            {/* Road lines */}
            <div 
              className="absolute inset-0"
              style={{
                backgroundImage: `
                  repeating-linear-gradient(
                    0deg,
                    transparent,
                    transparent 15px,
                    #ffd700 15px,
                    #ffd700 25px
                  )
                `,
                backgroundPosition: `0 ${roadOffset}px`,
                opacity: 0.8,
              }}
            />
          </div>
        </div>

        {/* Player car */}
        <div 
          className="absolute bottom-[15%] text-6xl transition-all duration-75"
          style={{ left: `${playerX}%`, transform: 'translateX(-50%)' }}
        >
          <div 
            className="drop-shadow-lg"
            style={{ filter: `drop-shadow(0 0 10px ${player.carColor})` }}
          >
            🏎️
          </div>
        </div>

        {/* Horizon elements */}
        <div className="absolute top-[20%] left-1/4 text-4xl opacity-30">🏔️</div>
        <div className="absolute top-[25%] right-1/4 text-4xl opacity-30">🌴</div>
      </div>

      {/* Progress bar */}
      <div className="relative z-20 p-4">
        <div className="h-3 bg-muted overflow-hidden border border-border">
          <div 
            className="h-full bg-gradient-to-r from-primary via-secondary to-accent transition-all"
            style={{ width: `${(distance / trackLength) * 100}%` }}
          />
        </div>
        <div className="flex justify-between mt-1">
          <span className="font-display text-[8px] text-muted-foreground">START</span>
          <span className="font-display text-[8px] text-foreground">
            {(distance / 1000).toFixed(1)}km / {(trackLength / 1000).toFixed(1)}km
          </span>
          <span className="font-display text-[8px] text-muted-foreground">FINISH</span>
        </div>
      </div>

      {/* Controls hint */}
      <div className="relative z-20 p-4 text-center">
        <p className="font-display text-[8px] text-muted-foreground">
          ↑ ACCELERATE | ↓ BRAKE | ← → STEER
        </p>
      </div>

      {/* Finish modal */}
      {isFinished && (
        <div className="absolute inset-0 z-30 bg-background/90 flex items-center justify-center">
          <div className="text-center space-y-6 p-8 border-2 border-primary bg-card">
            <h2 className="font-display text-2xl text-primary text-glow-cyan">
              RACE COMPLETE!
            </h2>
            <div className="space-y-2">
              <p className="font-display text-4xl text-accent text-glow-yellow">
                P{position}
              </p>
              <p className="font-display text-sm text-foreground">
                {formatTime(raceTime)}
              </p>
              <p className="font-display text-lg text-secondary text-glow-pink">
                +${[50000, 25000, 10000, 5000, 2000][position - 1] || 1000}
              </p>
            </div>
            <button onClick={handleFinish} className="arcade-button">
              CONTINUE
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default RaceScreen;
