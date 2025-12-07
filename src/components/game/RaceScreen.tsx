import React, { useState, useEffect, useRef } from 'react';
import { useGame } from '@/context/GameContext';
import { 
  AIOpponent, 
  generateOpponents, 
  updateOpponent, 
  calculatePositions,
  checkCollision,
  applyCollisionToOpponent,
  CollisionResult
} from '@/utils/aiOpponents';
import {
  startEngineSound,
  updateEngineSound,
  stopEngineSound,
  playCollisionSound,
  playCountdownBeep,
  playVictorySound,
  playLoseSound,
  cleanupAudio,
  startRaceMusic,
  stopAllMusic,
  startTireScreech,
  stopTireScreech
} from '@/utils/soundEffects';
import WeatherEffects from './WeatherEffects';

const RaceScreen: React.FC = () => {
  const { gameState, endRace } = useGame();
  const { player, currentTrack, weather } = gameState;
  
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
  const [collision, setCollision] = useState<CollisionResult | null>(null);
  const [screenShake, setScreenShake] = useState({ x: 0, y: 0 });
  const [collisionFlash, setCollisionFlash] = useState(false);
  const [handlingPenalty, setHandlingPenalty] = useState(0);
  
  // Lap-based race mechanics
  const [currentLap, setCurrentLap] = useState(1);
  const TOTAL_LAPS = 3;
  const lapLength = currentTrack ? currentTrack.length * 1000 : 5000;
  const totalRaceDistance = lapLength * TOTAL_LAPS;
  
  // Pit zones per lap (at 25-30% and 70-75% of each lap)
  const PIT_ZONES = [
    { start: 0.25, end: 0.30 }, // First pit zone
    { start: 0.70, end: 0.75 }, // Second pit zone
  ];
  const PIT_DURATION = 3000; // 3 seconds
  
  // Pit stop mechanics
  const [fuel, setFuel] = useState(100);
  const [tireWear, setTireWear] = useState(100);
  const [isPitting, setIsPitting] = useState(false);
  const [pitProgress, setPitProgress] = useState(0);
  const [canPit, setCanPit] = useState(false);
  const [currentPitZone, setCurrentPitZone] = useState<number | null>(null);

  // Lap time tracking
  const [lapTimes, setLapTimes] = useState<number[]>([]);
  const [currentLapTime, setCurrentLapTime] = useState(0);
  const [bestLapTime, setBestLapTime] = useState<number | null>(null);
  const [lastLapTime, setLastLapTime] = useState<number | null>(null);
  const [showLapComplete, setShowLapComplete] = useState(false);
  const lapStartTime = useRef<number>(0);

  // Strategy advisor state
  const [strategyMessage, setStrategyMessage] = useState<{ text: string; urgency: 'info' | 'warn' | 'critical' } | null>(null);
  const lastStrategyUpdate = useRef<number>(0);

  // Calculate lap progress
  const getLapProgress = () => {
    const distanceInCurrentLap = distance % lapLength;
    return distanceInCurrentLap / lapLength;
  };

  // Check if in any pit zone
  const checkPitZone = (progress: number) => {
    for (let i = 0; i < PIT_ZONES.length; i++) {
      if (progress >= PIT_ZONES[i].start && progress <= PIT_ZONES[i].end) {
        return i;
      }
    }
    return null;
  };

  // Get nearest upcoming pit zone
  const getNextPitZone = (progress: number) => {
    for (let i = 0; i < PIT_ZONES.length; i++) {
      if (progress < PIT_ZONES[i].start) {
        return { zone: i, distance: PIT_ZONES[i].start - progress };
      }
    }
    // Next lap's first pit zone
    return { zone: 0, distance: (1 - progress) + PIT_ZONES[0].start };
  };

  // Strategy advisor logic
  useEffect(() => {
    if (!raceStarted || isFinished || isPitting) {
      setStrategyMessage(null);
      return;
    }

    const now = Date.now();
    if (now - lastStrategyUpdate.current < 2000) return;
    lastStrategyUpdate.current = now;

    const lapProgress = getLapProgress();
    const raceProgress = distance / totalRaceDistance;
    const lapsRemaining = TOTAL_LAPS - currentLap + (1 - lapProgress);
    const nextPit = getNextPitZone(lapProgress);
    const inPitZone = checkPitZone(lapProgress) !== null;
    const nearPitZone = nextPit.distance < 0.1;

    // Estimate resources needed
    const estimatedFuelPerLap = 35;
    const estimatedTirePerLap = 30;
    const fuelNeeded = lapsRemaining * estimatedFuelPerLap;
    const tiresNeeded = lapsRemaining * estimatedTirePerLap;

    let message: { text: string; urgency: 'info' | 'warn' | 'critical' } | null = null;

    // Critical warnings
    if (fuel < 10) {
      message = { text: `⚠️ CRITICAL: Fuel empty! PIT NOW! Lap ${currentLap}/${TOTAL_LAPS}`, urgency: 'critical' };
    } else if (tireWear < 15) {
      message = { text: `⚠️ CRITICAL: Tires destroyed! PIT NOW! Lap ${currentLap}/${TOTAL_LAPS}`, urgency: 'critical' };
    }
    // In pit zone recommendations
    else if (inPitZone) {
      if (fuel < 40 || tireWear < 45) {
        message = { text: `📻 Engineer: Good window to pit - Lap ${currentLap}/${TOTAL_LAPS}`, urgency: 'warn' };
      } else if (fuel > 70 && tireWear > 70 && currentLap < TOTAL_LAPS) {
        message = { text: `📻 Engineer: Resources good - skip this stop`, urgency: 'info' };
      } else if (currentLap === TOTAL_LAPS && raceProgress > 0.8) {
        message = { text: `📻 Engineer: Final lap! Push to the finish!`, urgency: 'info' };
      }
    }
    // Approaching pit zone
    else if (nearPitZone) {
      if (fuel < fuelNeeded || tireWear < tiresNeeded) {
        message = { text: `📻 Engineer: Pit zone ahead - recommend stopping`, urgency: 'warn' };
      }
    }
    // General advice
    else if (fuel < 25) {
      message = { text: `📻 Engineer: Fuel low - next pit zone at ${Math.round(nextPit.distance * 100)}%`, urgency: 'warn' };
    } else if (tireWear < 30) {
      message = { text: `📻 Engineer: Tires worn - next pit in ${Math.round(nextPit.distance * 100)}% of lap`, urgency: 'warn' };
    }
    // Lap-based strategy
    else if (currentLap === TOTAL_LAPS && lapProgress > 0.5) {
      message = { text: `📻 Engineer: FINAL LAP! ${position === 1 ? 'Hold position!' : 'Push hard!'}`, urgency: 'info' };
    } else if (position === 1 && lapProgress > 0.5) {
      message = { text: `📻 Engineer: P1! Manage gap - Lap ${currentLap}/${TOTAL_LAPS}`, urgency: 'info' };
    }

    setStrategyMessage(message);
  }, [distance, fuel, tireWear, raceStarted, isFinished, isPitting, speed, position, currentLap, lapLength, totalRaceDistance]);
  
  const keysPressed = useRef<Set<string>>(new Set());
  const gameLoop = useRef<number>();
  const lastTime = useRef<number>(0);
  const collisionCooldown = useRef<number>(0);

  // Initialize opponents
  useEffect(() => {
    if (currentTrack) {
      setOpponents(generateOpponents(currentTrack.difficulty));
    }
  }, [currentTrack]);

  // Countdown timer with sound
  useEffect(() => {
    if (countdown > 0) {
      playCountdownBeep(false);
      const timer = setTimeout(() => setCountdown(c => c - 1), 1000);
      return () => clearTimeout(timer);
    } else if (countdown === 0 && !raceStarted) {
      playCountdownBeep(true); // GO! sound
      startEngineSound(0);
      startRaceMusic();
      setRaceStarted(true);
    }
  }, [countdown, raceStarted]);

  // Update engine sound based on speed
  useEffect(() => {
    if (raceStarted && !isFinished) {
      updateEngineSound(speed);
    }
  }, [speed, raceStarted, isFinished]);

  // Cleanup audio on unmount
  useEffect(() => {
    return () => {
      cleanupAudio();
    };
  }, []);

  // Play victory or lose sound when race finishes
  useEffect(() => {
    if (isFinished) {
      stopAllMusic();
      if (position === 1) {
        playVictorySound();
      } else if (position > 3) {
        playLoseSound();
      } else {
        // 2nd or 3rd place - mild victory
        playVictorySound();
      }
    }
  }, [isFinished, position]);

  // Handle keyboard input
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      keysPressed.current.add(e.key.toLowerCase());
      // Spacebar for pit stop
      if (e.key === ' ' && canPit && !isPitting) {
        setIsPitting(true);
        setPitProgress(0);
        setSpeed(0);
      }
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
  }, [canPit, isPitting]);

  // Game loop
  useEffect(() => {
    if (isFinished || !player || !raceStarted) return;

    // Handle pit stop
    if (isPitting) {
      const pitTimer = setInterval(() => {
        setPitProgress(p => {
          if (p >= 100) {
            setIsPitting(false);
            setFuel(100);
            setTireWear(100);
            clearInterval(pitTimer);
            return 0;
          }
          return p + (100 / (PIT_DURATION / 100));
        });
      }, 100);
      return () => clearInterval(pitTimer);
    }

    const maxSpeed = 200 + (player.stats.speed * 2);
    const baseAcceleration = 0.5 + (player.stats.acceleration * 0.02);
    const baseHandling = (0.3 + (player.stats.handling * 0.02)) * weather.handlingModifier;

    const update = (timestamp: number) => {
      const deltaTime = lastTime.current ? (timestamp - lastTime.current) / 1000 : 0.016;
      lastTime.current = timestamp;

      // Reduce collision cooldown
      collisionCooldown.current = Math.max(0, collisionCooldown.current - deltaTime);
      
      // Reduce handling penalty over time
      setHandlingPenalty(p => Math.max(0, p - deltaTime * 2));

      // Fuel and tire degradation
      const fuelConsumption = deltaTime * 1.5 * (speed / 200);
      const tireDegradation = deltaTime * 1.2 * (speed / 200) * (1 + Math.abs(playerX - 50) / 100);
      setFuel(f => Math.max(0, f - fuelConsumption));
      setTireWear(t => Math.max(0, t - tireDegradation));

      // Check lap progress and pit zones
      const lapProgress = getLapProgress();
      const pitZoneIndex = checkPitZone(lapProgress);
      setCurrentPitZone(pitZoneIndex);
      setCanPit(pitZoneIndex !== null && speed < 50);

      // Update current lap
      // Update current lap and lap times
      const newLap = Math.floor(distance / lapLength) + 1;
      if (newLap !== currentLap && newLap <= TOTAL_LAPS) {
        // Lap completed - record lap time
        const completedLapTime = raceTime - lapStartTime.current;
        setLapTimes(prev => [...prev, completedLapTime]);
        setLastLapTime(completedLapTime);
        
        // Check for best lap
        if (bestLapTime === null || completedLapTime < bestLapTime) {
          setBestLapTime(completedLapTime);
        }
        
        // Show lap complete notification
        setShowLapComplete(true);
        setTimeout(() => setShowLapComplete(false), 2000);
        
        // Reset lap timer
        lapStartTime.current = raceTime;
        setCurrentLap(newLap);
      }
      
      // Update current lap time
      setCurrentLapTime(raceTime - lapStartTime.current);

      // Apply fuel and tire penalties
      const fuelPenalty = fuel < 20 ? 1 - ((20 - fuel) / 20) * 0.5 : 1;
      const tirePenalty = tireWear < 30 ? 1 - ((30 - tireWear) / 30) * 0.4 : 1;

      // Apply collision effects to acceleration and handling
      const acceleration = baseAcceleration * (collision?.isColliding ? 0.3 : 1) * fuelPenalty;
      const handling = baseHandling * (1 - handlingPenalty * 0.5) * tirePenalty;

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

      // Steering with collision push effect
      let steeringInput = 0;
      const isTurningLeft = keysPressed.current.has('arrowleft') || keysPressed.current.has('a');
      const isTurningRight = keysPressed.current.has('arrowright') || keysPressed.current.has('d');
      
      if (isTurningLeft) {
        steeringInput -= handling;
      }
      if (isTurningRight) {
        steeringInput += handling;
      }
      
      // Tire screech when turning sharply at high speed
      const isTurning = isTurningLeft || isTurningRight;
      const highSpeed = speed > 100;
      if (isTurning && highSpeed) {
        const intensity = Math.min(1, (speed - 100) / 100) * Math.abs(steeringInput) * 2;
        startTireScreech(intensity);
      } else {
        stopTireScreech();
      }
      
      // Apply collision push
      if (collision?.isColliding && collision.impactDirection) {
        const pushForce = collision.impactSeverity * 3;
        if (collision.impactDirection === 'left') {
          steeringInput += pushForce;
        } else if (collision.impactDirection === 'right') {
          steeringInput -= pushForce;
        }
      }
      
      setPlayerX(x => Math.max(10, Math.min(90, x + steeringInput)));

      // Update player distance
      setDistance(d => {
        const speedPenalty = collision?.isColliding ? (1 - collision.impactSeverity * 0.5) : 1;
        const newDist = d + speed * speedPenalty * deltaTime;
        if (newDist >= totalRaceDistance) {
          setIsFinished(true);
          stopEngineSound();
          return totalRaceDistance;
        }
        return newDist;
      });

      // Update road animation
      setRoadOffset(o => (o + speed * 0.1) % 40);

      // Update race time
      setRaceTime(t => t + deltaTime * 1000);

      // Check collisions
      if (collisionCooldown.current <= 0) {
        const collisionResult = checkCollision(playerX, distance, opponents);
        setCollision(collisionResult);
        
        if (collisionResult.isColliding && collisionResult.opponentId) {
          // Apply collision effects
          collisionCooldown.current = 0.3; // Cooldown to prevent spam
          setHandlingPenalty(p => Math.min(1, p + collisionResult.impactSeverity * 0.5));
          playCollisionSound();
          
          // Screen shake
          setScreenShake({
            x: (Math.random() - 0.5) * 10 * collisionResult.impactSeverity,
            y: (Math.random() - 0.5) * 5 * collisionResult.impactSeverity,
          });
          
          // Flash effect
          setCollisionFlash(true);
          setTimeout(() => setCollisionFlash(false), 100);
          
          // Speed penalty on collision
          setSpeed(s => Math.max(0, s - 30 * collisionResult.impactSeverity));
          
          // Push opponent
          setOpponents(prevOpponents => 
            prevOpponents.map(op => 
              op.id === collisionResult.opponentId 
                ? applyCollisionToOpponent(op, playerX, collisionResult.impactSeverity)
                : op
            )
          );
        }
      } else {
        // Clear screen shake
        setScreenShake({ x: 0, y: 0 });
      }

      // Update AI opponents
      setOpponents(prevOpponents => {
        const updated = prevOpponents.map(op => 
          updateOpponent(op, deltaTime, maxSpeed, totalRaceDistance)
        );
        
        const allFinished = updated.every(op => op.distance >= totalRaceDistance);
        if (allFinished && distance >= totalRaceDistance) {
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
  }, [isFinished, player, speed, distance, lapLength, totalRaceDistance, raceStarted, playerX, opponents, collision, handlingPenalty, isPitting, fuel, tireWear, currentLap]);

  const handlePitStop = () => {
    if (canPit && !isPitting) {
      setIsPitting(true);
      setPitProgress(0);
      setSpeed(0);
    }
  };

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

  const getOpponentVisuals = () => {
    return opponents.map(op => {
      const distanceDiff = op.distance - distance;
      if (distanceDiff < -100 || distanceDiff > 500) return null;
      
      const normalizedDist = Math.max(0, Math.min(1, (distanceDiff + 100) / 600));
      const scale = 0.3 + normalizedDist * 0.7;
      const yPosition = 20 + (1 - normalizedDist) * 35;
      
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
    <div 
      className="min-h-screen bg-arcade-dark flex flex-col relative overflow-hidden scanlines"
      style={{
        transform: `translate(${screenShake.x}px, ${screenShake.y}px)`,
        transition: 'transform 0.05s',
      }}
    >
      {/* Collision flash overlay */}
      {collisionFlash && (
        <div className="absolute inset-0 z-30 bg-destructive/30 pointer-events-none" />
      )}

      {/* Weather effects */}
      <WeatherEffects weather={weather} speed={speed} />
      
      {/* Sky gradient - adjusted for weather */}
      <div 
        className="absolute inset-0 opacity-50 transition-all duration-1000"
        style={{
          background: weather.condition === 'night' || weather.condition === 'storm'
            ? 'linear-gradient(to bottom, #0a0a1a 0%, #1a1a3a 50%, #2a2a4a 100%)'
            : 'linear-gradient(to bottom, #1e3a5f 0%, #4a2060 50%, #8b3060 100%)'
        }}
      />
      
      {/* HUD */}
      <div className="relative z-20 p-4 flex justify-between items-start">
        <div className="space-y-1">
          <p className="font-display text-[10px] text-muted-foreground">{currentTrack.name}</p>
          <p className="font-display text-2xl text-primary text-glow-cyan">{formatTime(raceTime)}</p>
          {/* Weather indicator */}
          {weather.condition !== 'clear' && (
            <div className={`flex items-center gap-1 px-2 py-0.5 text-[8px] font-display ${
              weather.condition === 'rain' ? 'bg-blue-500/20 text-blue-300' :
              weather.condition === 'night' ? 'bg-indigo-500/20 text-indigo-300' :
              'bg-purple-500/20 text-purple-300'
            }`}>
              <span>
                {weather.condition === 'rain' && '🌧️'}
                {weather.condition === 'night' && '🌙'}
                {weather.condition === 'storm' && '⛈️'}
              </span>
              <span className="uppercase">{weather.condition}</span>
              <span className="text-destructive">-{Math.round((1 - weather.handlingModifier) * 100)}% GRIP</span>
            </div>
          )}
        </div>
        
        <div className="text-center">
          <p className="font-display text-[10px] text-muted-foreground">LAP</p>
          <p className="font-display text-2xl text-accent text-glow-yellow">{currentLap}/{TOTAL_LAPS}</p>
        </div>
        
        <div className="text-center">
          <p className="font-display text-[10px] text-muted-foreground">POSITION</p>
          <p className="font-display text-3xl text-accent text-glow-yellow">P{position}</p>
        </div>
        
        <div className="text-right space-y-1">
          <p className="font-display text-[10px] text-muted-foreground">SPEED</p>
          <p className={`font-display text-2xl text-glow-pink ${collision?.isColliding ? 'text-destructive' : 'text-secondary'}`}>
            {Math.floor(speed)} km/h
          </p>
        </div>
      </div>

      {/* Lap Time Display */}
      <div className="relative z-20 px-4 flex justify-center gap-6">
        <div className="bg-card/60 border border-border px-3 py-1 text-center">
          <p className="font-display text-[8px] text-muted-foreground">CURRENT LAP</p>
          <p className="font-display text-lg text-foreground">{formatTime(currentLapTime)}</p>
        </div>
        {bestLapTime !== null && (
          <div className="bg-primary/20 border border-primary px-3 py-1 text-center">
            <p className="font-display text-[8px] text-primary">BEST LAP</p>
            <p className="font-display text-lg text-primary text-glow-cyan">{formatTime(bestLapTime)}</p>
          </div>
        )}
        {lastLapTime !== null && (
          <div className={`border px-3 py-1 text-center ${
            bestLapTime !== null && lastLapTime === bestLapTime 
              ? 'bg-neon-green/20 border-neon-green' 
              : 'bg-muted/50 border-border'
          }`}>
            <p className="font-display text-[8px] text-muted-foreground">LAST LAP</p>
            <p className={`font-display text-lg ${
              bestLapTime !== null && lastLapTime === bestLapTime 
                ? 'text-neon-green' 
                : 'text-foreground'
            }`}>
              {formatTime(lastLapTime)}
              {bestLapTime !== null && lastLapTime === bestLapTime && ' ⚡'}
            </p>
          </div>
        )}
      </div>

      {/* Lap Complete Notification */}
      {showLapComplete && lastLapTime !== null && (
        <div className="absolute top-1/3 left-1/2 transform -translate-x-1/2 z-30 pointer-events-none">
          <div className={`px-6 py-3 border-2 ${
            bestLapTime !== null && lastLapTime === bestLapTime
              ? 'bg-neon-green/30 border-neon-green'
              : 'bg-accent/30 border-accent'
          }`}>
            <p className="font-display text-xs text-muted-foreground text-center">LAP {currentLap - 1} COMPLETE</p>
            <p className={`font-display text-2xl text-center ${
              bestLapTime !== null && lastLapTime === bestLapTime
                ? 'text-neon-green text-glow-cyan animate-pulse'
                : 'text-accent text-glow-yellow'
            }`}>
              {formatTime(lastLapTime)}
              {bestLapTime !== null && lastLapTime === bestLapTime && ' BEST!'}
            </p>
          </div>
        </div>
      )}

      {/* Strategy Advisor */}
      {strategyMessage && raceStarted && !isFinished && !isPitting && (
        <div className="relative z-20 px-4 mt-2">
          <div className={`mx-auto max-w-lg px-4 py-2 border-l-4 transition-all ${
            strategyMessage.urgency === 'critical' 
              ? 'bg-destructive/20 border-destructive animate-pulse' 
              : strategyMessage.urgency === 'warn'
              ? 'bg-yellow-500/20 border-yellow-500'
              : 'bg-primary/10 border-primary/50'
          }`}>
            <p className={`font-display text-[10px] ${
              strategyMessage.urgency === 'critical' 
                ? 'text-destructive' 
                : strategyMessage.urgency === 'warn'
                ? 'text-yellow-400'
                : 'text-primary'
            }`}>
              {strategyMessage.text}
            </p>
          </div>
        </div>
      )}

      {/* Fuel and Tire indicators */}
      <div className="relative z-20 px-4 flex justify-center gap-6">
        <div className="flex items-center gap-2">
          <span className="text-lg">⛽</span>
          <div className="w-24">
            <div className="flex justify-between mb-0.5">
              <span className="font-display text-[8px] text-muted-foreground">FUEL</span>
              <span className={`font-display text-[8px] ${fuel < 20 ? 'text-destructive animate-pulse' : 'text-foreground'}`}>
                {Math.floor(fuel)}%
              </span>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden border border-border">
              <div 
                className={`h-full transition-all ${fuel < 20 ? 'bg-destructive' : fuel < 40 ? 'bg-yellow-500' : 'bg-accent'}`}
                style={{ width: `${fuel}%` }}
              />
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-lg">🛞</span>
          <div className="w-24">
            <div className="flex justify-between mb-0.5">
              <span className="font-display text-[8px] text-muted-foreground">TIRES</span>
              <span className={`font-display text-[8px] ${tireWear < 30 ? 'text-destructive animate-pulse' : 'text-foreground'}`}>
                {Math.floor(tireWear)}%
              </span>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden border border-border">
              <div 
                className={`h-full transition-all ${tireWear < 30 ? 'bg-destructive' : tireWear < 50 ? 'bg-yellow-500' : 'bg-primary'}`}
                style={{ width: `${tireWear}%` }}
              />
            </div>
          </div>
        </div>
        {/* Pit button */}
        {canPit && !isPitting && (
          <button
            onClick={handlePitStop}
            className="arcade-button text-[8px] py-1 px-3 animate-pulse bg-accent/20 border-accent"
          >
            🔧 PIT STOP [SPACE]
          </button>
        )}
      </div>

      {/* Pit zone indicator */}
      {(() => {
        const lapProgress = getLapProgress();
        const nextPit = getNextPitZone(lapProgress);
        const inPitZone = currentPitZone !== null;
        const nearPitZone = nextPit.distance < 0.08;
        
        if ((nearPitZone || inPitZone) && !isPitting) {
          return (
            <div className={`relative z-20 text-center mt-2 ${inPitZone ? 'animate-pulse' : ''}`}>
              <span className={`font-display text-[10px] px-3 py-1 ${
                inPitZone 
                  ? 'bg-accent/30 text-accent border border-accent' 
                  : 'bg-muted/50 text-muted-foreground'
              }`}>
                {inPitZone 
                  ? speed < 50 
                    ? '🔧 PRESS SPACE TO PIT' 
                    : '🔧 PIT ZONE - SLOW DOWN!'
                  : `→ PIT ZONE ${currentPitZone !== null ? currentPitZone + 1 : nextPit.zone + 1} AHEAD`
                }
              </span>
            </div>
          );
        }
        return null;
      })()}

      {/* Handling indicator */}
      {handlingPenalty > 0 && (
        <div className="absolute top-20 left-1/2 transform -translate-x-1/2 z-20">
          <div className="flex items-center gap-2 bg-destructive/20 border border-destructive px-3 py-1">
            <span className="font-display text-[8px] text-destructive">⚠ HANDLING DAMAGED</span>
            <div className="w-16 h-2 bg-muted overflow-hidden">
              <div 
                className="h-full bg-destructive transition-all"
                style={{ width: `${handlingPenalty * 100}%` }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Position tracker */}
      <div className="relative z-20 px-4">
        <div className="flex items-center justify-center gap-2 bg-card/50 border border-border p-2">
          {[...opponents, { id: 'player', name: player.name, carColor: player.carColor, position, isColliding: collision?.isColliding }]
            .sort((a, b) => a.position - b.position)
            .map((racer, idx) => (
              <div 
                key={racer.id}
                className={`flex items-center gap-1 px-2 py-1 text-[8px] font-display transition-all ${
                  racer.id === 'player' 
                    ? racer.isColliding 
                      ? 'bg-destructive/20 border border-destructive animate-pulse' 
                      : 'bg-primary/20 border border-primary'
                    : racer.isColliding 
                      ? 'bg-destructive/10 border border-destructive/50'
                      : 'bg-muted/50'
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
            className={`absolute transition-all duration-75 ${op.isColliding ? 'animate-pulse' : ''}`}
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
                filter: `drop-shadow(0 0 8px ${op.isColliding ? '#ff0000' : op.carColor})`,
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
            {/* Collision spark effect */}
            {op.isColliding && (
              <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 text-2xl animate-ping">
                💥
              </div>
            )}
          </div>
        ))}

        {/* Player car */}
        <div 
          className={`absolute bottom-[15%] text-6xl transition-all duration-75 z-50 ${collision?.isColliding ? 'animate-pulse' : ''}`}
          style={{ left: `${playerX}%`, transform: 'translateX(-50%)' }}
        >
          <div 
            className="drop-shadow-lg"
            style={{ filter: `drop-shadow(0 0 10px ${collision?.isColliding ? '#ff0000' : player.carColor})` }}
          >
            🏎️
          </div>
          {/* Player collision spark */}
          {collision?.isColliding && (
            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 text-3xl animate-ping">
              💥
            </div>
          )}
        </div>

        {/* Horizon elements */}
        <div className="absolute top-[20%] left-1/4 text-4xl opacity-30">🏔️</div>
        <div className="absolute top-[25%] right-1/4 text-4xl opacity-30">🌴</div>
      </div>

      {/* Lap Progress bar */}
      <div className="relative z-20 p-4">
        {/* Pit zone markers on progress bar */}
        <div className="h-3 bg-muted overflow-hidden border border-border relative">
          {/* Pit zone indicators */}
          {PIT_ZONES.map((zone, idx) => (
            <div
              key={idx}
              className="absolute top-0 h-full bg-accent/30 border-x border-accent/50"
              style={{ 
                left: `${zone.start * 100}%`,
                width: `${(zone.end - zone.start) * 100}%`,
              }}
            />
          ))}
          {/* AI opponents (show position within current lap) */}
          {opponents.map(op => {
            const opLapProgress = (op.distance % lapLength) / lapLength;
            return (
              <div
                key={op.id}
                className={`absolute top-0 h-full w-1 transition-all ${op.isColliding ? 'animate-pulse' : ''}`}
                style={{ 
                  left: `${opLapProgress * 100}%`,
                  backgroundColor: op.isColliding ? '#ff0000' : op.carColor,
                }}
              />
            );
          })}
          {/* Player progress within lap */}
          <div 
            className={`absolute top-0 h-full w-2 transition-all z-10 ${
              collision?.isColliding ? 'bg-destructive' : 'bg-primary'
            }`}
            style={{ left: `${getLapProgress() * 100}%` }}
          />
          {/* Lap completion overlay */}
          <div 
            className="absolute top-0 h-full bg-gradient-to-r from-primary/20 to-transparent pointer-events-none"
            style={{ width: `${getLapProgress() * 100}%` }}
          />
        </div>
        <div className="flex justify-between mt-1">
          <span className="font-display text-[8px] text-muted-foreground">LAP {currentLap} START</span>
          <span className="font-display text-[8px] text-foreground">
            {((distance % lapLength) / 1000).toFixed(1)}km / {(lapLength / 1000).toFixed(1)}km
          </span>
          <span className="font-display text-[8px] text-muted-foreground">LAP {currentLap} END</span>
        </div>
        {/* Total race progress */}
        <div className="mt-2">
          <div className="h-1 bg-muted/50 overflow-hidden border border-border/50 relative">
            <div 
              className="absolute top-0 h-full bg-gradient-to-r from-primary via-secondary to-accent transition-all"
              style={{ width: `${(distance / totalRaceDistance) * 100}%` }}
            />
          </div>
          <div className="text-center mt-0.5">
            <span className="font-display text-[6px] text-muted-foreground">
              TOTAL: {(distance / 1000).toFixed(1)}km / {(totalRaceDistance / 1000).toFixed(1)}km
            </span>
          </div>
        </div>
      </div>

      {/* Controls hint */}
      <div className="relative z-20 p-4 text-center">
        <p className="font-display text-[8px] text-muted-foreground">
          ↑ ACCELERATE | ↓ BRAKE | ← → STEER | SPACE PIT STOP | ⚠ AVOID COLLISIONS
        </p>
      </div>

      {/* Pit stop overlay */}
      {isPitting && (
        <div className="absolute inset-0 z-40 bg-background/90 flex items-center justify-center">
          <div className="text-center space-y-6 p-8 border-2 border-accent bg-card max-w-md w-full mx-4">
            <h2 className="font-display text-xl text-accent">🔧 PIT STOP</h2>
            
            <div className="space-y-4">
              <div className="flex items-center justify-center gap-8">
                <div className="text-center">
                  <span className="text-4xl">⛽</span>
                  <p className="font-display text-[8px] text-muted-foreground mt-1">REFUELING</p>
                </div>
                <div className="text-center">
                  <span className="text-4xl">🛞</span>
                  <p className="font-display text-[8px] text-muted-foreground mt-1">NEW TIRES</p>
                </div>
              </div>
              
              <div className="h-4 bg-muted rounded-full overflow-hidden border border-border">
                <div 
                  className="h-full bg-gradient-to-r from-accent via-primary to-secondary transition-all"
                  style={{ width: `${pitProgress}%` }}
                />
              </div>
              
              <p className="font-display text-lg text-foreground animate-pulse">
                {pitProgress < 30 && '🔧 Lifting car...'}
                {pitProgress >= 30 && pitProgress < 60 && '⛽ Refueling...'}
                {pitProgress >= 60 && pitProgress < 90 && '🛞 Changing tires...'}
                {pitProgress >= 90 && '✅ Almost done!'}
              </p>
            </div>
          </div>
        </div>
      )}

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
