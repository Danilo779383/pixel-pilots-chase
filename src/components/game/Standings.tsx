import React, { useEffect, useState } from 'react';
import { useGame } from '@/context/GameContext';
import { startMenuMusic, stopAllMusic } from '@/utils/soundEffects';
import { LEGENDARY_RIVALRIES, RivalryRecord, TrackRecord } from '@/types/game';

type ViewTab = 'stats' | 'rivalries' | 'records';

const Standings: React.FC = () => {
  const { gameState, setScreen, unlockTrack, tracks } = useGame();
  const { player } = gameState;
  const [activeTab, setActiveTab] = useState<ViewTab>('stats');

  useEffect(() => {
    startMenuMusic();
    return () => stopAllMusic();
  }, []);

  if (!player) return null;

  // Unlock next track if won enough races
  const lockedTracks = tracks.filter(t => !t.unlocked);
  const canUnlock = player.stats.wins >= 2 && lockedTracks.length > 0;

  const handleUnlock = () => {
    if (lockedTracks[0]) {
      unlockTrack(lockedTracks[0].id);
    }
  };

  const rivalryRecords = player.stats.rivalryRecords || [];
  const trackRecords = player.stats.trackRecords || [];
  
  // Get rivalry info for display
  const getRivalryInfo = (rivalId: string) => {
    const rivalry = LEGENDARY_RIVALRIES.find(r => 
      (r.racer1 === player.id && r.racer2 === rivalId) ||
      (r.racer2 === player.id && r.racer1 === rivalId)
    );
    return rivalry;
  };
  
  const formatLapTime = (ms: number) => {
    const mins = Math.floor(ms / 60000);
    const secs = Math.floor((ms % 60000) / 1000);
    const millis = Math.floor((ms % 1000) / 10);
    return `${mins}:${secs.toString().padStart(2, '0')}.${millis.toString().padStart(2, '0')}`;
  };
  
  const getWeatherIcon = (weather: string) => {
    switch (weather) {
      case 'rain': return '🌧️';
      case 'night': return '🌙';
      case 'storm': return '⛈️';
      default: return '☀️';
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 relative">
      <div className="absolute inset-0 retro-grid opacity-20" />
      
      <div className="relative z-10 w-full max-w-lg space-y-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="font-display text-xl text-primary text-glow-cyan">
            CAREER STANDINGS
          </h1>
          <div className="h-0.5 w-48 mx-auto bg-gradient-to-r from-transparent via-primary to-transparent" />
        </div>

        {/* Tab Navigation */}
        <div className="flex justify-center gap-2 flex-wrap">
          <button
            onClick={() => setActiveTab('stats')}
            className={`font-display text-[10px] px-4 py-2 border transition-colors ${
              activeTab === 'stats' 
                ? 'border-primary bg-primary/20 text-primary' 
                : 'border-border text-muted-foreground hover:border-primary/50'
            }`}
          >
            STATS
          </button>
          {rivalryRecords.length > 0 && (
            <button
              onClick={() => setActiveTab('rivalries')}
              className={`font-display text-[10px] px-4 py-2 border transition-colors ${
                activeTab === 'rivalries' 
                  ? 'border-secondary bg-secondary/20 text-secondary' 
                  : 'border-border text-muted-foreground hover:border-secondary/50'
              }`}
            >
              ⚔️ RIVALRIES ({rivalryRecords.length})
            </button>
          )}
          {trackRecords.length > 0 && (
            <button
              onClick={() => setActiveTab('records')}
              className={`font-display text-[10px] px-4 py-2 border transition-colors ${
                activeTab === 'records' 
                  ? 'border-accent bg-accent/20 text-accent' 
                  : 'border-border text-muted-foreground hover:border-accent/50'
              }`}
            >
              🏆 RECORDS ({trackRecords.length})
            </button>
          )}
        </div>

        {activeTab === 'stats' && (
          /* Player Card - Stats View */
          <div className="bg-card/80 border-2 border-primary p-6 space-y-6 box-glow-cyan">
            <div className="flex items-center gap-4">
              <div 
                className="w-16 h-16 flex items-center justify-center text-3xl border border-border"
                style={{ backgroundColor: player.carColor + '30' }}
              >
                🏎️
              </div>
              <div>
                <h2 className="font-display text-sm text-foreground">{player.name}</h2>
                <p className="font-body text-xs text-muted-foreground">{player.nationality}</p>
                {player.isLegend && (
                  <span className="font-display text-[8px] text-accent">★ LEGEND</span>
                )}
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-4">
              <StatBox label="CHAMPIONSHIPS" value={player.stats.championships} color="text-accent" />
              <StatBox label="RACE WINS" value={player.stats.wins} color="text-primary" />
              <StatBox label="RACES" value={player.stats.races} color="text-secondary" />
              <StatBox label="FAME" value={`${player.stats.fame}%`} color="text-neon-green" />
            </div>

            {/* Earnings */}
            <div className="text-center py-4 border-t border-b border-border">
              <p className="font-display text-[10px] text-muted-foreground mb-1">TOTAL EARNINGS</p>
              <p className="font-display text-2xl text-accent text-glow-yellow">
                ${player.stats.money.toLocaleString()}
              </p>
            </div>

            {/* Performance Bars */}
            <div className="space-y-2">
              <PerformanceBar label="SPEED" value={player.stats.speed} color="bg-neon-cyan" />
              <PerformanceBar label="HANDLING" value={player.stats.handling} color="bg-neon-pink" />
              <PerformanceBar label="ACCELERATION" value={player.stats.acceleration} color="bg-neon-yellow" />
            </div>
          </div>
        )}

        {activeTab === 'rivalries' && (
          /* Rivalry Records View */
          <div className="bg-card/80 border-2 border-secondary p-6 space-y-4 box-glow-pink">
            <div className="text-center mb-4">
              <h2 className="font-display text-sm text-secondary text-glow-pink">⚔️ RIVALRY RECORDS ⚔️</h2>
              <p className="font-display text-[8px] text-muted-foreground mt-1">Head-to-head against your rivals</p>
            </div>
            
            <div className="space-y-3 max-h-72 overflow-y-auto">
              {rivalryRecords.map((record: RivalryRecord) => {
                const rivalry = getRivalryInfo(record.rivalId);
                const winRate = record.races > 0 ? Math.round((record.wins / record.races) * 100) : 0;
                const isDominating = record.wins > record.losses;
                const isLosing = record.losses > record.wins;
                
                return (
                  <div 
                    key={record.rivalId}
                    className={`p-4 border ${
                      rivalry?.intensity === 'legendary' ? 'border-accent bg-accent/5' :
                      rivalry?.intensity === 'bitter' ? 'border-destructive bg-destructive/5' :
                      'border-primary bg-primary/5'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <h3 className="font-display text-xs text-foreground">{record.rivalName}</h3>
                        {rivalry && (
                          <p className={`font-display text-[8px] ${
                            rivalry.intensity === 'legendary' ? 'text-accent' :
                            rivalry.intensity === 'bitter' ? 'text-destructive' :
                            'text-primary'
                          }`}>
                            {rivalry.name}
                          </p>
                        )}
                      </div>
                      <div className={`font-display text-lg ${
                        isDominating ? 'text-neon-green' : isLosing ? 'text-destructive' : 'text-muted-foreground'
                      }`}>
                        {record.wins}-{record.losses}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-2 bg-muted overflow-hidden">
                        <div 
                          className={`h-full transition-all ${
                            isDominating ? 'bg-neon-green' : isLosing ? 'bg-destructive' : 'bg-muted-foreground'
                          }`}
                          style={{ width: `${winRate}%` }}
                        />
                      </div>
                      <span className="font-display text-[10px] text-muted-foreground w-12 text-right">
                        {winRate}% WIN
                      </span>
                    </div>
                    
                    <div className="flex justify-between mt-2">
                      <span className="font-display text-[8px] text-muted-foreground">
                        {record.races} RACES
                      </span>
                      {isDominating && record.wins >= 3 && (
                        <span className="font-display text-[8px] text-neon-green">🏆 DOMINANT</span>
                      )}
                      {isLosing && record.losses >= 3 && (
                        <span className="font-display text-[8px] text-destructive">😤 NEEDS REVENGE</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
            
            {/* Summary Stats */}
            <div className="border-t border-border pt-4 mt-4">
              <div className="grid grid-cols-3 gap-2 text-center">
                <div>
                  <p className="font-display text-lg text-neon-green">
                    {rivalryRecords.reduce((sum: number, r: RivalryRecord) => sum + r.wins, 0)}
                  </p>
                  <p className="font-display text-[8px] text-muted-foreground">TOTAL WINS</p>
                </div>
                <div>
                  <p className="font-display text-lg text-destructive">
                    {rivalryRecords.reduce((sum: number, r: RivalryRecord) => sum + r.losses, 0)}
                  </p>
                  <p className="font-display text-[8px] text-muted-foreground">TOTAL LOSSES</p>
                </div>
                <div>
                  <p className="font-display text-lg text-foreground">
                    {rivalryRecords.length}
                  </p>
                  <p className="font-display text-[8px] text-muted-foreground">RIVALS FACED</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'records' && (
          /* Track Records Leaderboard */
          <div className="bg-card/80 border-2 border-accent p-6 space-y-4 box-glow-yellow">
            <div className="text-center mb-4">
              <h2 className="font-display text-sm text-accent text-glow-yellow">🏆 LAP RECORDS 🏆</h2>
              <p className="font-display text-[8px] text-muted-foreground mt-1">Your all-time best lap times</p>
            </div>
            
            <div className="space-y-3 max-h-72 overflow-y-auto">
              {trackRecords
                .sort((a: TrackRecord, b: TrackRecord) => a.trackName.localeCompare(b.trackName))
                .map((record: TrackRecord, index: number) => (
                  <div 
                    key={record.trackId}
                    className="p-4 border border-accent/30 bg-accent/5"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <span className="font-display text-lg text-accent">#{index + 1}</span>
                        <div>
                          <h3 className="font-display text-xs text-foreground">{record.trackName}</h3>
                          <p className="font-display text-[8px] text-muted-foreground">
                            Season {record.setOnSeason} {getWeatherIcon(record.weather)}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-display text-lg text-accent text-glow-yellow">
                          {formatLapTime(record.bestLapTime)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
            
            {/* Records Summary */}
            <div className="border-t border-border pt-4 mt-4">
              <div className="grid grid-cols-2 gap-4 text-center">
                <div>
                  <p className="font-display text-lg text-accent">
                    {trackRecords.length}
                  </p>
                  <p className="font-display text-[8px] text-muted-foreground">TRACKS RECORDED</p>
                </div>
                <div>
                  <p className="font-display text-lg text-primary">
                    {trackRecords.length > 0 
                      ? formatLapTime(Math.min(...trackRecords.map((r: TrackRecord) => r.bestLapTime)))
                      : '--:--:--'
                    }
                  </p>
                  <p className="font-display text-[8px] text-muted-foreground">FASTEST LAP</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Unlock notification */}
        {canUnlock && (
          <div className="bg-accent/20 border border-accent p-4 text-center space-y-3">
            <p className="font-display text-[10px] text-accent">
              🎉 NEW TRACK AVAILABLE!
            </p>
            <p className="font-body text-xs text-foreground">
              {lockedTracks[0].name} - {lockedTracks[0].country}
            </p>
            <button onClick={handleUnlock} className="arcade-button text-[8px] py-2 px-4">
              UNLOCK
            </button>
          </div>
        )}

        {/* Fame milestone */}
        {player.stats.fame >= 80 && (
          <div className="bg-secondary/20 border border-secondary p-4 text-center">
            <p className="font-display text-[10px] text-secondary text-glow-pink">
              ⭐ LEGENDARY STATUS ACHIEVED ⭐
            </p>
            <p className="font-body text-[10px] text-muted-foreground mt-2">
              You can now retire as a racing legend!
            </p>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-4">
          <button
            onClick={() => setScreen('world-tour')}
            className="flex-1 arcade-button text-xs"
          >
            CONTINUE RACING
          </button>
        </div>
      </div>
    </div>
  );
};

const StatBox: React.FC<{ label: string; value: string | number; color: string }> = ({ 
  label, value, color 
}) => (
  <div className="text-center p-3 bg-muted/50 border border-border">
    <p className={`font-display text-xl ${color}`}>{value}</p>
    <p className="font-display text-[6px] text-muted-foreground">{label}</p>
  </div>
);

const PerformanceBar: React.FC<{ label: string; value: number; color: string }> = ({ 
  label, value, color 
}) => (
  <div className="flex items-center gap-3">
    <span className="font-display text-[8px] text-muted-foreground w-20">{label}</span>
    <div className="flex-1 h-3 bg-muted overflow-hidden border border-border/50">
      <div className={`h-full ${color}`} style={{ width: `${value}%` }} />
    </div>
    <span className="font-display text-[10px] text-foreground w-8">{value}</span>
  </div>
);

export default Standings;
