import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Platform,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

interface Props {
  language: 'tr' | 'en';
  highScore: number;
  totalGames: number;
  totalWins: number;
  onBack: () => void;
}

const labels = {
  tr: {
    title: 'İstatistikler',
    highScore: 'En Yüksek Bakiye',
    totalGames: 'Toplam Oyun',
    totalWins: 'Kazanılan El',
    back: 'Geri',
  },
  en: {
    title: 'Statistics',
    highScore: 'High Score',
    totalGames: 'Total Games',
    totalWins: 'Total Wins',
    back: 'Back',
  },
};

const StatsScreen: React.FC<Props> = ({ language, highScore, totalGames, totalWins, onBack }) => {
  const t = labels[language];

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <View style={styles.content}>
        <Text style={styles.title}>{t.title}</Text>

        <View style={styles.cardsContainer}>
          <View style={styles.card}>
            <Ionicons name="trophy-outline" size={22} color="#FFD700" style={{ marginRight: 16 }} />
            <Text style={styles.cardLabel}>{t.highScore}</Text>
            <Text style={styles.cardValue}>${highScore}</Text>
          </View>

          <View style={styles.card}>
            <MaterialCommunityIcons name="cards" size={22} color="#FFD700" style={{ marginRight: 16 }} />
            <Text style={styles.cardLabel}>{t.totalGames}</Text>
            <Text style={styles.cardValue}>{totalGames}</Text>
          </View>

          <View style={styles.card}>
            <MaterialCommunityIcons name="check-bold" size={24} color="#FFD700" style={{ marginRight: 16 }} />
            <Text style={styles.cardLabel}>{t.totalWins}</Text>
            <Text style={styles.cardValue}>{totalWins}</Text>
          </View>
        </View>

        <TouchableOpacity style={styles.backBtn} onPress={onBack} activeOpacity={0.8}>
          <Text style={styles.backBtnText}>{t.back}</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#064e3b',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 44,
    paddingTop: 48,
    paddingBottom: 80,
  },
  title: {
    fontSize: 26,
    fontWeight: '900',
    color: '#fcc65a',
    letterSpacing: 0.5,
    textShadowColor: 'rgba(0,0,0,0.6)',
    textShadowOffset: { width: 0, height: 3 },
    textShadowRadius: 8,
  },
  cardsContainer: {
    width: '100%',
    gap: 16,
  },
  card: {
    backgroundColor: 'rgba(0,0,0,0.25)',
    borderRadius: 16,
    paddingVertical: 20,
    paddingHorizontal: 24,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  cardEmoji: {
    fontSize: 20,
    marginRight: 16,
  },
  cardLabel: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.65)',
    letterSpacing: 0.2,
  },
  cardValue: {
    fontSize: 17,
    fontWeight: '900',
    color: '#FFD700',
  },
  backBtn: {
    width: '100%',
    backgroundColor: '#065f46',
    paddingVertical: 17,
    borderRadius: 32,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 6,
  },
  backBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.88)',
    letterSpacing: 0.3,
  },
});

export default StatsScreen;
