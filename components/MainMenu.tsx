import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Animated,
  Easing,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Platform,
} from 'react-native';

interface Props {
  onStartClassic: () => void;
  onOpenSettings: () => void;
  onOpenStats: () => void;
  language: 'tr' | 'en';
  highScore: number;
}

const MainMenu: React.FC<Props> = ({ onStartClassic, onOpenSettings, onOpenStats, language, highScore }) => {
  const spinValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const anim = Animated.loop(
      Animated.timing(spinValue, {
        toValue: 1,
        duration: 2200,
        easing: Easing.linear,
        useNativeDriver: false,
      })
    );
    anim.start();
    return () => anim.stop();
  }, []);

  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <View style={styles.content}>

        {/* Title — top */}
        <Text style={styles.title}>Blackjack Ultimate</Text>

        {/* Spinning Ace Card — fills middle, centered */}
        <View style={styles.logoContainer}>
          <Animated.View
            style={[
              styles.card,
              { transform: [{ perspective: 600 }, { rotateY: spin }] },
            ]}
          >
            <View style={styles.cardTopLeft}>
              <Text style={styles.cardRank}>A</Text>
              <Text style={styles.cardCornerSuit}>♠</Text>
            </View>
            <Text style={styles.cardCenterSuit}>♠</Text>
            <View style={styles.cardBottomRight}>
              <Text style={[styles.cardRank, { transform: [{ rotate: '180deg' }] }]}>A</Text>
              <Text style={[styles.cardCornerSuit, { transform: [{ rotate: '180deg' }] }]}>♠</Text>
            </View>
          </Animated.View>
        </View>

        {/* Menu Buttons — bottom */}
        <View style={styles.buttons}>
          <TouchableOpacity
            style={styles.classicBtn}
            onPress={onStartClassic}
            activeOpacity={0.8}
          >
            <Text style={styles.classicBtnText}>Classic</Text>
            <View style={styles.classicBtnBadge}>
              <Text style={styles.classicBtnBadgeText}>🏆 ${highScore}</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.soonBtn}
            disabled
            activeOpacity={1}
          >
            <Text style={styles.soonBtnText}>Blackjack + (Soon)</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.statsBtn} onPress={onOpenStats} activeOpacity={0.8}>
            <Text style={styles.statsBtnText}>
              {language === 'tr' ? 'İstatistikler' : 'Statistics'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingsBtn} onPress={onOpenSettings} activeOpacity={0.8}>
            <Text style={styles.settingsBtnText}>{language === 'tr' ? 'Ayarlar' : 'Settings'}</Text>
          </TouchableOpacity>
        </View>

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
    paddingTop: 28,
    paddingBottom: 96,
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
  logoContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: {
    width: 108,
    height: 152,
    backgroundColor: '#ffffff',
    borderRadius: 14,
    padding: 10,
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.6,
    shadowRadius: 14,
    elevation: 18,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.08)',
  },
  cardTopLeft: {
    alignItems: 'flex-start',
  },
  cardBottomRight: {
    alignItems: 'flex-end',
  },
  cardRank: {
    fontSize: 20,
    fontWeight: '900',
    color: '#111111',
    lineHeight: 22,
  },
  cardCornerSuit: {
    fontSize: 14,
    color: '#111111',
    lineHeight: 16,
  },
  cardCenterSuit: {
    fontSize: 58,
    color: '#111111',
    textAlign: 'center',
    position: 'absolute',
    left: 0,
    right: 0,
    top: 47,
  },
  buttons: {
    width: '100%',
    gap: 18,
  },
  classicBtn: {
    backgroundColor: '#deb737',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 32,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#FCD34D',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.45,
    shadowRadius: 12,
    elevation: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.25)',
  },
  classicBtnText: {
    fontSize: 18,
    fontWeight: '900',
    color: '#1a1a1a',
    letterSpacing: 1,
  },
  classicBtnBadge: {
    backgroundColor: 'rgba(0,0,0,0.12)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  classicBtnBadgeText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1a1a1a',
    opacity: 0.75,
  },
  soonBtn: {
    backgroundColor: 'rgba(107,114,128,0.25)',
    paddingVertical: 17,
    borderRadius: 32,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(107,114,128,0.3)',
  },
  soonBtnText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6b7280',
    letterSpacing: 0.3,
  },
  statsBtn: {
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
  statsBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.88)',
    letterSpacing: 0.3,
  },
  settingsBtn: {
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
  settingsBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.88)',
    letterSpacing: 0.3,
  },
});

export default MainMenu;
