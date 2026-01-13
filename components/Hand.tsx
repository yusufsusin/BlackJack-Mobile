
import React from 'react';
import { StyleSheet, View, Text, Dimensions } from 'react-native';
import { CardType, PlayerHand } from '../types';
import { Card } from './Card';
import { calculateHandValue, getBestValue } from '../utils/gameLogic';

interface HandProps {
  cards: CardType[];
  showValue?: boolean;
  position: 'top' | 'bottom';
  isFinished?: boolean;
  hand?: PlayerHand;
}

const { width } = Dimensions.get('window');
const isSmallDevice = width < 380;
const CARD_WIDTH = isSmallDevice ? 56 : 72;
const CARD_OVERLAP = isSmallDevice ? 20 : 25;

export const Hand: React.FC<HandProps> = ({ cards, showValue = true, position, isFinished = false, hand }) => {
  const { total1, total2 } = calculateHandValue(cards);

  const displayValue = () => {
    if (cards.some(c => c.isHidden)) {
      return `${getBestValue(total1, total2)}`;
    }

    if (isFinished) {
      return `${getBestValue(total1, total2)}`;
    }

    if (total1 === 21) return '21';
    if (total1 === total2 || total1 > 21) return `${total2}`;
    return `${total1}/${total2}`;
  };

  const handWidth = cards.length > 0 ? (cards.length - 1) * CARD_OVERLAP + CARD_WIDTH : 0;
  const isWinner = hand?.result === 'WIN' || hand?.result === 'BLACKJACK';

  return (
    <View style={[styles.container, cards.length === 0 && styles.hidden]}>
      <View style={[styles.relativeContainer, isWinner && styles.handWinGlow]}>
        {showValue && cards.length > 0 && (
          <View
            style={[
              styles.valueBadgeContainer,
              position === 'top' ? styles.valueTop : styles.valueBottom
            ]}
          >
            {hand?.isDoubled && (
              <View style={styles.doubleBadge}>
                <Text style={styles.doubleBadgeText}>DOUBLE</Text>
              </View>
            )}
            <View style={[
              styles.valueBadge,
              position === 'top' ? styles.valueBadgeTop : styles.valueBadgeBottom
            ]}>
              <Text style={[
                styles.valueText,
                position === 'top' ? styles.valueTextTop : styles.valueTextBottom
              ]}>
                {displayValue()}
              </Text>
            </View>
          </View>
        )}

        <View style={{ width: handWidth, height: isSmallDevice ? 80 : 100 }}>
          {cards.map((card, idx) => (
            <View
              key={`${idx}-${card.rank}-${card.suit}`}
              style={[
                styles.cardWrapper,
                { left: idx * CARD_OVERLAP, zIndex: idx }
              ]}
            >
              <Card card={card} index={idx} />
            </View>
          ))}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    width: '100%',
  },
  hidden: {
    opacity: 0,
  },
  relativeContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    paddingVertical: 10,
  },
  handWinGlow: {
    backgroundColor: 'rgba(74, 222, 128, 0.1)',
    borderRadius: 20,
  },
  valueBadgeContainer: {
    position: 'absolute',
    left: '50%',
    transform: [{ translateX: -20 }],
    zIndex: 50,
    alignItems: 'center',
    gap: 2,
  },
  valueTop: {
    top: isSmallDevice ? 85 : 105,
  },
  valueBottom: {
    top: -25,
  },
  doubleBadge: {
    backgroundColor: '#f59e0b',
    paddingHorizontal: 4,
    borderRadius: 2,
  },
  doubleBadgeText: {
    fontSize: 8,
    fontWeight: '900',
    color: 'black',
  },
  valueBadge: {
    paddingHorizontal: 10,
    paddingVertical: 2,
    borderRadius: 12,
    borderWidth: 1,
    minWidth: 32,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
  },
  valueBadgeTop: {
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderColor: 'rgba(255,255,255,0.1)',
  },
  valueBadgeBottom: {
    backgroundColor: '#f59e0b',
    borderColor: '#FCD34D',
  },
  valueText: {
    fontSize: 10,
    fontWeight: '900',
  },
  valueTextTop: {
    color: 'white',
  },
  valueTextBottom: {
    color: 'black',
  },
  cardWrapper: {
    position: 'absolute',
    top: 0,
  }
});
