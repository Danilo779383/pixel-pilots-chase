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

export interface Rivalry {
  id: string;
  racer1: string; // racer id
  racer2: string; // racer id
  name: string; // rivalry name
  description: string;
  intensity: 'heated' | 'legendary' | 'bitter';
  historicalContext: string;
  specialEvents: RivalryEvent[];
}

export interface RivalryEvent {
  id: string;
  name: string;
  trigger: 'race_start' | 'overtake' | 'collision' | 'close_finish' | 'lap_start';
  message: string;
  effect?: {
    type: 'aggression_boost' | 'speed_boost' | 'handling_penalty' | 'crowd_roar';
    value: number;
  };
}

export const LEGENDARY_RIVALRIES: Rivalry[] = [
  {
    id: 'senna-prost',
    racer1: 'senna',
    racer2: 'prost',
    name: 'The Professors vs The Artist',
    description: 'The most iconic rivalry in motorsport history',
    intensity: 'legendary',
    historicalContext: 'Two contrasting styles: Senna\'s raw passion vs Prost\'s calculated precision. Their battles defined an era.',
    specialEvents: [
      { id: 'sp1', name: 'Suzuka Flashback', trigger: 'race_start', message: '📻 "The tension is electric! These two have unfinished business..."' },
      { id: 'sp2', name: 'Wheel to Wheel', trigger: 'overtake', message: '📻 "INCREDIBLE MOVE! Shades of Suzuka 1989!"' },
      { id: 'sp3', name: 'Contact!', trigger: 'collision', message: '📻 "THEY\'VE TOUCHED! History repeating itself!"', effect: { type: 'crowd_roar', value: 1 } },
      { id: 'sp4', name: 'Photo Finish', trigger: 'close_finish', message: '📻 "This is what racing is ALL ABOUT!"' },
    ]
  },
  {
    id: 'schumacher-hill',
    racer1: 'schumacher',
    racer2: 'hill',
    name: 'Adelaide Grudge',
    description: 'The controversial 1994 championship decider',
    intensity: 'bitter',
    historicalContext: 'The 1994 Adelaide incident where contact between them decided the championship remains debated to this day.',
    specialEvents: [
      { id: 'sh1', name: 'Championship Tension', trigger: 'race_start', message: '📻 "There\'s no love lost between these two..."' },
      { id: 'sh2', name: 'Aggressive Defense', trigger: 'overtake', message: '📻 "Schumacher won\'t give an inch! Memories of Adelaide!"' },
      { id: 'sh3', name: 'Controversial Contact', trigger: 'collision', message: '📻 "OH NO! Shades of 1994!"', effect: { type: 'aggression_boost', value: 0.2 } },
    ]
  },
  {
    id: 'senna-mansell',
    racer1: 'senna',
    racer2: 'mansell',
    name: 'Monaco Warriors',
    description: 'Fierce on-track battles between two brave drivers',
    intensity: 'heated',
    historicalContext: 'Their wheel-to-wheel battle at Monaco 1992 is considered one of the greatest in F1 history.',
    specialEvents: [
      { id: 'sm1', name: 'Old Rivals', trigger: 'race_start', message: '📻 "These two never back down from a fight!"' },
      { id: 'sm2', name: 'Brave Move', trigger: 'overtake', message: '📻 "WHAT A MOVE! Pure bravery!"' },
      { id: 'sm3', name: 'No Quarter', trigger: 'collision', message: '📻 "Neither willing to yield!"', effect: { type: 'speed_boost', value: 0.05 } },
    ]
  },
  {
    id: 'prost-lauda',
    racer1: 'prost',
    racer2: 'lauda',
    name: 'McLaren Teammates',
    description: 'Intra-team rivalry at McLaren in 1984',
    intensity: 'heated',
    historicalContext: 'Lauda beat Prost by just 0.5 points in 1984 - the closest championship in F1 history.',
    specialEvents: [
      { id: 'pl1', name: 'Former Teammates', trigger: 'race_start', message: '📻 "Half a point decided their 1984 battle!"' },
      { id: 'pl2', name: 'Strategic Battle', trigger: 'overtake', message: '📻 "Master tacticians going head to head!"' },
    ]
  },
  {
    id: 'hakkinen-schumacher',
    racer1: 'hakkinen',
    racer2: 'schumacher',
    name: 'Spa Legends',
    description: 'The defining rivalry of the late 90s',
    intensity: 'legendary',
    historicalContext: 'Their battle at Spa 2000, with the overtake around Zonta, is one of the greatest moments in F1.',
    specialEvents: [
      { id: 'hs1', name: 'Flying Finns vs Germans', trigger: 'race_start', message: '📻 "The battle that defined a generation!"' },
      { id: 'hs2', name: 'Spa Magic', trigger: 'overtake', message: '📻 "UNBELIEVABLE! Remember Spa 2000!"' },
      { id: 'hs3', name: 'Respect Between Rivals', trigger: 'close_finish', message: '📻 "Two champions, separated by nothing!"' },
    ]
  },
  {
    id: 'piquet-mansell',
    racer1: 'piquet',
    racer2: 'mansell',
    name: 'Williams War',
    description: 'Bitter teammates at Williams in 1986-87',
    intensity: 'bitter',
    historicalContext: 'Their feud at Williams was legendary, with Piquet famously insulting Mansell\'s wife.',
    specialEvents: [
      { id: 'pm1', name: 'Bitter Memories', trigger: 'race_start', message: '📻 "These two HATE each other!"' },
      { id: 'pm2', name: 'No Friendship Here', trigger: 'collision', message: '📻 "The Williams war continues!"', effect: { type: 'aggression_boost', value: 0.3 } },
    ]
  },
  {
    id: 'villeneuve-schumacher',
    racer1: 'villeneuve',
    racer2: 'schumacher',
    name: 'Jerez Controversy',
    description: 'The 1997 championship collision',
    intensity: 'bitter',
    historicalContext: 'Schumacher\'s attempt to take out Villeneuve at Jerez 1997 led to his disqualification from the championship.',
    specialEvents: [
      { id: 'vs1', name: 'Unfinished Business', trigger: 'race_start', message: '📻 "Villeneuve hasn\'t forgotten Jerez..."' },
      { id: 'vs2', name: 'Payback Time', trigger: 'overtake', message: '📻 "Justice served on the track!"' },
      { id: 'vs3', name: 'Déjà Vu', trigger: 'collision', message: '📻 "CONTACT! Just like Jerez 97!"', effect: { type: 'handling_penalty', value: 0.1 } },
    ]
  },
];

