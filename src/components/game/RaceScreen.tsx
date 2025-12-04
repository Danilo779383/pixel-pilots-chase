import React, { useState, useEffect, useRef } from 'react';
import { useGame } from '@/context/GameContext';
import { AIOpponent, generateOpponents, updateOpponent, calculatePositions } from '@/utils/aiOpponents';

const RaceScreen: React.FC = () => {
  const { gameState, endRace } = useGame();
  const { player, currentTrack } = gameState;
  
  const [playerX, setPlayerX] = useState(50);
  const [speed, setSpeed] = useState(0);
  const [distance, setDistance] = useState(0);
  const [position, setPosition] = useState(5);
  const [raceTime, setRaceTime] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const [roadOffset, setRoadOffset] = useState(0);
  const [opponents, setOpponents] = useState<AIOpponent[]>([]);
  const [countdown, setCountdown] = useState(3);
  const [raceStarted, setRaceStarted] = useState(false);
  
  const keysPressed = useRef<Set<string>>(new Set());
  const gameLoop = useRef<number>();
  const lastTime = useRef<number>(0);

  const trackLength = currentTrack ? currentTrack.length * 1000 : 5000;

  // Initialize opponents
  useEffect(() => {
    if (currentTrack) {
      setOpponents(generateOpponents(currentTrack.difficulty));
    }
  }, [currentTrack]);

  // Countdown timer
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(c => c - 1), 1000);
      return () => clearTimeout(timer);
    } else if (countdown === 0 && !raceStarted) {
      setRaceStarted(true);
    }
  }, [countdown, raceStarted]);

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
    if (isFinished || !player || !raceStarted) return;

    const maxSpeed = 200 + (player.stats.speed * 2);
    const acceleration = 0.5 + (player.stats.acceleration * 0.02);
    const handling = 0.3 + (player.stats.handling * 0.02);

    const update = (timestamp: number) => {
      const deltaTime = lastTime.current ? (timestamp - lastTime.current) / 1000 : 0.016;
      lastTime.current = timestamp;

      // Player acceleration
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

      // Update player distance
      setDistance(d => {
        const newDist = d + speed * deltaTime;
        if (newDist >= trackLength) {
          setIsFinished(true);
          return trackLength;
        }
        return newDist;
      });

      // Update road animation
      setRoadOffset(o => (o + speed * 0.1) % 40);

      // Update race time
      setRaceTime(t => t + deltaTime * 1000);

      // Update AI opponents
      setOpponents(prevOpponents => {
        const updated = prevOpponents.map(op => 
          updateOpponent(op, deltaTime, maxSpeed, trackLength)
        );
        
        // Check if any AI finished
        const allFinished = updated.every(op => op.distance >= trackLength);
        if (allFinished && distance >= trackLength) {
          setIsFinished(true);
        }

        return updated;
      });

      // Calculate positions
      setOpponents(prevOpponents => {
        const { playerPosition, updatedOpponents } = calculatePositions(distance, prevOpponents);
        setPosition(playerPosition);
        return updatedOpponents;
      });

      gameLoop.current = requestAnimationFrame(update);
    };

    gameLoop.current = requestAnimationFrame(update);
    
    return () => {
      if (gameLoop.current) cancelAnimationFrame(gameLoop.current);
    };
  }, [isFinished, player, speed, distance, trackLength, raceStarted]);

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

  // Calculate visual representation of opponents
  const getOpponentVisuals = () => {
    return opponents.map(op => {
      const distanceDiff = op.distance - distance;
      // Clamp to visible range
      if (distanceDiff < -100 || distanceDiff > 500) return null;
      
      // Calculate visual depth (further = smaller and higher)
      const normalizedDist = Math.max(0, Math.min(1, (distanceDiff + 100) / 600));
      const scale = 0.3 + normalizedDist * 0.7;
      const yPosition = 20 + (1 - normalizedDist) * 35; // % from bottom
      
      return {
        ...op,
        visualScale: scale,
        visualY: yPosition,
        zIndex: Math.floor((1 - normalizedDist) * 100),
      };
    }).filter(Boolean);
  };

  const opponentVisuals = getOpponentVisuals();

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

      {/* Position tracker */}
      <div className="relative z-20 px-4">
        <div className="flex items-center justify-center gap-2 bg-card/50 border border-border p-2">
          {[...opponents, { id: 'player', name: player.name, carColor: player.carColor, position }]
            .sort((a, b) => a.position - b.position)
            .map((racer, idx) => (
              <div 
                key={racer.id}
                className={`flex items-center gap-1 px-2 py-1 text-[8px] font-display ${
                  racer.id === 'player' ? 'bg-primary/20 border border-primary' : 'bg-muted/50'
                }`}
              >
                <span className="text-accent">P{idx + 1}</span>
                <div 
                  className="w-3 h-3 rounded-sm"
                  style={{ backgroundColor: racer.carColor }}
                />
                <span className="text-foreground truncate max-w-16">
                  {racer.id === 'player' ? 'YOU' : racer.name.split(' ')[0]}
                </span>
              </div>
            ))}
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

        {/* AI opponent cars */}
        {opponentVisuals.map(op => op && (
          <div
            key={op.id}
            className="absolute transition-all duration-75"
            style={{
              left: `${op.x}%`,
              bottom: `${op.visualY}%`,
              transform: `translateX(-50%) scale(${op.visualScale})`,
              zIndex: op.zIndex,
              opacity: 0.6 + op.visualScale * 0.4,
            }}
          >
            <div 
              className="text-5xl"
              style={{ 
                filter: `drop-shadow(0 0 8px ${op.carColor})`,
                transform: 'scaleX(-1)',
              }}
            >
              🏎️
            </div>
            <div 
              className="absolute inset-0 flex items-center justify-center pointer-events-none"
              style={{ mixBlendMode: 'overlay' }}
            >
              <div 
                className="w-full h-full opacity-50"
                style={{ backgroundColor: op.carColor }}
              />
            </div>
          </div>
        ))}

        {/* Player car */}
        <div 
          className="absolute bottom-[15%] text-6xl transition-all duration-75 z-50"
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
        <div className="h-3 bg-muted overflow-hidden border border-border relative">
          {/* AI progress markers */}
          {opponents.map(op => (
            <div
              key={op.id}
              className="absolute top-0 h-full w-1 transition-all"
              style={{ 
                left: `${(op.distance / trackLength) * 100}%`,
                backgroundColor: op.carColor,
              }}
            />
          ))}
          {/* Player progress */}
          <div 
            className="absolute top-0 h-full bg-gradient-to-r from-primary via-secondary to-accent transition-all"
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

      {/* Countdown overlay */}
      {countdown > 0 && (
        <div className="absolute inset-0 z-40 bg-background/80 flex items-center justify-center">
          <div className="text-center space-y-4">
            <p className="font-display text-lg text-muted-foreground">GET READY</p>
            <p className="font-display text-8xl text-accent text-glow-yellow animate-pulse">
              {countdown}
            </p>
          </div>
        </div>
      )}

      {/* GO! flash */}
      {countdown === 0 && raceTime < 1000 && (
        <div className="absolute inset-0 z-40 flex items-center justify-center pointer-events-none">
          <p className="font-display text-6xl text-neon-green text-glow-cyan animate-pulse">
            GO!
          </p>
        </div>
      )}

      {/* Finish modal */}
      {isFinished && (
        <div className="absolute inset-0 z-50 bg-background/90 flex items-center justify-center">
          <div className="text-center space-y-6 p-8 border-2 border-primary bg-card max-w-md w-full mx-4">
            <h2 className="font-display text-2xl text-primary text-glow-cyan">
              RACE COMPLETE!
            </h2>
            
            {/* Final standings */}
            <div className="space-y-2">
              {[...opponents, { id: 'player', name: player.name, carColor: player.carColor, position, distance }]
                .sort((a, b) => a.position - b.position)
                .map((racer, idx) => (
                  <div 
                    key={racer.id}
                    className={`flex items-center justify-between p-2 ${
                      racer.id === 'player' 
                        ? 'bg-primary/20 border border-primary' 
                        : 'bg-muted/30'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-display text-sm text-accent w-8">P{idx + 1}</span>
                      <div 
                        className="w-4 h-4 rounded-sm"
                        style={{ backgroundColor: racer.carColor }}
                      />
                      <span className="font-display text-[10px] text-foreground">
                        {racer.id === 'player' ? 'YOU' : racer.name}
                      </span>
                    </div>
                    {racer.id === 'player' && (
                      <span className="font-display text-[10px] text-primary">
                        {formatTime(raceTime)}
                      </span>
                    )}
                  </div>
                ))}
            </div>

            <div className="pt-4 border-t border-border">
              <p className="font-display text-[10px] text-muted-foreground mb-2">PRIZE MONEY</p>
              <p className="font-display text-2xl text-secondary text-glow-pink">
                +${[50000, 25000, 10000, 5000, 2000][position - 1] || 1000}
              </p>
            </div>

            <button onClick={handleFinish} className="arcade-button w-full">
              CONTINUE
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default RaceScreen;
