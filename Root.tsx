import React, { useState } from 'react';
import MainMenu from './components/MainMenu';
import App from './App';
import SettingsScreen, { Lang } from './components/SettingsScreen';

type Screen = 'MENU' | 'GAME' | 'SETTINGS';

const Root: React.FC = () => {
  const [screen, setScreen] = useState<Screen>('MENU');
  const [language, setLanguage] = useState<Lang>('en');
  const [musicVolume, setMusicVolume] = useState(80);
  const [gameVolume, setGameVolume] = useState(60);

  if (screen === 'SETTINGS') {
    return (
      <SettingsScreen
        language={language}
        musicVolume={musicVolume}
        gameVolume={gameVolume}
        onChangeLanguage={setLanguage}
        onChangeMusicVolume={setMusicVolume}
        onChangeGameVolume={setGameVolume}
        onBack={() => setScreen('MENU')}
      />
    );
  }

  if (screen === 'MENU') {
    return (
      <MainMenu
        onStartClassic={() => setScreen('GAME')}
        onOpenSettings={() => setScreen('SETTINGS')}
      />
    );
  }

  return (
    <App
      onGoToMenu={() => setScreen('MENU')}
      musicVolume={musicVolume}
      gameVolume={gameVolume}
      onChangeMusicVolume={setMusicVolume}
      onChangeGameVolume={setGameVolume}
    />
  );
};

export default Root;
