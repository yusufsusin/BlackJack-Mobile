import React, { useState, useEffect } from 'react';
import MainMenu from './components/MainMenu';
import App from './App';
import SettingsScreen, { Lang } from './components/SettingsScreen';
import { supabase } from './lib/supabase';
import { INITIAL_MONEY } from './constants';

type Screen = 'MENU' | 'GAME' | 'SETTINGS';

const Root: React.FC = () => {
  const [screen, setScreen] = useState<Screen>('MENU');
  const [language, setLanguage] = useState<Lang>('en');
  const [musicVolume, setMusicVolume] = useState(80);
  const [gameVolume, setGameVolume] = useState(60);
  const [initialMoney, setInitialMoney] = useState<number | null>(null);
  const [highScore, setHighScore] = useState(INITIAL_MONEY);

  useEffect(() => {
    initSession();
  }, []);

  const initSession = async () => {
    try {
      // Check for existing session
      const { data: { session } } = await supabase.auth.getSession();

      let userId: string;

      if (session?.user) {
        userId = session.user.id;
      } else {
        // First launch — create anonymous session
        const { data, error } = await supabase.auth.signInAnonymously();
        if (error || !data.user) {
          setInitialMoney(INITIAL_MONEY);
          return;
        }
        userId = data.user.id;
      }

      // Fetch or create user stats
      const { data: stats, error: fetchError } = await supabase
        .from('user_stats')
        .select('current_money, high_score')
        .eq('id', userId)
        .single();

      if (fetchError || !stats) {
        // New user — create initial stats row
        await supabase.from('user_stats').insert({
          id: userId,
          current_money: INITIAL_MONEY,
          high_score: INITIAL_MONEY,
        });
        setInitialMoney(INITIAL_MONEY);
        setHighScore(INITIAL_MONEY);
      } else {
        setInitialMoney(stats.current_money);
        setHighScore(stats.high_score);
      }
    } catch {
      setInitialMoney(INITIAL_MONEY);
    }
  };

  const handleStatsUpdate = async (newMoney: number, newHighScore: number) => {
    setHighScore(newHighScore);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const userId = session?.user?.id;
      if (!userId) return;

      await supabase.from('user_stats').update({
        current_money: newMoney,
        high_score: newHighScore,
        updated_at: new Date().toISOString(),
      }).eq('id', userId);
    } catch {
      // Silently fail — next save will catch up
    }
  };

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

  // Don't render game until initial money is loaded
  if (initialMoney === null) return null;

  return (
    <App
      onGoToMenu={() => setScreen('MENU')}
      musicVolume={musicVolume}
      gameVolume={gameVolume}
      onChangeMusicVolume={setMusicVolume}
      onChangeGameVolume={setGameVolume}
      initialMoney={initialMoney}
      highScore={highScore}
      onStatsUpdate={handleStatsUpdate}
    />
  );
};

export default Root;
