
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
  let t1 = 0;
  let t2 = 0;
  let aces = 0;

  hand.forEach(card => {
    if (card.isHidden) return;
    if (card.rank === 'A') {
      aces += 1;
      t1 += 11;
      t2 += 1;
    } else {
      t1 += card.value;
      t2 += card.value;
    }
  });

  // Re-evaluating totals like in the python logic
  // If t1 > 21, it should effectively become t2. 
  // However, the Python script shows dual totals when applicable (e.g., 18/8).
  return { total1: t1, total2: t2 };
};

export const getBestValue = (total1: number, total2: number): number => {
  if (total1 <= 21) return total1;
  return total2;
};
