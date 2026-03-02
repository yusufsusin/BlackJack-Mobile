import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Platform,
  ScrollView,
} from 'react-native';
import VolumeSlider from './VolumeSlider';

export type Lang = 'en' | 'tr';

const T = {
  en: {
    title: 'Settings',
    back: '← Back',
    lang: 'LANGUAGE',
    audio: 'SOUND',
    music: 'Music',
    game: 'Game Sound',
    rate: 'RATE THE APP',
    rateBtn: '⭐  Rate the App',
    soon: 'Coming Soon',
  },
  tr: {
    title: 'Ayarlar',
    back: '← Geri',
    lang: 'DİL',
    audio: 'SES',
    music: 'Müzik',
    game: 'Oyun Sesi',
    rate: 'BİZİ OYLA',
    rateBtn: '⭐  Bizi Oyla',
    soon: 'Yakında',
  },
};

interface Props {
  language: Lang;
  musicVolume: number;
  gameVolume: number;
  onChangeLanguage: (lang: Lang) => void;
  onChangeMusicVolume: (vol: number) => void;
  onChangeGameVolume: (vol: number) => void;
  onBack: () => void;
}

const SettingsScreen: React.FC<Props> = ({
  language,
  musicVolume,
  gameVolume,
  onChangeLanguage,
  onChangeMusicVolume,
  onChangeGameVolume,
  onBack,
}) => {
  const t = T[language];

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onBack} style={styles.backBtn} activeOpacity={0.7}>
            <Text style={styles.backText}>{t.back}</Text>
          </TouchableOpacity>
          <Text style={styles.title}>{t.title}</Text>
          <View style={{ width: 90 }} />
        </View>

        {/* Language */}
        <Text style={styles.sectionLabel}>{t.lang}</Text>
        <View style={styles.card}>
          <View style={styles.langRow}>
            <TouchableOpacity
              style={[styles.langBtn, language === 'en' && styles.langBtnActive]}
              onPress={() => onChangeLanguage('en')}
              activeOpacity={0.8}
            >
              <Text style={[styles.langBtnText, language === 'en' && styles.langBtnTextActive]}>
                English
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.langBtn, language === 'tr' && styles.langBtnActive]}
              onPress={() => onChangeLanguage('tr')}
              activeOpacity={0.8}
            >
              <Text style={[styles.langBtnText, language === 'tr' && styles.langBtnTextActive]}>
                Türkçe
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Audio */}
        <Text style={styles.sectionLabel}>{t.audio}</Text>
        <View style={styles.card}>
          <View style={styles.sliderRow}>
            <Text style={styles.sliderLabel}>{t.music}</Text>
            <Text style={styles.sliderValue}>{musicVolume}%</Text>
          </View>
          <VolumeSlider value={musicVolume} onChange={onChangeMusicVolume} />

          <View style={styles.divider} />

          <View style={styles.sliderRow}>
            <Text style={styles.sliderLabel}>{t.game}</Text>
            <Text style={styles.sliderValue}>{gameVolume}%</Text>
          </View>
          <VolumeSlider value={gameVolume} onChange={onChangeGameVolume} />
        </View>

        {/* Rate */}
        <Text style={styles.sectionLabel}>{t.rate}</Text>
        <View style={styles.card}>
          <TouchableOpacity
            style={styles.rateBtn}
            disabled
            activeOpacity={1}
          >
            <Text style={styles.rateBtnText}>{t.rateBtn}</Text>
            <Text style={styles.rateSoonText}>{t.soon}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#064e3b',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  scroll: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 60,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 36,
  },
  backBtn: {
    paddingVertical: 8,
    paddingRight: 16,
    width: 90,
  },
  backText: {
    color: '#eab84e',
    fontSize: 15,
    fontWeight: '600',
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: '#ffffff',
    textAlign: 'center',
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.4)',
    letterSpacing: 1.4,
    marginBottom: 10,
    marginLeft: 2,
  },
  card: {
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 28,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.09)',
  },
  langRow: {
    flexDirection: 'row',
    gap: 12,
  },
  langBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  langBtnActive: {
    backgroundColor: '#eab84e',
    borderColor: '#eab84e',
    shadowColor: '#eab84e',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
  },
  langBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.5)',
  },
  langBtnTextActive: {
    color: '#1a1a1a',
    fontWeight: '700',
  },
  sliderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  sliderLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#ffffff',
  },
  sliderValue: {
    fontSize: 15,
    fontWeight: '700',
    color: '#eab84e',
    minWidth: 44,
    textAlign: 'right',
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.08)',
    marginVertical: 22,
  },
  rateBtn: {
    alignItems: 'center',
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  rateBtnText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.3)',
  },
  rateSoonText: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.2)',
    marginTop: 5,
    letterSpacing: 0.5,
  },
});

export default SettingsScreen;
