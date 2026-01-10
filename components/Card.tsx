
import React from 'react';
import { CardType } from '../types';

interface CardProps {
  card: CardType;
  index: number;
}

export const Card: React.FC<CardProps> = ({ card, index }) => {
  const isRed = card.suit === '♥' || card.suit === '♦';

  if (card.isHidden) {
    return (
      <div 
        className="animate-deal card-animation relative w-14 h-20 md:w-20 md:h-28 bg-blue-700 rounded-lg border-2 border-white flex items-center justify-center shadow-xl overflow-hidden"
        style={{ zIndex: index }}
      >
        <div className="absolute inset-1 border border-white/20 rounded-md bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-600 to-blue-800 flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-white/10 rounded-full flex items-center justify-center text-white/20 font-bold"></div>
        </div>
      </div>
    );
  }

  return (
    <div 
      className={`animate-deal card-animation relative w-14 h-20 md:w-20 md:h-28 bg-white rounded-lg flex flex-col p-1.5 shadow-2xl transition-all hover:-translate-y-1`}
      style={{ zIndex: index }}
    >
      <div className={`text-base md:text-xl font-bold leading-none ${isRed ? 'text-red-600' : 'text-black'}`}>
        {card.rank}
      </div>
      <div className={`text-xs md:text-lg ${isRed ? 'text-red-600' : 'text-black'}`}>
        {card.suit}
      </div>
      <div className="absolute bottom-1.5 right-1.5 rotate-180 flex flex-col items-end">
        <div className={`text-base md:text-xl font-bold leading-none ${isRed ? 'text-red-600' : 'text-black'}`}>
          {card.rank}
        </div>
        <div className={`text-xs md:text-lg ${isRed ? 'text-red-600' : 'text-black'}`}>
          {card.suit}
        </div>
      </div>
      <div className={`absolute inset-0 flex items-center justify-center text-2xl md:text-4xl opacity-10 pointer-events-none ${isRed ? 'text-red-600' : 'text-black'}`}>
        {card.suit}
      </div>
    </div>
  );
};
