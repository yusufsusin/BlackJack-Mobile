
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { GameStatus, CardType, GameState, PlayerHand } from './types';
import { createDeck, calculateHandValue, getBestValue } from './utils/gameLogic';
import { Hand } from './components/Hand';
import { INITIAL_MONEY, MIN_BET } from './constants';

interface ChipInPot {
  id: number;
  value: number;
  denom: 10 | 50 | 100;
  offsetX: number;
  offsetY: number;
  rotation: number;
}

interface FlyingChip extends Omit<ChipInPot, 'rotation'> {
  startX: number;
  startY: number;
  targetX: number;
  targetY: number;
  rotation: number;
}

const CasinoChip: React.FC<{ 
  value: number; 
  denom: 10 | 50 | 100; 
  sizeClass?: string; 
  className?: string; 
  style?: React.CSSProperties;
}> = ({ value, denom, sizeClass = "w-14 h-14 md:w-16 md:h-16", className = "", style }) => {
  const chipClass = `chip-${denom}`;
  
  let textScaleClass = "text-lg md:text-2xl";
  if (value >= 100) {
    textScaleClass = "text-sm md:text-lg"; 
  }

  return (
    <div className={`chip-base ${chipClass} ${sizeClass} ${className}`} style={style}>
      <div className="chip-edge-spots"></div>
      <div className="chip-inner-ring"></div>
      <div className="chip-sheen"></div>
      <div className="chip-inlay">
        <span className={`${textScaleClass} font-black text-black leading-none drop-shadow-sm tracking-tighter`}>
          ${value}
        </span>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>({
    money: INITIAL_MONEY,
    playerHands: [],
    activeHandIndex: 0,
    dealerHand: [],
    deck: [],
    status: 'BETTING',
    message: '',
  });

  const [tempBet, setTempBet] = useState(0);
  const [chipsInPot, setChipsInPot] = useState<ChipInPot[]>([]);
  const [flyingChips, setFlyingChips] = useState<FlyingChip[]>([]);
  const [isPotPopping, setIsPotPopping] = useState(false);
  const [activePulseDenom, setActivePulseDenom] = useState<number | null>(null);
  const potRef = useRef<HTMLDivElement>(null);

  const startNewGame = useCallback(() => {
    if (tempBet < MIN_BET) {
      setGameState(prev => ({ ...prev, message: `MIN BET IS $${MIN_BET}` }));
      return;
    }
    if (tempBet > gameState.money) {
      setGameState(prev => ({ ...prev, message: "INSUFFICIENT FUNDS" }));
      return;
    }

    const newDeck = createDeck();
    const p1 = newDeck.pop()!;
    const d1 = newDeck.pop()!;
    const p2 = newDeck.pop()!;
    const d2 = { ...newDeck.pop()!, isHidden: true } as CardType;

    const initialPlayerHand: PlayerHand = {
      cards: [p1, p2],
      bet: tempBet,
      isFinished: false,
      status: 'PLAYING'
    };

    const { total1 } = calculateHandValue(initialPlayerHand.cards);
    if (total1 === 21) {
        initialPlayerHand.status = 'BLACKJACK';
        initialPlayerHand.isFinished = true;
    }

    setGameState(prev => ({
      ...prev,
      money: prev.money - tempBet,
      deck: newDeck,
      playerHands: [initialPlayerHand],
      activeHandIndex: 0,
      dealerHand: [d1, d2],
      status: initialPlayerHand.status === 'BLACKJACK' ? 'DEALER_TURN' : 'PLAYING',
      message: initialPlayerHand.status === 'BLACKJACK' ? 'BLACKJACK!' : 'YOUR MOVE',
    }));
  }, [tempBet, gameState.money]);

  const split = () => {
    const currentHand = gameState.playerHands[gameState.activeHandIndex];
    const extraBet = currentHand.bet;

    if (gameState.money < extraBet) {
      setGameState(prev => ({ ...prev, message: "NOT ENOUGH CASH TO SPLIT" }));
      return;
    }

    const newDeck = [...gameState.deck];
    const card1 = currentHand.cards[0];
    const card2 = currentHand.cards[1];

    const newCardForHand1 = newDeck.pop()!;
    const newCardForHand2 = newDeck.pop()!;

    const isAces = card1.rank === 'A';

    const hand1: PlayerHand = {
      cards: [card1, newCardForHand1],
      bet: extraBet,
      isFinished: isAces,
      status: 'PLAYING'
    };

    const hand2: PlayerHand = {
      cards: [card2, newCardForHand2],
      bet: extraBet,
      isFinished: isAces,
      status: 'PLAYING'
    };

    if (!isAces) {
      const v1 = calculateHandValue(hand1.cards);
      if (getBestValue(v1.total1, v1.total2) === 21) {
        hand1.status = 'STAND';
        hand1.isFinished = true;
      }
    }

    const id = Date.now();
    const potRect = potRef.current?.getBoundingClientRect();
    if (potRect) {
        const offsetX = (Math.random() - 0.5) * 80;
        const offsetY = (Math.random() - 0.5) * 40;
        const rotation = (Math.random() - 0.5) * 60;
        const denom = extraBet >= 100 ? 100 : (extraBet >= 50 ? 50 : 10);
        setChipsInPot(prev => [...prev, { id, value: extraBet, denom: denom as any, offsetX, offsetY, rotation }]);
    }

    setIsPotPopping(true);
    setTimeout(() => setIsPotPopping(false), 300);

    const nextHands = [hand1, hand2];
    let nextActiveIndex = 0;
    let nextStatus: GameStatus = 'PLAYING';
    let nextDealerHand = gameState.dealerHand;

    if (isAces) {
      nextStatus = 'DEALER_TURN';
      nextDealerHand = gameState.dealerHand.map(c => ({ ...c, isHidden: false }));
    } else if (hand1.isFinished) {
      nextActiveIndex = 1;
      const v2 = calculateHandValue(hand2.cards);
      if (getBestValue(v2.total1, v2.total2) === 21) {
        hand2.status = 'STAND';
        hand2.isFinished = true;
        nextStatus = 'DEALER_TURN';
        nextDealerHand = gameState.dealerHand.map(c => ({ ...c, isHidden: false }));
      }
    }

    setGameState(prev => ({
      ...prev,
      money: prev.money - extraBet,
      deck: newDeck,
      playerHands: nextHands,
      activeHandIndex: nextActiveIndex,
      status: nextStatus,
      dealerHand: nextDealerHand,
      message: isAces ? 'ACES SPLIT - ONE CARD EACH' : (hand1.isFinished ? 'HAND 1 COMPLETED' : 'HAND 1 ACTIVE'),
    }));
  };

  const hit = () => {
    const newDeck = [...gameState.deck];
    const newCard = newDeck.pop()!;
    const newHands = [...gameState.playerHands];
    const currentHand = { ...newHands[gameState.activeHandIndex] };
    
    currentHand.cards = [...currentHand.cards, newCard];
    const { total2 } = calculateHandValue(currentHand.cards);

    if (total2 > 21) {
      currentHand.status = 'BUST';
      currentHand.isFinished = true;
      moveToNextHand(newHands, currentHand, newDeck);
    } else {
      newHands[gameState.activeHandIndex] = currentHand;
      setGameState(prev => ({
        ...prev,
        playerHands: newHands,
        deck: newDeck
      }));
    }
  };

  const doubleDown = () => {
    const currentHand = gameState.playerHands[gameState.activeHandIndex];
    const extraBet = currentHand.bet;
    
    if (gameState.money < extraBet) {
      setGameState(prev => ({ ...prev, message: "NOT ENOUGH CASH TO DOUBLE" }));
      return;
    }

    const newDeck = [...gameState.deck];
    const newCard = newDeck.pop()!;
    const newHands = [...gameState.playerHands];
    const updatedHand = { ...currentHand };
    
    updatedHand.cards = [...updatedHand.cards, newCard];
    updatedHand.bet = currentHand.bet * 2;
    updatedHand.isDoubled = true;
    updatedHand.isFinished = true;
    
    const { total2 } = calculateHandValue(updatedHand.cards);
    updatedHand.status = total2 > 21 ? 'BUST' : 'STAND';

    const id = Date.now();
    const potRect = potRef.current?.getBoundingClientRect();
    if (potRect) {
        const offsetX = (Math.random() - 0.5) * 80;
        const offsetY = (Math.random() - 0.5) * 40;
        const rotation = (Math.random() - 0.5) * 60;
        const denom = extraBet >= 100 ? 100 : (extraBet >= 50 ? 50 : 10);
        setChipsInPot(prev => [...prev, { id, value: extraBet, denom: denom as any, offsetX, offsetY, rotation }]);
    }

    setIsPotPopping(true);
    setTimeout(() => setIsPotPopping(false), 300);

    setGameState(prev => ({
      ...prev,
      money: prev.money - extraBet,
      deck: newDeck,
      message: updatedHand.status === 'BUST' ? 'BUSTED ON DOUBLE!' : 'DOUBLED DOWN'
    }));

    moveToNextHand(newHands, updatedHand, newDeck);
  };

  const stand = () => {
    const newHands = [...gameState.playerHands];
    const currentHand = { ...newHands[gameState.activeHandIndex] };
    currentHand.status = 'STAND';
    currentHand.isFinished = true;
    moveToNextHand(newHands, currentHand, gameState.deck);
  };

  const moveToNextHand = (hands: PlayerHand[], updatedHand: PlayerHand, deck: CardType[]) => {
    hands[gameState.activeHandIndex] = updatedHand;
    const nextIndex = gameState.activeHandIndex + 1;

    if (nextIndex < hands.length) {
      setGameState(prev => ({
        ...prev,
        playerHands: hands,
        activeHandIndex: nextIndex,
        deck: deck,
        message: `HAND ${nextIndex + 1} ACTIVE`
      }));
    } else {
      setGameState(prev => ({
        ...prev,
        playerHands: hands,
        status: 'DEALER_TURN',
        deck: deck,
        dealerHand: prev.dealerHand.map(c => ({ ...c, isHidden: false }))
      }));
    }
  };

  useEffect(() => {
    if (gameState.status === 'DEALER_TURN') {
      const runDealerTurn = async () => {
        await new Promise(resolve => setTimeout(resolve, 1200));

        let currentDealerHand: CardType[] = [...gameState.dealerHand].map(c => ({ ...c, isHidden: false }));
        let currentDeck = [...gameState.deck];
        let { total1: dt1, total2: dt2 } = calculateHandValue(currentDealerHand);
        
        while (dt1 < 17 || (dt1 > 21 && dt2 < 17)) {
          await new Promise(resolve => setTimeout(resolve, 1000));
          const newCard = currentDeck.pop()!;
          currentDealerHand.push(newCard);
          const nextVal = calculateHandValue(currentDealerHand);
          dt1 = nextVal.total1;
          dt2 = nextVal.total2;
          
          setGameState(prev => ({
            ...prev,
            dealerHand: [...currentDealerHand],
            deck: [...currentDeck]
          }));
        }

        const dealerBest = getBestValue(dt1, dt2);
        let finalMoney = gameState.money;
        let messages: string[] = [];

        const updatedHands = gameState.playerHands.map((hand, idx) => {
          const { total1, total2 } = calculateHandValue(hand.cards);
          const playerBest = getBestValue(total1, total2);
          const prefix = gameState.playerHands.length > 1 ? `H${idx + 1}: ` : '';
          
          const updatedHand = { ...hand };

          if (playerBest > 21) {
            messages.push(`${prefix}BUSTED`);
            updatedHand.result = 'LOSS';
            return updatedHand;
          }
          
          if (dealerBest > 21 || playerBest > dealerBest) {
            const isBlackjack = hand.status === 'BLACKJACK';
            const winAmount = isBlackjack ? hand.bet * 2.5 : hand.bet * 2;
            finalMoney += winAmount;
            messages.push(isBlackjack ? `${prefix}BLACKJACK!` : `${prefix}YOU WIN`);
            updatedHand.result = isBlackjack ? 'BLACKJACK' : 'WIN';
          } else if (playerBest === dealerBest) {
            finalMoney += hand.bet;
            messages.push(`${prefix}PUSH`);
            updatedHand.result = 'PUSH';
          } else {
            messages.push(`${prefix}YOU LOST`);
            updatedHand.result = 'LOSS';
          }
          return updatedHand;
        });

        setGameState(prev => ({
          ...prev,
          money: finalMoney,
          status: 'GAME_OVER',
          playerHands: updatedHands,
          message: messages.join(' | ')
        }));
      };

      runDealerTurn();
    }
  }, [gameState.status]);

  const resetGame = () => {
    setGameState(prev => ({
      ...prev,
      status: 'BETTING',
      message: '',
      playerHands: [],
      dealerHand: [],
      activeHandIndex: 0
    }));
    setTempBet(0);
    setChipsInPot([]);
  };

  const addChip = (value: number, denom: 10 | 50 | 100, e: React.MouseEvent<HTMLButtonElement>) => {
    if (gameState.money < tempBet + value) return;
    
    setActivePulseDenom(denom);
    setTimeout(() => setActivePulseDenom(null), 400);

    const id = Date.now();
    const rect = e.currentTarget.getBoundingClientRect();
    const potRect = potRef.current?.getBoundingClientRect();

    if (potRect) {
      const offsetX = (Math.random() - 0.5) * 80;
      const offsetY = (Math.random() - 0.5) * 40;
      const rotation = (Math.random() - 0.5) * 60;
      const targetX = (potRect.left + potRect.width / 2 - rect.width / 2) + offsetX;
      const targetY = (potRect.top + potRect.height / 2 - rect.height / 2) + offsetY;
      
      const newChip: FlyingChip = { id, value, denom, startX: rect.left, startY: rect.top, targetX: targetX - rect.left, targetY: targetY - rect.top, offsetX, offsetY, rotation };
      setFlyingChips(prev => [...prev, newChip]);
      setTimeout(() => {
        setChipsInPot(prev => [...prev, { id, value, denom, offsetX, offsetY, rotation }]);
        setFlyingChips(prev => prev.filter(c => c.id !== id));
        setTempBet(v => v + value);
        setIsPotPopping(true);
        setTimeout(() => setIsPotPopping(false), 300);
      }, 500);
    }
  };

  const currentActiveHand = gameState.playerHands[gameState.activeHandIndex];

  const canSplit = gameState.status === 'PLAYING' && 
                   gameState.playerHands.length === 1 && 
                   currentActiveHand?.cards.length === 2 && 
                   currentActiveHand.cards[0].rank === currentActiveHand.cards[1].rank &&
                   gameState.money >= currentActiveHand.bet;

  const canDouble = gameState.status === 'PLAYING' && 
                    currentActiveHand?.cards.length === 2 &&
                    gameState.money >= currentActiveHand.bet;

  const isUserWinning = gameState.status === 'GAME_OVER' && (gameState.message.includes('WIN') || gameState.message.includes('BLACKJACK'));

  const actionButtonCount = 2 + (canDouble ? 1 : 0) + (canSplit ? 1 : 0);
  const actionGridCols = actionButtonCount === 3 ? 'grid-cols-3' : 'grid-cols-2';

  return (
    <div className="flex flex-col h-screen felt-bg p-4 select-none overflow-hidden relative">
      {flyingChips.map(chip => (
        <CasinoChip
          key={chip.id}
          value={chip.value}
          denom={chip.denom}
          className="fixed z-[100] animate-fly pointer-events-none"
          style={{ 
            left: chip.startX, 
            top: chip.startY, 
            '--tw-translate-x': `${chip.targetX}px`, 
            '--tw-translate-y': `${chip.targetY}px` 
          } as React.CSSProperties}
        />
      ))}

      <div className="flex justify-between items-center px-4 py-2 ios-glass rounded-2xl shadow-xl mt-safe border border-white/5">
        <div className="flex flex-col">
          <span className="text-[9px] text-white/40 font-black uppercase tracking-widest">Bankroll</span>
          <span className="text-lg font-black text-green-400 leading-none">${gameState.money}</span>
        </div>
        <div className="flex flex-col items-end">
          <span className="text-[8px] text-white/40 font-black uppercase tracking-widest italic leading-none">Blackjack 3:2</span>
          <span className="text-[10px] font-black text-white/20 uppercase tracking-tighter">S17 Stand</span>
        </div>
      </div>

      <div className="flex-1 flex flex-col justify-around py-1 relative min-h-0 overflow-y-auto">
        <div className="w-full flex justify-center pt-6">
          <Hand 
            position="top" 
            cards={gameState.dealerHand} 
            isFinished={gameState.status === 'GAME_OVER'} 
          />
        </div>

        <div className="text-center px-4 h-6 flex items-center justify-center my-1">
           <h2 className={`text-base md:text-lg font-black tracking-tighter uppercase italic drop-shadow-lg transition-all duration-500 ${isUserWinning ? 'text-green-400 scale-105' : 'text-white/90'}`}>
             {gameState.message}
           </h2>
        </div>

        <div className={`w-full flex ${gameState.playerHands.length > 1 ? 'flex-row justify-around' : 'flex-col items-center'} transition-all duration-500`}>
          {gameState.playerHands.map((hand, idx) => (
            <div key={idx} className={`flex flex-col items-center transition-all duration-300 ${gameState.activeHandIndex === idx ? 'scale-100 opacity-100' : 'scale-90 opacity-40 grayscale'}`}>
              <Hand 
                position="bottom" 
                cards={hand.cards} 
                isFinished={hand.isFinished || gameState.status === 'GAME_OVER'} 
                hand={hand}
              />
            </div>
          ))}
        </div>
      </div>

      <div className="pb-8 pt-1 px-1 flex flex-col gap-1">
        <div className="relative flex flex-col items-center">
          <div className={`backdrop-blur-xl px-4 py-1 rounded-full border flex items-center gap-2 shadow-2xl transition-all duration-300 ${tempBet > 0 || gameState.playerHands.length > 0 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'} bg-black/80 border-white/10 z-[60]`}>
             <span className="text-[10px] font-black uppercase tracking-widest text-white/40">BET</span>
             <span className="text-base font-black text-amber-400">
               ${gameState.status === 'BETTING' ? tempBet : gameState.playerHands.reduce((acc, h) => acc + h.bet, 0)}
             </span>
          </div>

          <div ref={potRef} className={`pot-zone w-full h-24 rounded-[30px] flex items-center justify-center transition-all relative mt-1 ${isPotPopping ? 'animate-pop' : ''}`}>
            {isUserWinning && (
              <div className="absolute inset-0 bg-green-500/20 rounded-[30px] win-glow blur-2xl" />
            )}
            
            {chipsInPot.map((chip, idx) => (
              <CasinoChip
                key={chip.id}
                value={chip.value}
                denom={chip.denom}
                sizeClass="w-12 h-12"
                className={`absolute ${isUserWinning ? 'animate-win-bounce' : 'animate-land'}`}
                style={{ 
                  zIndex: idx,
                  '--land-x': `${chip.offsetX}px`,
                  '--land-y': `${chip.offsetY}px`,
                  '--land-rot': `${chip.rotation}deg`
                } as React.CSSProperties}
              />
            ))}
            {chipsInPot.length === 0 && gameState.status === 'BETTING' && <span className="text-[10px] font-black text-white/5 uppercase tracking-[0.5em]">Bet Area</span>}
          </div>
        </div>

        {gameState.status === 'BETTING' && (
          <div className="flex flex-col gap-2">
             <div className="flex justify-center gap-4">
                <button onClick={(e) => addChip(10, 10, e)} className="outline-none">
                  <CasinoChip value={10} denom={10} className={activePulseDenom === 10 ? 'chip-active-pulse' : ''} />
                </button>
                <button onClick={(e) => addChip(50, 50, e)} className="outline-none">
                  <CasinoChip value={50} denom={50} className={activePulseDenom === 50 ? 'chip-active-pulse' : ''} />
                </button>
                <button onClick={(e) => addChip(100, 100, e)} className="outline-none">
                  <CasinoChip value={100} denom={100} className={activePulseDenom === 100 ? 'chip-active-pulse' : ''} />
                </button>
             </div>
             <button onClick={startNewGame} disabled={tempBet < MIN_BET} className={`w-full py-3.5 rounded-[18px] text-lg font-black uppercase tracking-tight shadow-xl transition-all border-t border-amber-200/30 ${tempBet >= MIN_BET ? 'bg-gradient-to-b from-amber-300 via-amber-500 to-amber-700 text-black active:scale-[0.96]' : 'bg-white/5 text-white/20 opacity-50 cursor-not-allowed'}`}>
               {tempBet < MIN_BET ? `MIN BET $${MIN_BET}` : 'DEAL CARDS'}
             </button>
          </div>
        )}

        {gameState.status === 'PLAYING' && (
          <div className="flex flex-col gap-2 mt-2">
            <div className={`grid ${actionGridCols} gap-3`}>
              <button 
                onClick={hit} 
                className="bg-white text-black py-4 rounded-[18px] text-lg font-black uppercase shadow-xl active:scale-[0.96] border-b-6 border-gray-300"
              >
                HIT
              </button>
              <button 
                onClick={stand} 
                className="bg-red-600 text-white py-4 rounded-[18px] text-lg font-black uppercase shadow-xl active:scale-[0.96] border-b-6 border-red-800"
              >
                STAND
              </button>
              
              {canDouble && (
                <button 
                  onClick={doubleDown} 
                  className="bg-amber-500 text-black py-4 rounded-[18px] text-lg font-black uppercase shadow-xl active:scale-[0.96] border-b-6 border-amber-700"
                >
                  DOUBLE
                </button>
              )}
              {canSplit && (
                <button 
                  onClick={split} 
                  className={`bg-blue-500 text-white py-4 rounded-[18px] text-lg font-black uppercase shadow-xl active:scale-[0.96] border-b-6 border-blue-700 ${actionButtonCount === 3 ? 'col-span-3' : 'col-span-1'}`}
                >
                  SPLIT
                </button>
              )}
            </div>
          </div>
        )}

        {gameState.status === 'GAME_OVER' && (
          <button onClick={resetGame} className="w-full bg-gradient-to-b from-amber-300 to-amber-600 py-4 rounded-[18px] text-lg font-black text-black uppercase shadow-lg active:scale-[0.96] mt-2">NEXT HAND</button>
        )}
      </div>
    </div>
  );
};

export default App;
