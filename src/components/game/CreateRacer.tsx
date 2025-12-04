import React, { useState } from 'react';
import { useGame } from '@/context/GameContext';
import { Racer } from '@/types/game';

const CAR_COLORS = [
  { name: 'Cyber Red', value: '#FF0040' },
  { name: 'Neon Blue', value: '#00D4FF' },
  { name: 'Electric Yellow', value: '#FFD700' },
  { name: 'Toxic Green', value: '#39FF14' },
  { name: 'Hot Pink', value: '#FF1493' },
  { name: 'Sunset Orange', value: '#FF6B00' },
];

const NATIONALITIES = [
  'USA', 'UK', 'Germany', 'France', 'Italy', 'Japan', 'Brazil', 'Australia', 'Canada', 'Spain'
];

const CreateRacer: React.FC = () => {
  const { setPlayer, setScreen } = useGame();
  const [name, setName] = useState('');
  const [nationality, setNationality] = useState('USA');
  const [carColor, setCarColor] = useState(CAR_COLORS[0].value);

  const handleCreate = () => {
    if (!name.trim()) return;

    const newRacer: Racer = {
      id: `player-${Date.now()}`,
      name: name.trim(),
      nationality,
      isLegend: false,
      carColor,
      stats: {
        speed: 50 + Math.floor(Math.random() * 20),
        handling: 50 + Math.floor(Math.random() * 20),
        acceleration: 50 + Math.floor(Math.random() * 20),
        championships: 0,
        wins: 0,
        races: 0,
        money: 10000,
        fame: 5,
      }
    };

    setPlayer(newRacer);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 relative">
      <div className="absolute inset-0 retro-grid opacity-20" />
      
      <div className="relative z-10 w-full max-w-md space-y-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="font-display text-xl text-primary text-glow-cyan">
            CREATE YOUR RACER
          </h1>
          <div className="h-0.5 w-48 mx-auto bg-gradient-to-r from-transparent via-primary to-transparent" />
        </div>

        {/* Form */}
        <div className="space-y-6 bg-card/50 border border-border p-6 backdrop-blur">
          {/* Name */}
          <div className="space-y-2">
            <label className="font-display text-[10px] text-muted-foreground">
              DRIVER NAME
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your name..."
              className="w-full bg-muted border border-border px-4 py-3 font-body text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary"
              maxLength={20}
            />
          </div>

          {/* Nationality */}
          <div className="space-y-2">
            <label className="font-display text-[10px] text-muted-foreground">
              NATIONALITY
            </label>
            <select
              value={nationality}
              onChange={(e) => setNationality(e.target.value)}
              className="w-full bg-muted border border-border px-4 py-3 font-body text-foreground focus:outline-none focus:border-primary"
            >
              {NATIONALITIES.map(nat => (
                <option key={nat} value={nat}>{nat}</option>
              ))}
            </select>
          </div>

          {/* Car Color */}
          <div className="space-y-2">
            <label className="font-display text-[10px] text-muted-foreground">
              CAR COLOR
            </label>
            <div className="grid grid-cols-6 gap-2">
              {CAR_COLORS.map(color => (
                <button
                  key={color.value}
                  onClick={() => setCarColor(color.value)}
                  className={`w-10 h-10 rounded transition-all ${
                    carColor === color.value 
                      ? 'ring-2 ring-primary ring-offset-2 ring-offset-background scale-110' 
                      : 'hover:scale-105'
                  }`}
                  style={{ backgroundColor: color.value }}
                  title={color.name}
                />
              ))}
            </div>
          </div>

          {/* Preview */}
          <div className="text-center py-4 border border-dashed border-border">
            <div className="text-4xl mb-2">🏎️</div>
            <p className="font-body text-sm text-foreground">{name || 'Your Name'}</p>
            <p className="font-display text-[8px] text-muted-foreground">{nationality}</p>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex gap-4">
          <button
            onClick={() => setScreen('menu')}
            className="flex-1 arcade-button arcade-button-pink text-xs"
          >
            BACK
          </button>
          <button
            onClick={handleCreate}
            disabled={!name.trim()}
            className="flex-1 arcade-button text-xs disabled:opacity-50 disabled:cursor-not-allowed"
          >
            START CAREER
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateRacer;
