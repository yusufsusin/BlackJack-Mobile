
import React, { useEffect, useRef } from 'react';
import { StyleSheet, View, Text, Dimensions, Animated, Easing } from 'react-native';
import { CardType } from '../types';

interface CardProps {
  card: CardType;
  index: number;
}

const { width } = Dimensions.get('window');
const isSmallDevice = width < 380;

const CARD_WIDTH = isSmallDevice ? 56 : 72;
const CARD_HEIGHT = isSmallDevice ? 80 : 100;

export const Card: React.FC<CardProps> = ({ card, index }) => {
  const isRed = card.suit === '♥' || card.suit === '♦';
  const dealAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(dealAnim, {
      toValue: 1,
      duration: 300,
      delay: index * 100,
      easing: Easing.out(Easing.quad),
      useNativeDriver: true,
    }).start();
  }, [index]);

  const animatedStyle = {
    opacity: dealAnim,
    transform: [
      { translateY: dealAnim.interpolate({ inputRange: [0, 1], outputRange: [-20, 0] }) },
      { scale: dealAnim.interpolate({ inputRange: [0, 1], outputRange: [0.8, 1] }) }
    ]
  } as any;

  if (card.isHidden) {
    return (
      <Animated.View style={[styles.card, styles.cardHidden, animatedStyle]}>
        <View style={styles.cardHiddenInner}>
          <View style={styles.appleLogoContainer}>
            <Text style={styles.appleLogo}></Text>
          </View>
        </View>
      </Animated.View>
    );
  }

  return (
    <Animated.View style={[styles.card, animatedStyle]}>
      <View style={styles.cardInfo}>
        <Text style={[styles.cardRank, isRed && styles.textRed]}>{card.rank}</Text>
        <Text style={[styles.cardSuitSmall, isRed && styles.textRed]}>{card.suit}</Text>
      </View>

      <View style={styles.centerSuitContainer}>
        <Text style={[styles.centerSuit, isRed && styles.textRed]}>{card.suit}</Text>
      </View>

      <View style={styles.cardInfoBottom}>
        <Text style={[styles.cardRank, isRed && styles.textRed]}>{card.rank}</Text>
        <Text style={[styles.cardSuitSmall, isRed && styles.textRed]}>{card.suit}</Text>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  card: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
    position: 'relative',
    overflow: 'hidden',
  },
  cardHidden: {
    backgroundColor: '#1d4ed8', // blue-700
    borderWidth: 2,
    borderColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardHiddenInner: {
    padding: 2,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    borderRadius: 6,
    width: '90%',
    height: '90%',
    backgroundColor: '#2563eb', // blue-600
    justifyContent: 'center',
    alignItems: 'center',
  },
  appleLogoContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  appleLogo: {
    color: 'rgba(255,255,255,0.2)',
    fontSize: 16,
    fontWeight: 'bold',
  },
  cardInfo: {
    alignItems: 'flex-start',
  },
  cardInfoBottom: {
    position: 'absolute',
    bottom: 6,
    right: 6,
    transform: [{ rotate: '180deg' }],
    alignItems: 'flex-start',
  },
  cardRank: {
    fontSize: 16,
    fontWeight: '900',
    lineHeight: 16,
    color: 'black',
  },
  cardSuitSmall: {
    fontSize: 10,
    color: 'black',
  },
  centerSuitContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    opacity: 0.1,
  },
  centerSuit: {
    fontSize: 32,
    color: 'black',
  },
  textRed: {
    color: '#c62828',
  }
});
