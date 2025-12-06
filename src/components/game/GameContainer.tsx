import React from 'react';
import { useGame } from '@/context/GameContext';
import MainMenu from './MainMenu';
import CreateRacer from './CreateRacer';
import SelectLegend from './SelectLegend';
import WorldTour from './WorldTour';
import RaceScreen from './RaceScreen';
import Standings from './Standings';
import CareerEnd from './CareerEnd';
import Garage from './Garage';

const GameContainer: React.FC = () => {
  const { gameState } = useGame();

  const renderScreen = () => {
    switch (gameState.currentScreen) {
      case 'menu':
        return <MainMenu />;
      case 'create-racer':
        return <CreateRacer />;
      case 'select-racer':
        return <SelectLegend />;
      case 'world-tour':
        return <WorldTour />;
      case 'race':
        return <RaceScreen />;
      case 'standings':
        return <Standings />;
      case 'career-end':
        return <CareerEnd />;
      case 'garage':
        return <Garage />;
      default:
        return <MainMenu />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {renderScreen()}
    </div>
  );
};

export default GameContainer;