// Helper to find rivalry between two racers
export const findRivalry = (racerId1: string, racerId2: string): Rivalry | null => {
  return LEGENDARY_RIVALRIES.find(r => 
    (r.racer1 === racerId1 && r.racer2 === racerId2) ||
    (r.racer1 === racerId2 && r.racer2 === racerId1)
  ) || null;
};

// Helper to get all rivals for a racer
export const getRivals = (racerId: string): string[] => {
  return LEGENDARY_RIVALRIES
    .filter(r => r.racer1 === racerId || r.racer2 === racerId)
    .map(r => r.racer1 === racerId ? r.racer2 : r.racer1);
};

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
  },
  {
    id: 'piquet',
    name: 'Nelson Piquet',
    nationality: 'Brazil',
    isLegend: true,
    carColor: '#00A859',
    stats: { speed: 93, handling: 94, acceleration: 91, championships: 3, wins: 23, races: 204, money: 4000000, fame: 88 }
  },
  {
    id: 'lauda',
    name: 'Niki Lauda',
    nationality: 'Austria',
    isLegend: true,
    carColor: '#ED2939',
    stats: { speed: 92, handling: 98, acceleration: 88, championships: 3, wins: 25, races: 171, money: 4200000, fame: 92 }
  },
  {
    id: 'berger',
    name: 'Gerhard Berger',
    nationality: 'Austria',
    isLegend: true,
    carColor: '#FF6B00',
    stats: { speed: 91, handling: 89, acceleration: 93, championships: 0, wins: 10, races: 210, money: 2500000, fame: 75 }
  },
  {
    id: 'hill',
    name: 'Damon Hill',
    nationality: 'UK',
    isLegend: true,
    carColor: '#1E3A8A',
    stats: { speed: 90, handling: 92, acceleration: 89, championships: 1, wins: 22, races: 115, money: 2800000, fame: 78 }
  },
  {
    id: 'patrese',
    name: 'Riccardo Patrese',
    nationality: 'Italy',
    isLegend: true,
    carColor: '#008C45',
    stats: { speed: 88, handling: 91, acceleration: 87, championships: 0, wins: 6, races: 256, money: 2200000, fame: 70 }
  },
  {
    id: 'alesi',
    name: 'Jean Alesi',
    nationality: 'France',
    isLegend: true,
    carColor: '#002395',
    stats: { speed: 89, handling: 86, acceleration: 95, championships: 0, wins: 1, races: 201, money: 2000000, fame: 72 }
  },
  {
    id: 'hakkinen',
    name: 'Mika Häkkinen',
    nationality: 'Finland',
    isLegend: true,
    carColor: '#003580',
    stats: { speed: 97, handling: 93, acceleration: 94, championships: 2, wins: 20, races: 161, money: 3500000, fame: 90 }
  },
  {
    id: 'villeneuve',
    name: 'Jacques Villeneuve',
    nationality: 'Canada',
    isLegend: true,
    carColor: '#FF0000',
    stats: { speed: 91, handling: 87, acceleration: 92, championships: 1, wins: 11, races: 163, money: 2600000, fame: 76 }
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
