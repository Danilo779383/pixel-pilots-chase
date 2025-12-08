import { LEGENDARY_RACERS, getRivals, findRivalry, Rivalry } from '@/types/game';

export interface AIOpponent {
  id: string;
  name: string;
  carColor: string;
  skillLevel: 'Rookie' | 'Amateur' | 'Pro' | 'Legend';
  speed: number;
  aggression: number;
  position: number;
  distance: number;
  x: number;
  scale: number;
  isColliding?: boolean;
  collisionCooldown?: number;
  isRival?: boolean;
  legendId?: string;
  rivalry?: Rivalry;
}

export interface CollisionResult {
  isColliding: boolean;
  opponentId: string | null;
  impactSeverity: number; // 0-1
  impactDirection: 'left' | 'right' | 'front' | 'rear' | null;
}

export const generateOpponents = (trackDifficulty: string, playerId?: string): AIOpponent[] => {
  // Check if player is a legend and has rivals
  const playerRivals = playerId ? getRivals(playerId) : [];
  const hasRival = playerRivals.length > 0;
  
  // 60% chance to spawn a rival if player is a legend with rivals
  const spawnRival = hasRival && Math.random() < 0.6;
  const selectedRivalId = spawnRival ? playerRivals[Math.floor(Math.random() * playerRivals.length)] : null;
  const selectedRival = selectedRivalId ? LEGENDARY_RACERS.find(r => r.id === selectedRivalId) : null;
  const rivalry = selectedRivalId && playerId ? findRivalry(playerId, selectedRivalId) : null;

  const baseOpponents: AIOpponent[] = [
    {
      id: 'ai1',
      name: 'Speed Demon',
      carColor: '#FF4444',
      skillLevel: 'Legend',
      speed: 0.95,
      aggression: 0.8,
      position: 1,
      distance: 0,
      x: 30,
      scale: 1,
      isColliding: false,
      collisionCooldown: 0,
    },
    {
      id: 'ai2',
      name: 'Road Runner',
      carColor: '#44FF44',
      skillLevel: 'Pro',
      speed: 0.85,
      aggression: 0.6,
      position: 2,
      distance: 0,
      x: 70,
      scale: 1,
      isColliding: false,
      collisionCooldown: 0,
    },
    {
      id: 'ai3',
      name: 'Night Rider',
      carColor: '#4444FF',
      skillLevel: 'Amateur',
      speed: 0.75,
      aggression: 0.4,
      position: 3,
      distance: 0,
      x: 50,
      scale: 1,
      isColliding: false,
      collisionCooldown: 0,
    },
    {
      id: 'ai4',
      name: 'Turbo Kid',
      carColor: '#FFFF44',
      skillLevel: 'Rookie',
      speed: 0.65,
      aggression: 0.2,
      position: 4,
      distance: 0,
      x: 40,
      scale: 1,
      isColliding: false,
      collisionCooldown: 0,
    },
  ];

  const difficultyMultiplier = {
    'Easy': 0.8,
    'Medium': 0.9,
    'Hard': 1.0,
    'Extreme': 1.1,
  }[trackDifficulty] || 1;

  let opponents = baseOpponents.map(op => ({
    ...op,
    speed: op.speed * difficultyMultiplier,
  }));

  // Replace first opponent with rival if spawning one
  if (selectedRival && rivalry) {
    const rivalStats = selectedRival.stats;
    opponents[0] = {
      id: `rival_${selectedRival.id}`,
      name: selectedRival.name,
      carColor: selectedRival.carColor,
      skillLevel: 'Legend',
      speed: Math.min(1.0, (rivalStats.speed / 100) * difficultyMultiplier),
      aggression: 0.9, // Rivals are aggressive
      position: 1,
      distance: 0,
      x: 35,
      scale: 1,
      isColliding: false,
      collisionCooldown: 0,
      isRival: true,
      legendId: selectedRival.id,
      rivalry: rivalry,
    };
  }

  return opponents;
};

export const updateOpponent = (
  opponent: AIOpponent,
  deltaTime: number,
  maxSpeed: number,
  trackLength: number
): AIOpponent => {
  // Reduce collision cooldown
  const newCooldown = Math.max(0, (opponent.collisionCooldown || 0) - deltaTime);
  
  // Slow down if recently collided
  const collisionSpeedPenalty = opponent.isColliding ? 0.5 : 1;
  
  const baseSpeed = maxSpeed * opponent.speed * collisionSpeedPenalty;
  const speedVariation = (Math.random() - 0.5) * 20;
  const currentSpeed = Math.max(50, baseSpeed + speedVariation);

  const newDistance = Math.min(opponent.distance + currentSpeed * deltaTime, trackLength);

  const waveFrequency = 0.001 + opponent.aggression * 0.002;
  const waveAmplitude = 10 + opponent.aggression * 15;
  const targetX = 50 + Math.sin(newDistance * waveFrequency) * waveAmplitude;
  const newX = opponent.x + (targetX - opponent.x) * 0.05;

  return {
    ...opponent,
    distance: newDistance,
    x: Math.max(15, Math.min(85, newX)),
    collisionCooldown: newCooldown,
    isColliding: newCooldown > 0,
  };
};

export const checkCollision = (
  playerX: number,
  playerDistance: number,
  opponents: AIOpponent[]
): CollisionResult => {
  const playerWidth = 8; // % of screen width
  const collisionDistanceThreshold = 30; // meters
  
  for (const opponent of opponents) {
    // Check if within collision distance (front/rear)
    const distanceDiff = Math.abs(opponent.distance - playerDistance);
    if (distanceDiff > collisionDistanceThreshold) continue;
    
    // Check horizontal overlap
    const horizontalDiff = Math.abs(opponent.x - playerX);
    if (horizontalDiff > playerWidth) continue;
    
    // Collision detected!
    const impactSeverity = 1 - (distanceDiff / collisionDistanceThreshold);
    
    let impactDirection: 'left' | 'right' | 'front' | 'rear';
    if (opponent.distance > playerDistance) {
      impactDirection = 'front';
    } else {
      impactDirection = 'rear';
    }
    
    // Add side impact
    if (opponent.x < playerX) {
      impactDirection = 'left';
    } else if (opponent.x > playerX) {
      impactDirection = 'right';
    }
    
    return {
      isColliding: true,
      opponentId: opponent.id,
      impactSeverity,
      impactDirection,
    };
  }
  
  return {
    isColliding: false,
    opponentId: null,
    impactSeverity: 0,
    impactDirection: null,
  };
};

export const applyCollisionToOpponent = (
  opponent: AIOpponent,
  playerX: number,
  pushStrength: number
): AIOpponent => {
  // Push opponent away from player
  const pushDirection = opponent.x < playerX ? -1 : 1;
  const newX = opponent.x + pushDirection * pushStrength * 5;
  
  return {
    ...opponent,
    x: Math.max(15, Math.min(85, newX)),
    isColliding: true,
    collisionCooldown: 0.5, // 0.5 seconds cooldown
  };
};

export const calculatePositions = (
  playerDistance: number,
  opponents: AIOpponent[]
): { playerPosition: number; updatedOpponents: AIOpponent[] } => {
  const allDistances = [
    { id: 'player', distance: playerDistance },
    ...opponents.map(op => ({ id: op.id, distance: op.distance })),
  ];

  allDistances.sort((a, b) => b.distance - a.distance);

  const playerPosition = allDistances.findIndex(d => d.id === 'player') + 1;

  const updatedOpponents = opponents.map(op => {
    const position = allDistances.findIndex(d => d.id === op.id) + 1;
    return { ...op, position };
  });

  return { playerPosition, updatedOpponents };
};
