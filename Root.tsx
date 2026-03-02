import React, { useState } from 'react';
import MainMenu from './components/MainMenu';
import App from './App';

type Screen = 'MENU' | 'GAME';

const Root: React.FC = () => {
  const [screen, setScreen] = useState<Screen>('MENU');

  if (screen === 'MENU') {
    return <MainMenu onStartClassic={() => setScreen('GAME')} />;
  }

  return <App onGoToMenu={() => setScreen('MENU')} />;
};

export default Root;
