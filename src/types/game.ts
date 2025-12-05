export interface Racer {
  id: string;
  name: string;
  nationality: string;
  isLegend: boolean;
  stats: RacerStats;
  carColor: string;
  avatar?: string;
}

export interface RacerStats {
  speed: number;
  handling: number;
  acceleration: number;
  championships: number;
  wins: number;
  races: number;
  money: number;
  fame: number;
}

export interface Track {
  id: string;
  name: string;
  country: string;
  difficulty: 'Easy' | 'Medium' | 'Hard' | 'Extreme';
  length: number; // in km
  bestTime?: number;
  unlocked: boolean;
  image?: string;
}

export interface Championship {
  id: string;
  name: string;
  tracks: string[];
  prize: number;
  completed: boolean;
  position?: number;
}

export type WeatherCondition = 'clear' | 'rain' | 'night' | 'storm';

export interface Weather {
  condition: WeatherCondition;
  intensity: number; // 0-1
  handlingModifier: number; // multiplier for handling
  visibilityModifier: number; // 0-1, affects view distance
}

export interface GameState {
  currentScreen: 'menu' | 'create-racer' | 'select-racer' | 'garage' | 'world-tour' | 'race' | 'standings' | 'career-end';
  player: Racer | null;
  currentChampionship: Championship | null;
  currentTrack: Track | null;
  season: number;
  isRacing: boolean;
  weather: Weather;
}

export const LEGENDARY_RACERS: Racer[] = [
  {
    id: 'senna',
    name: 'Ayrton Senna',
    nationality: 'Brazil',
    isLegend: true,
    carColor: '#FFD700',
    stats: { speed: 98, handling: 95, acceleration: 92, championships: 3, wins: 41, races: 161, money: 5000000, fame: 100 }
  },
  {
    id: 'prost',
    name: 'Alain Prost',
    nationality: 'France',
    isLegend: true,
    carColor: '#0055A4',
    stats: { speed: 94, handling: 97, acceleration: 90, championships: 4, wins: 51, races: 199, money: 4500000, fame: 95 }
  },
  {
    id: 'mansell',
    name: 'Nigel Mansell',
    nationality: 'UK',
    isLegend: true,
    carColor: '#C8102E',
    stats: { speed: 96, handling: 88, acceleration: 94, championships: 1, wins: 31, races: 187, money: 3000000, fame: 85 }
  },
  {
    id: 'schumacher',
    name: 'Michael Schumacher',
    nationality: 'Germany',
    isLegend: true,
    carColor: '#FF0000',
    stats: { speed: 99, handling: 96, acceleration: 95, championships: 2, wins: 19, races: 68, money: 2000000, fame: 80 }
  }
];

export const WORLD_TRACKS: Track[] = [
  { id: 'monaco', name: 'Monaco Grand Prix', country: 'Monaco', difficulty: 'Extreme', length: 3.337, unlocked: true },
  { id: 'monza', name: 'Monza Circuit', country: 'Italy', difficulty: 'Medium', length: 5.793, unlocked: true },
  { id: 'silverstone', name: 'Silverstone', country: 'UK', difficulty: 'Medium', length: 5.891, unlocked: true },
  { id: 'spa', name: 'Spa-Francorchamps', country: 'Belgium', difficulty: 'Hard', length: 7.004, unlocked: false },
  { id: 'suzuka', name: 'Suzuka Circuit', country: 'Japan', difficulty: 'Hard', length: 5.807, unlocked: false },
  { id: 'interlagos', name: 'Interlagos', country: 'Brazil', difficulty: 'Medium', length: 4.309, unlocked: false },
  { id: 'nurburgring', name: 'Nürburgring', country: 'Germany', difficulty: 'Extreme', length: 5.148, unlocked: false },
  { id: 'adelaide', name: 'Adelaide Street', country: 'Australia', difficulty: 'Hard', length: 3.780, unlocked: false },
];
