export type Suit = '♣' | '♥' | '♦' | '♠';
export type Rank = 'A' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | 'J' | 'Q' | 'K';

export interface CardType {
  rank: Rank;
  suit: Suit;
  value: number;
  isHidden?: boolean;
}

export interface PlayerHand {
  cards: CardType[];
  bet: number;
  isFinished: boolean;
  status: 'PLAYING' | 'BUST' | 'STAND' | 'BLACKJACK';
  isDoubled?: boolean;
  result?: 'WIN' | 'LOSS' | 'PUSH' | 'BLACKJACK';
}

export type GameStatus = 'BETTING' | 'PLAYING' | 'DEALER_TURN' | 'GAME_OVER';

export interface GameState {
  money: number;
  playerHands: PlayerHand[];
  activeHandIndex: number;
  dealerHand: CardType[];
  deck: CardType[];
  status: GameStatus;
  message: string;
}
