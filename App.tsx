
import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  Dimensions,
  Animated,
  Platform,
  StatusBar,
  Easing
} from 'react-native';
import { GameStatus, CardType, GameState, PlayerHand } from './types';
import { createDeck, calculateHandValue, getBestValue, isBlackjack } from './utils/gameLogic';
import { Hand } from './components/Hand';
import { INITIAL_MONEY, MIN_BET } from './constants';
import VolumeSlider from './components/VolumeSlider';

const { width, height } = Dimensions.get('window');

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

interface ChipInPot {
  id: number;
  value: number;
  denom: number;
  offsetX: number;
  offsetY: number;
  rotation: number;
}

const CHIP_CONFIG = [
  { denom: 5, color: '#4caf50', minBalance: 0 },       // Green
  { denom: 10, color: '#c62828', minBalance: 0 },      // Red
  { denom: 25, color: '#1e40af', minBalance: 0 },      // Blue
  { denom: 50, color: '#1a1a1a', minBalance: 200 },    // Black
  { denom: 100, color: '#7b1fa2', minBalance: 500 },   // Purple
  { denom: 250, color: '#f57c00', minBalance: 1000 },  // Orange
  { denom: 500, color: '#ffd700', minBalance: 2500 },  // Gold/Yellow
];


const CasinoChip: React.FC<{
  value: number;
  denom: number;
  size?: number;
  style?: any;
}> = ({ value, denom, size = 60, style }) => {
  const getChipColor = () => {
    const config = CHIP_CONFIG.find(c => c.denom === denom);
    return config ? config.color : '#1a1a1a';
  };

  return (
    <View style={[styles.chipShadowWrapper, { width: size, height: size }, style]}>
      <View style={[
        styles.chipBase,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: getChipColor()
        }
      ]}>
        <View style={[styles.chipInnerRing, { borderRadius: (size - 8) / 2 }]} />
        <View style={[styles.chipInlay, { borderRadius: (size - 16) / 2 }]}>
          <Text
            style={[styles.chipText, { fontSize: size * 0.28 }]}
            numberOfLines={1}
            adjustsFontSizeToFit
          >
            ${value}
          </Text>
        </View>
      </View>
    </View>
  );
};

interface AppProps {
  onGoToMenu?: () => void;
  musicVolume: number;
  gameVolume: number;
  onChangeMusicVolume: (v: number) => void;
  onChangeGameVolume: (v: number) => void;
  initialMoney: number;
  highScore: number;
  onStatsUpdate: (money: number, highScore: number) => void;
}

