
import React from 'react';
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

  const handWidth = cards.length > 0 ? (cards.length - 1) * 24 + (56) : 0;
  const isWinner = hand?.result === 'WIN' || hand?.result === 'BLACKJACK';

  return (
    <div className={`flex flex-col items-center w-full transition-opacity duration-500 ${cards.length === 0 ? 'opacity-0' : 'opacity-100'}`}>
      <div className={`relative flex justify-center w-full h-[100px] md:h-[130px] rounded-xl transition-all duration-700 ${isWinner ? 'hand-win-glow scale-105' : ''}`}>
        <div className={`absolute inset-0 mx-auto w-32 h-32 md:w-48 md:h-48 rounded-full blur-[60px] opacity-10 pointer-events-none ${position === 'top' ? 'bg-red-500 -top-10' : 'bg-blue-500 -bottom-10'}`} />
        
        {showValue && cards.length > 0 && (
          <div 
            className={`absolute left-1/2 -translate-x-1/2 z-[50] transition-all duration-300 flex flex-col items-center gap-1 ${
              position === 'top' ? 'top-[90px] md:top-[120px]' : '-top-7 md:-top-10'
            }`}
          >
            {hand?.isDoubled && (
              <span className="bg-amber-500 text-[8px] font-black text-black px-1.5 rounded-sm uppercase tracking-tighter">Double</span>
            )}
            <div className={`
              ${position === 'top' ? 'ios-glass text-white/90 border-white/10' : 'bg-amber-500 text-black border-amber-300'} 
              px-3 py-0.5 rounded-full text-[10px] md:text-xs font-black shadow-2xl border flex items-center justify-center min-w-[32px]
            `}>
              {displayValue()}
            </div>
          </div>
        )}

        <div className="relative" style={{ width: `${handWidth}px` }}>
          {cards.map((card, idx) => (
            <div 
              key={`${idx}-${card.rank}-${card.suit}`} 
              className="absolute top-0 left-0" 
              style={{ 
                transform: `translateX(${idx * 24}px)`,
                zIndex: idx 
              }}
            >
               <Card card={card} index={idx} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
