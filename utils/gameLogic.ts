
import { CardType, Rank, Suit } from '../types';
import { SUITS, RANKS } from '../constants';

export const createDeck = (): CardType[] => {
  const deck: CardType[] = [];
  // Standard Blackjack often uses multiple decks, but we'll follow the Python's 4-deck approach
  for (let i = 0; i < 4; i++) {
    for (const suit of SUITS) {
      for (const rank of RANKS) {
        let value = 0;
        if (rank === 'A') value = 11;
        else if (['J', 'Q', 'K'].includes(rank)) value = 10;
        else value = parseInt(rank);

        deck.push({ rank, suit, value });
      }
    }
  }
  return shuffle(deck);
};

export const shuffle = (deck: CardType[]): CardType[] => {
  const newDeck = [...deck];
  for (let i = newDeck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newDeck[i], newDeck[j]] = [newDeck[j], newDeck[i]];
  }
  return newDeck;
};

export const calculateHandValue = (hand: CardType[]): { total1: number; total2: number } => {
  let hardTotal = 0;
  let hasAce = false;

  hand.forEach(card => {
    if (card.isHidden) return;
    if (card.rank === 'A') {
      hasAce = true;
      hardTotal += 1;
    } else {
      hardTotal += card.value;
    }
  });

  let softTotal = hardTotal;
  if (hasAce && hardTotal + 10 <= 21) {
    softTotal = hardTotal + 10;
  }

  return { total1: softTotal, total2: hardTotal };
};

export const getBestValue = (total1: number, total2: number): number => {
  if (total1 <= 21) return total1;
  return total2;
};

export const isBlackjack = (hand: CardType[]): boolean => {
  if (hand.length !== 2) return false;
  const { total1 } = calculateHandValue(hand);
  return total1 === 21;
};