const App: React.FC<AppProps> = ({
  onGoToMenu,
  musicVolume,
  gameVolume,
  onChangeMusicVolume,
  onChangeGameVolume,
  initialMoney,
  highScore,
  onStatsUpdate,
}) => {
  const [gameState, setGameState] = useState<GameState>({
    money: initialMoney,
    playerHands: [],
    activeHandIndex: 0,
    dealerHand: [],
    deck: [],
    status: 'BETTING',
    message: '',
  });

  const [showSettings, setShowSettings] = useState(false);
  const [tempBet, setTempBet] = useState(0);
  const [chipsInPot, setChipsInPot] = useState<ChipInPot[]>([]);
  const [flyingChips, setFlyingChips] = useState<{ id: number, value: number, denom: number, anim: Animated.ValueXY }[]>([]);
  const [activePulseDenom, setActivePulseDenom] = useState<number | null>(null);

  const [isGameStarted] = useState(true);
  const [showBankruptcy, setShowBankruptcy] = useState(false);


  const potScale = useRef(new Animated.Value(1)).current;
  const bankruptcyOpacity = useRef(new Animated.Value(0)).current;

  const handleBankruptcyReset = () => {
    const resetMoney = INITIAL_MONEY;
    setGameState(prev => ({
      ...prev,
      money: resetMoney,
      message: `$${INITIAL_MONEY} REFILL GRANTED`
    }));
    setTempBet(0);
    setChipsInPot([]);
    onStatsUpdate(resetMoney, highScore);

    // Hide overlay
    Animated.timing(bankruptcyOpacity, {
      toValue: 0,
      duration: 500,
      useNativeDriver: true,
    }).start(() => setShowBankruptcy(false));
  };

  useEffect(() => {
    // Show bankruptcy screen when money is 0 AND no active bet/chips
    if (isGameStarted && gameState.money === 0 && tempBet === 0 && chipsInPot.length === 0 && gameState.status === 'BETTING') {
      setShowBankruptcy(true);
      Animated.timing(bankruptcyOpacity, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }).start();
    }
  }, [gameState.money, tempBet, chipsInPot.length, gameState.status, isGameStarted]);

  useEffect(() => {
    if (gameState.status === 'GAME_OVER') {
      const newHighScore = Math.max(gameState.money, highScore);
      onStatsUpdate(gameState.money, newHighScore);
    }
  }, [gameState.status]);

  const startNewGame = useCallback(() => {
    if (tempBet < MIN_BET) {
      setGameState(prev => ({ ...prev, message: `MIN BET IS $${MIN_BET}` }));
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

    const isPlayerBJ = isBlackjack(initialPlayerHand.cards);

    if (isPlayerBJ) {
      initialPlayerHand.status = 'BLACKJACK';
      initialPlayerHand.isFinished = true;

      const dealerUpCard = d1;
      const isDealerPotentialBJ = dealerUpCard.rank === 'A' || dealerUpCard.value === 10;

      if (!isDealerPotentialBJ) {
        // Immediate win, no dealer draw needed
        setGameState(prev => ({
          ...prev,
          deck: newDeck,
          playerHands: [initialPlayerHand],
          activeHandIndex: 0,
          dealerHand: [d1, { ...d2, isHidden: false }],
          status: 'DEALER_TURN',
          message: 'BLACKJACK! YOU WIN 3:2',
        }));
      } else {
        // Dealer might have BJ, reveal and check
        const d2Revealed = { ...d2, isHidden: false };
        const isDealerBJ = isBlackjack([d1, d2Revealed]);

        setGameState(prev => ({
          ...prev,
          deck: newDeck,
          playerHands: [initialPlayerHand],
          activeHandIndex: 0,
          dealerHand: [d1, d2Revealed],
          status: 'DEALER_TURN',
          message: isDealerBJ ? 'PUSH (BOTH BLACKJACK)' : 'BLACKJACK! YOU WIN 3:2',
        }));
      }
    } else {
      setGameState(prev => ({
        ...prev,
        deck: newDeck,
        playerHands: [initialPlayerHand],
        activeHandIndex: 0,
        dealerHand: [d1, d2],
        status: 'PLAYING',
        message: 'YOUR MOVE',
        isDealerDone: false,
      }));
    }
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

    addChipToPot(extraBet, extraBet >= 100 ? 100 : (extraBet >= 50 ? 50 : 10), true);

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

    setTempBet(v => v + extraBet);
    setGameState(prev => ({
      ...prev,
      money: prev.money - extraBet,
      deck: newDeck,
      playerHands: nextHands,
      activeHandIndex: nextActiveIndex,
      status: nextStatus,
      dealerHand: nextDealerHand,
      message: isAces ? 'ACES SPLIT' : (hand1.isFinished ? 'HAND 1 DONE' : 'HAND 1 ACTIVE'),
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
      setGameState(prev => ({ ...prev, message: "NOT ENOUGH CASH" }));
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

    addChipToPot(extraBet, extraBet >= 100 ? 100 : (extraBet >= 50 ? 50 : 10), true);

    setTempBet(v => v + extraBet);
    setGameState(prev => ({
      ...prev,
      money: prev.money - extraBet,
      deck: newDeck,
      message: updatedHand.status === 'BUST' ? 'BUSTED!' : 'DOUBLED'
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
      const allBusted = hands.every(h => h.status === 'BUST');

      if (allBusted) {
        // Instant failure - no dealer turn
        const finalHands = hands.map(h => ({ ...h, result: 'LOSS' as const }));
        setGameState(prev => ({
          ...prev,
          playerHands: finalHands,
          status: 'GAME_OVER',
          deck: deck,
          dealerHand: prev.dealerHand.map(c => ({ ...c, isHidden: false })),
          isDealerDone: true,
          message: "BUST! YOU LOSE"
        }));
      } else {
        setGameState(prev => ({
          ...prev,
          playerHands: hands,
          status: 'DEALER_TURN',
          deck: deck,
          dealerHand: prev.dealerHand.map(c => ({ ...c, isHidden: false })),
          message: "DEALER'S TURN",
          isDealerDone: false
        }));
      }
    }
  };

  useEffect(() => {
    if (gameState.status === 'DEALER_TURN') {
      const runDealerTurn = async () => {
        await new Promise(resolve => setTimeout(resolve, 1000));

        let currentDealerHand: CardType[] = [...gameState.dealerHand].map(c => ({ ...c, isHidden: false }));
        let currentDeck = [...gameState.deck];
        let { total1: dt1, total2: dt2 } = calculateHandValue(currentDealerHand);

        // If player has only one hand and it's a Blackjack, dealer doesn't draw
        const isInitialBlackjack = gameState.playerHands.length === 1 && gameState.playerHands[0].status === 'BLACKJACK';

        if (!isInitialBlackjack) {
          while (dt1 < 17 || (dt1 > 21 && dt2 < 17)) {
            await delay(600); // Brisk 600ms delay between cards
            const newCard = currentDeck.pop()!;
            currentDealerHand.push(newCard);
            const nextVal = calculateHandValue(currentDealerHand);
            dt1 = nextVal.total1;
            dt2 = nextVal.total2;

            setGameState(prev => ({
              ...prev,
              dealerHand: [...currentDealerHand],
              deck: [...currentDeck],
              message: "DEALER'S TURN..."
            }));
          }
        }

        setGameState(prev => ({ ...prev, isDealerDone: true }));
        await delay(1000); // Dramatic pause before results

        const dealerBest = getBestValue(dt1, dt2);
        let finalMoney = gameState.money;
        let messages: string[] = [];

        const updatedHands = gameState.playerHands.map((hand, idx) => {
          const { total1, total2 } = calculateHandValue(hand.cards);
          const playerBest = getBestValue(total1, total2);
          const prefix = gameState.playerHands.length > 1 ? `H${idx + 1}: ` : '';

          const updatedHand = { ...hand };

          if (playerBest > 21) {
            messages.push(`${prefix}BUST`);
            updatedHand.result = 'LOSS';
            return updatedHand;
          }

          if (dealerBest > 21 || playerBest > dealerBest) {
            const isBlackjack = hand.status === 'BLACKJACK';
            const winAmount = isBlackjack ? hand.bet * 2.5 : hand.bet * 2;
            finalMoney += winAmount;
            messages.push(isBlackjack ? `${prefix}BJ!` : `${prefix}WIN`);
            updatedHand.result = isBlackjack ? 'BLACKJACK' : 'WIN';
          } else if (playerBest === dealerBest) {
            finalMoney += hand.bet;
            messages.push(`${prefix}PUSH`);
            updatedHand.result = 'PUSH';
          } else {
            messages.push(`${prefix}LOSS`);
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

  useEffect(() => {
    // Sync UI when money changes significantly (e.g. at end of round)
    if (gameState.status === 'GAME_OVER' || gameState.status === 'BETTING') {
      refreshUI();
    }
  }, [gameState.money, gameState.status]);

  const getUniquePotDenoms = useCallback(() => {
    // Get unique denominations from both chips already in pot AND those currently flying
    const denoms = new Set([
      ...chipsInPot.map(c => c.denom),
      ...flyingChips.map(c => c.denom)
    ]);
    return Array.from(denoms).sort((a, b) => a - b);
  }, [chipsInPot, flyingChips]);

  const getChipOffsetX = useCallback((denom: number, uniqueDenoms: number[]) => {
    const localIdx = uniqueDenoms.indexOf(denom);
    if (localIdx === -1) return 0;

    const totalColumns = uniqueDenoms.length;
    const spacing = 52; // Slightly more spacing for better visuals
    // Dynamic centering: (index - midpoint) * spacing
    return (localIdx - (totalColumns - 1) / 2) * spacing;
  }, []);

  const refreshUI = useCallback(() => {
    const uniqueDenoms = getUniquePotDenoms();
    setChipsInPot(prev => {
      const counts: Record<number, number> = {};
      return prev.map(c => {
        const offsetX = getChipOffsetX(c.denom, uniqueDenoms);
        const count = counts[c.denom] || 0;
        const offsetY = -count * 4;
        counts[c.denom] = count + 1;
        return { ...c, offsetX, offsetY, rotation: 0 };
      });
    });
  }, [getUniquePotDenoms, getChipOffsetX]);

  const resetGame = () => {
    setGameState(prev => ({
      ...prev,
      money: prev.money + (prev.status === 'BETTING' ? tempBet : 0),
      status: 'BETTING',
      message: '',
      playerHands: [],
      dealerHand: [],
      activeHandIndex: 0,
      isDealerDone: false
    }));
    setTempBet(0);
    setChipsInPot([]);
  };


  const removeChipFromPot = (chipId: number) => {
    if (gameState.status !== 'BETTING') return;

    const chipToRemove = chipsInPot.find(c => c.id === chipId);
    if (!chipToRemove) return;

    // Fix: Move side effects out of the setChipsInPot updater to avoid double-firing 
    // and ensure synchronous updates with current values.
    const chipValue = chipToRemove.value;

    setGameState(state => ({ ...state, money: state.money + chipValue }));
    setTempBet(v => v - chipValue);

    setChipsInPot(prev => {
      const newChips = prev.filter(c => c.id !== chipId);
      // Recalculate will be handled by refreshUI effect or manually here?
      // Let's do it manually for immediate feedback
      const denoms = new Set(newChips.map(c => c.denom));
      const sortedDenoms = Array.from(denoms).sort((a, b) => a - b);

      const counts: Record<number, number> = {};
      return newChips.map(c => {
        const offsetX = getChipOffsetX(c.denom, sortedDenoms);
        const count = counts[c.denom] || 0;
        const offsetY = -count * 4;
        counts[c.denom] = count + 1;
        return { ...c, offsetX, offsetY, rotation: 0 };
      });
    });
  };

  const addChipToPot = (value: number, denom: number, silent = false) => {
    const id = Date.now();

    // Calculate positions based on what WILL be in the pot (current + this new one)
    const currentDenoms = new Set([...chipsInPot.map(c => c.denom), ...flyingChips.map(c => c.denom), denom]);
    const sortedDenoms = Array.from(currentDenoms).sort((a, b) => a - b);

    const inPot = chipsInPot.filter(c => c.denom === denom).length;
    const flying = flyingChips.filter(c => c.denom === denom).length;
    const currentCount = inPot + flying;

    const offsetX = getChipOffsetX(denom, sortedDenoms);
    const offsetY = -currentCount * 4;
    const rotation = 0;

    // Shift ALL existing chips in the pot immediately to make room for the new set of columns
    setChipsInPot(prev => {
      const counts: Record<number, number> = {};
      return prev.map(c => {
        const offX = getChipOffsetX(c.denom, sortedDenoms);
        const count = counts[c.denom] || 0;
        const offY = -count * 4;
        counts[c.denom] = count + 1;
        return { ...c, offsetX: offX, offsetY: offY, rotation: 0 };
      });
    });

    const anim = new Animated.ValueXY({ x: 0, y: 150 });
    setFlyingChips(prev => [...prev, { id, value, denom, anim }]);

    Animated.sequence([
      Animated.timing(anim, {
        toValue: { x: offsetX, y: offsetY },
        duration: 400,
        easing: Easing.out(Easing.back(1.5)),
        useNativeDriver: true,
      }),
      Animated.timing(potScale, {
        toValue: 1.1,
        duration: 50,
        useNativeDriver: true
      }),
      Animated.timing(potScale, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true
      })
    ]).start(() => {
      setChipsInPot(prev => [...prev, { id, value, denom, offsetX, offsetY, rotation }]);
      setFlyingChips(prev => prev.filter(c => c.id !== id));
      if (!silent) setTempBet(v => v + value);
    });
  };

  const handleChipPress = (value: number, denom: number) => {
    if (gameState.money < value) return; // Only check the chip being added
    setActivePulseDenom(denom);
    setTimeout(() => setActivePulseDenom(null), 300);

    // Deduct money and add bet immediately
    setGameState(prev => ({ ...prev, money: prev.money - value }));
    setTempBet(v => v + value);

    addChipToPot(value, denom, true);
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

  const isUserWinning = gameState.status === 'GAME_OVER' && (gameState.message.includes('WIN') || gameState.message.includes('BJ!'));

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.bankrollLabel}>BANKROLL</Text>
          <Text style={styles.bankrollValue}>${gameState.money}</Text>
        </View>
        <TouchableOpacity
          onPress={() => setShowSettings(true)}
          style={styles.settingsHeaderBtn}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Text style={styles.settingsHeaderIcon}>⚙</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.table}>
        {/* Dealer Hand */}
        <View style={styles.dealerArea}>
          <Hand
            position="top"
            cards={gameState.dealerHand}
            isFinished={gameState.isDealerDone || gameState.status === 'GAME_OVER'}
          />
        </View>

        {/* Message Area */}
        <View style={styles.messageArea}>
          <Text style={[styles.messageText, isUserWinning && { color: '#4ade80' }]}>
            {gameState.message}
          </Text>
        </View>

        {/* Player Hands */}
        <View style={styles.playerArea}>
          {gameState.playerHands.map((hand, idx) => (
            <View key={idx} style={[styles.handContainer, gameState.activeHandIndex !== idx && { opacity: 0.5 }]}>
              <Hand
                position="bottom"
                cards={hand.cards}
                isFinished={hand.isFinished || gameState.status === 'GAME_OVER'}
                hand={hand}
              />
            </View>
          ))}
        </View>
      </View>

      {/* Control Area */}
      <View style={styles.controls}>
        <View style={styles.betInfo}>
          <View style={styles.betBadge}>
            <Text style={styles.betLabel}>BET</Text>
            <Text style={styles.betValue}>
              ${gameState.status === 'BETTING' ? tempBet : gameState.playerHands.reduce((acc, h) => acc + h.bet, 0)}
            </Text>
          </View>
        </View>

        <Animated.View style={[styles.potZone, { transform: [{ scale: potScale }] }]}>
          {chipsInPot.map((chip, idx) => (
            <TouchableOpacity
              key={chip.id}
              activeOpacity={0.8}
              onPress={() => removeChipFromPot(chip.id)}
              disabled={gameState.status !== 'BETTING'}
              style={{
                position: 'absolute',
                transform: [
                  { translateX: chip.offsetX },
                  { translateY: chip.offsetY },
                  { rotate: `${chip.rotation}deg` }
                ],
                zIndex: idx
              }}
            >
              <CasinoChip
                value={chip.value}
                denom={chip.denom}
                size={44}
              />
            </TouchableOpacity>
          ))}

          {flyingChips.map(chip => (
            <Animated.View
              key={chip.id}
              style={{
                position: 'absolute',
                transform: chip.anim.getTranslateTransform()
              }}
            >
              <CasinoChip value={chip.value} denom={chip.denom} size={44} />
            </Animated.View>
          ))}

          {chipsInPot.length === 0 && flyingChips.length === 0 && gameState.status === 'BETTING' && (
            <Text style={styles.potPlaceholder}>PLACE YOUR BET</Text>
          )}
        </Animated.View>

        {gameState.status === 'BETTING' && (
          <View style={styles.betControls}>
            <View style={styles.chipsRow}>
              {CHIP_CONFIG.filter(c => (gameState.money + tempBet) >= c.minBalance).map(chip => (
                <TouchableOpacity key={chip.denom} onPress={() => handleChipPress(chip.denom, chip.denom as any)}>
                  <CasinoChip
                    value={chip.denom}
                    denom={chip.denom}
                    size={width > 400 ? 54 : 48}
                    style={activePulseDenom === chip.denom && styles.chipActive}
                  />
                </TouchableOpacity>
              ))}
            </View>
            <TouchableOpacity
              onPress={startNewGame}
              disabled={tempBet === 0}
              style={[styles.dealButton, tempBet === 0 && styles.dealButtonDisabled]}
            >
              <Text style={styles.dealButtonText}>DEAL</Text>
            </TouchableOpacity>
          </View>
        )}

        {gameState.status === 'PLAYING' && (
          <View style={styles.actionControls}>
            <View style={styles.actionRow}>
              <TouchableOpacity onPress={hit} style={[styles.actionButton, styles.hitButton]}>
                <Text style={styles.actionButtonText}>HIT</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={stand} style={[styles.actionButton, styles.standButton]}>
                <Text style={styles.actionButtonText}>STAND</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.actionRow}>
              {canDouble && (
                <TouchableOpacity onPress={doubleDown} style={[styles.actionButton, styles.doubleButton]}>
                  <Text style={styles.actionButtonText}>DOUBLE</Text>
                </TouchableOpacity>
              )}
              {canSplit && (
                <TouchableOpacity onPress={split} style={[styles.actionButton, styles.splitButton]}>
                  <Text style={styles.actionButtonText}>SPLIT</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        )}

        {gameState.status === 'GAME_OVER' && (
          <TouchableOpacity onPress={resetGame} style={styles.nextHandButton}>
            <Text style={styles.nextHandButtonText}>NEXT HAND</Text>
          </TouchableOpacity>
        )}
      </View>


      {/* In-Game Settings Overlay */}
      {showSettings && (
        <>
          <TouchableOpacity
            style={styles.settingsBackdrop}
            activeOpacity={1}
            onPress={() => setShowSettings(false)}
          />
          <View style={styles.settingsModal}>
            {/* Close button */}
            <TouchableOpacity
              style={styles.settingsCloseBtn}
              onPress={() => setShowSettings(false)}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Text style={styles.settingsCloseText}>✕</Text>
            </TouchableOpacity>

            {/* Music */}
            <View style={styles.settingsSliderRow}>
              <Text style={styles.settingsSliderLabel}>Music</Text>
              <Text style={styles.settingsSliderValue}>{musicVolume}%</Text>
            </View>
            <VolumeSlider value={musicVolume} onChange={onChangeMusicVolume} />

            <View style={styles.settingsDivider} />

            {/* Game Sound */}
            <View style={styles.settingsSliderRow}>
              <Text style={styles.settingsSliderLabel}>Game Sound</Text>
              <Text style={styles.settingsSliderValue}>{gameVolume}%</Text>
            </View>
            <VolumeSlider value={gameVolume} onChange={onChangeGameVolume} />

            <View style={styles.settingsDivider} />

            {/* Main Menu */}
            <TouchableOpacity
              style={styles.settingsMenuBtn}
              activeOpacity={0.8}
              onPress={() => {
                setShowSettings(false);
                onGoToMenu?.();
              }}
            >
              <Text style={styles.settingsMenuBtnText}>Main Menu</Text>
            </TouchableOpacity>
          </View>
        </>
      )}

      {/* Bankruptcy Overlay */}
      {showBankruptcy && (
        <Animated.View style={[styles.overlay, { opacity: bankruptcyOpacity, zIndex: 200 }]}>
          <View style={styles.overlayContent}>
            <Text style={styles.bankruptcyTitle}>GAME OVER</Text>
            <TouchableOpacity style={styles.bankruptcyBtn} onPress={handleBankruptcyReset}>
              <Text style={styles.bankruptcyBtnText}>${INITIAL_MONEY} ENTRY</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#064e3b', // Deep felt green
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: 'rgba(0,0,0,0.3)',
    marginHorizontal: 15,
    borderRadius: 15,
    marginTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  bankrollLabel: {
    fontSize: 9,
    color: 'rgba(255,255,255,0.4)',
    fontWeight: '900',
    letterSpacing: 1,
  },
  bankrollValue: {
    fontSize: 20,
    fontWeight: '900',
    color: '#FFD700', // Casino Gold
  },
  settingsHeaderBtn: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 4,
  },
  settingsHeaderIcon: {
    fontSize: 22,
    color: 'rgba(255,255,255,0.55)',
  },
  table: {
    flex: 1,
    justifyContent: 'space-between',
    paddingVertical: 20,
  },
  dealerArea: {
    alignItems: 'center',
  },
  messageArea: {
    alignItems: 'center',
    height: 40,
    justifyContent: 'center',
  },
  messageText: {
    fontSize: 22,
    fontWeight: '900',
    color: 'white',
    letterSpacing: -1,
    textTransform: 'uppercase',
  },
  playerArea: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  handContainer: {
    alignItems: 'center',
  },
  controls: {
    paddingBottom: 20,
    paddingHorizontal: 10,
  },
  betInfo: {
    alignItems: 'center',
    marginBottom: 5,
  },
  betBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.8)',
    paddingHorizontal: 15,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  betLabel: {
    fontSize: 10,
    fontWeight: '900',
    color: 'rgba(255,255,255,0.4)',
    marginRight: 8,
  },
  betValue: {
    fontSize: 16,
    fontWeight: '900',
    color: '#FFD700', // Casino Gold
  },
  potZone: {
    height: 80,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 40,
    backgroundColor: 'rgba(0,0,0,0.1)',
  },
  potPlaceholder: {
    fontSize: 12,
    fontWeight: '900',
    color: 'rgba(255,255,255,0.1)',
    letterSpacing: 2,
  },
  betControls: {
    gap: 15,
  },
  chipsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 20,
  },
  dealButton: {
    backgroundColor: '#f59e0b',
    paddingVertical: 15,
    borderRadius: 18,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8,
  },
  dealButtonDisabled: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    opacity: 0.5,
  },
  dealButtonText: {
    fontSize: 20,
    fontWeight: '900',
    color: 'black',
  },
  actionControls: {
    gap: 10,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 10,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 18,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8,
  },
  hitButton: {
    backgroundColor: 'white',
  },
  standButton: {
    backgroundColor: '#dc2626',
  },
  doubleButton: {
    backgroundColor: '#f59e0b',
  },
  splitButton: {
    backgroundColor: '#3b82f6',
  },
  actionButtonText: {
    fontSize: 18,
    fontWeight: '900',
    color: 'black',
  },
  nextHandButton: {
    backgroundColor: '#f59e0b',
    paddingVertical: 18,
    borderRadius: 18,
    alignItems: 'center',
    marginTop: 10,
  },
  nextHandButtonText: {
    fontSize: 18,
    fontWeight: '900',
    color: 'black',
  },
  chipShadowWrapper: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 5,
    elevation: 8,
  },
  chipBase: {
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.4)',
    overflow: 'hidden',
  },
  chipInnerRing: {
    position: 'absolute',
    width: '85%',
    height: '85%',
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: 'rgba(255,255,255,0.3)',
  },
  chipInlay: {
    width: '72%',
    height: '72%',
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
  },
  chipText: {
    fontWeight: '900',
    color: 'black',
  },
  chipActive: {
    transform: [{ scale: 1.15 }],
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 30,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.85)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlayContent: {
    alignItems: 'center',
    padding: 20,
  },
  settingsBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.72)',
    zIndex: 300,
  },
  settingsModal: {
    position: 'absolute',
    left: 24,
    right: 24,
    top: '25%',
    zIndex: 301,
    backgroundColor: '#054a38',
    borderRadius: 20,
    paddingTop: 44,
    paddingHorizontal: 24,
    paddingBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.6,
    shadowRadius: 20,
    elevation: 24,
  },
  settingsCloseBtn: {
    position: 'absolute',
    top: 12,
    right: 14,
    padding: 6,
  },
  settingsCloseText: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.45)',
    fontWeight: '600',
  },
  settingsSliderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  settingsSliderLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
  },
  settingsSliderValue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#eab84e',
    minWidth: 40,
    textAlign: 'right',
  },
  settingsDivider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.08)',
    marginVertical: 16,
  },
  settingsMenuBtn: {
    backgroundColor: '#deb737',
    paddingVertical: 14,
    borderRadius: 30,
    alignItems: 'center',
    shadowColor: '#eab84e',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  settingsMenuBtnText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#1a1a1a',
    letterSpacing: 0.3,
  },
  bankruptcyTitle: {
    fontSize: 32,
    fontWeight: '900',
    color: '#ef4444',
    marginBottom: 30,
  },
  bankruptcyBtn: {
    backgroundColor: '#7c3aed',
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: '#a78bfa',
  },
  bankruptcyBtnText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '900',
  },
});

export default App;
