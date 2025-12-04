export interface AIOpponent {
  id: string;
  name: string;
  carColor: string;
  skillLevel: 'Rookie' | 'Amateur' | 'Pro' | 'Legend';
  speed: number;
  aggression: number; // How much they weave
  position: number;
  distance: number;
  x: number;
  scale: number; // Visual depth scale
}

export const generateOpponents = (trackDifficulty: string): AIOpponent[] => {
  const opponents: AIOpponent[] = [
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
    },
  ];

  // Adjust speeds based on track difficulty
  const difficultyMultiplier = {
    'Easy': 0.8,
    'Medium': 0.9,
    'Hard': 1.0,
    'Extreme': 1.1,
  }[trackDifficulty] || 1;

  return opponents.map(op => ({
    ...op,
    speed: op.speed * difficultyMultiplier,
  }));
};

export const updateOpponent = (
  opponent: AIOpponent,
  deltaTime: number,
  maxSpeed: number,
  trackLength: number
): AIOpponent => {
  // Calculate AI speed with some randomness
  const baseSpeed = maxSpeed * opponent.speed;
  const speedVariation = (Math.random() - 0.5) * 20;
  const currentSpeed = Math.max(50, baseSpeed + speedVariation);

  // Update distance
  const newDistance = Math.min(opponent.distance + currentSpeed * deltaTime, trackLength);

  // Update horizontal position (racing line)
  const waveFrequency = 0.001 + opponent.aggression * 0.002;
  const waveAmplitude = 10 + opponent.aggression * 15;
  const targetX = 50 + Math.sin(newDistance * waveFrequency) * waveAmplitude;
  const newX = opponent.x + (targetX - opponent.x) * 0.05;

  return {
    ...opponent,
    distance: newDistance,
    x: Math.max(15, Math.min(85, newX)),
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
