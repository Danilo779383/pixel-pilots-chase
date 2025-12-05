import React, { useMemo } from 'react';
import { Weather } from '@/types/game';

interface WeatherEffectsProps {
  weather: Weather;
  speed: number;
}

const WeatherEffects: React.FC<WeatherEffectsProps> = ({ weather, speed }) => {
  const raindrops = useMemo(() => {
    if (weather.condition !== 'rain' && weather.condition !== 'storm') return [];
    const count = Math.floor(weather.intensity * 100);
    return Array.from({ length: count }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      delay: Math.random() * 2,
      duration: 0.3 + Math.random() * 0.3,
    }));
  }, [weather.condition, weather.intensity]);

  const lightningFlash = weather.condition === 'storm' && Math.random() > 0.995;

  return (
    <>
      {/* Night overlay */}
      {(weather.condition === 'night' || weather.condition === 'storm') && (
        <div 
          className="absolute inset-0 z-10 pointer-events-none transition-opacity duration-1000"
          style={{
            background: `linear-gradient(to bottom, 
              rgba(0, 0, 20, ${0.6 * weather.intensity}) 0%,
              rgba(0, 0, 40, ${0.4 * weather.intensity}) 50%,
              rgba(10, 10, 30, ${0.5 * weather.intensity}) 100%
            )`,
          }}
        />
      )}

      {/* Headlight beams for night */}
      {weather.condition === 'night' && (
        <div className="absolute bottom-[20%] left-1/2 transform -translate-x-1/2 z-15 pointer-events-none">
          <div 
            className="w-40 h-60 opacity-30"
            style={{
              background: 'linear-gradient(to top, rgba(255, 255, 200, 0.4) 0%, transparent 100%)',
              clipPath: 'polygon(40% 100%, 60% 100%, 80% 0%, 20% 0%)',
            }}
          />
        </div>
      )}

      {/* Rain overlay */}
      {(weather.condition === 'rain' || weather.condition === 'storm') && (
        <div className="absolute inset-0 z-20 pointer-events-none overflow-hidden">
          {/* Rain particles */}
          {raindrops.map(drop => (
            <div
              key={drop.id}
              className="absolute w-0.5 bg-gradient-to-b from-transparent via-blue-300 to-blue-400"
              style={{
                left: `${drop.left}%`,
                top: '-20px',
                height: `${15 + speed * 0.1}px`,
                opacity: 0.4 + weather.intensity * 0.3,
                animation: `rainfall ${drop.duration}s linear infinite`,
                animationDelay: `${drop.delay}s`,
                transform: `skewX(${-5 - speed * 0.05}deg)`,
              }}
            />
          ))}
          
          {/* Fog/mist overlay */}
          <div 
            className="absolute inset-0"
            style={{
              background: `linear-gradient(to top, 
                rgba(150, 170, 200, ${weather.intensity * 0.3}) 0%,
                transparent 40%
              )`,
            }}
          />
        </div>
      )}

      {/* Lightning flash */}
      {lightningFlash && (
        <div className="absolute inset-0 z-30 bg-white/50 pointer-events-none animate-ping" />
      )}

      {/* Storm dark clouds */}
      {weather.condition === 'storm' && (
        <div 
          className="absolute top-0 left-0 right-0 h-32 z-5 pointer-events-none"
          style={{
            background: 'linear-gradient(to bottom, rgba(30, 30, 50, 0.9) 0%, transparent 100%)',
          }}
        />
      )}

      {/* Visibility vignette */}
      {weather.visibilityModifier < 1 && (
        <div 
          className="absolute inset-0 z-25 pointer-events-none"
          style={{
            background: `radial-gradient(ellipse at center bottom, 
              transparent 20%, 
              rgba(0, 0, 0, ${(1 - weather.visibilityModifier) * 0.7}) 80%
            )`,
          }}
        />
      )}

      {/* Water spray from car */}
      {(weather.condition === 'rain' || weather.condition === 'storm') && speed > 50 && (
        <div className="absolute bottom-[12%] left-1/2 transform -translate-x-1/2 z-45 pointer-events-none">
          <div className="relative">
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="absolute w-1 h-1 rounded-full bg-blue-200/60"
                style={{
                  left: `${(i - 4) * 8}px`,
                  bottom: '0px',
                  animation: `spray ${0.3 + Math.random() * 0.2}s ease-out infinite`,
                  animationDelay: `${Math.random() * 0.2}s`,
                }}
              />
            ))}
          </div>
        </div>
      )}

      {/* CSS Animations */}
      <style>{`
        @keyframes rainfall {
          0% {
            transform: translateY(-20px) skewX(-5deg);
            opacity: 0;
          }
          10% {
            opacity: 0.6;
          }
          90% {
            opacity: 0.6;
          }
          100% {
            transform: translateY(100vh) skewX(-5deg);
            opacity: 0;
          }
        }
        
        @keyframes spray {
          0% {
            transform: translateY(0) scale(1);
            opacity: 0.6;
          }
          100% {
            transform: translateY(-30px) scale(0);
            opacity: 0;
          }
        }
      `}</style>
    </>
  );
};

export default WeatherEffects;
